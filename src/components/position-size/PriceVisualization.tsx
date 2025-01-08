import { TooltipProvider } from "@/components/ui/tooltip"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { PriceCircle } from "./visualization/PriceCircle"
import { PriceRangeBar } from "./visualization/PriceRangeBar"
import { PositionIndicator } from "./visualization/PositionIndicator"
import { BECircle } from "./visualization/BECircle"

interface PriceVisualizationProps {
  note: any
}

const calculatePositions = (note: any) => {
  const middlePosition = 50 // underlying_price_entry is always at 50%
  let leftPosition, rightPosition

  if (note.action.includes('spread')) {
    // Calculate distances from underlying price
    const entryDistance = Math.abs(note.strike_entry - note.underlying_price_entry)
    const exitDistance = Math.abs(note.strike_exit - note.underlying_price_entry)
    
    // Determine which strike is furthest from underlying price
    if (entryDistance >= exitDistance) {
      // strike_entry is furthest
      leftPosition = note.strike_entry < note.underlying_price_entry ? 10 : 90
      // Calculate exit position proportionally
      const ratio = (note.strike_exit - note.underlying_price_entry) / (note.strike_entry - note.underlying_price_entry)
      rightPosition = middlePosition + (leftPosition - middlePosition) * ratio
    } else {
      // strike_exit is furthest
      rightPosition = note.strike_exit < note.underlying_price_entry ? 10 : 90
      // Calculate entry position proportionally
      const ratio = (note.strike_entry - note.underlying_price_entry) / (note.strike_exit - note.underlying_price_entry)
      leftPosition = middlePosition + (rightPosition - middlePosition) * ratio
    }
  } else {
    // For non-spreads, only position strike_entry
    leftPosition = note.strike_entry < note.underlying_price_entry ? 10 : 90
    rightPosition = leftPosition // Not used but needed for the range bar
  }

  return { leftPosition, middlePosition, rightPosition }
}

const calculatePremium = (note: any, contracts: number) => {
  const action = note.action?.toLowerCase() || ''
  const premium = (note.premium_entry - note.premium_exit) * contracts * 100
  const roundedPremium = Math.round(premium)
  
  if (action.includes('sell')) {
    return Math.abs(roundedPremium)
  } else if (action.includes('buy')) {
    return -Math.abs(roundedPremium)
  }
  return roundedPremium
}

const calculateBEPosition = (beStrike: number, note: any, positions: any) => {
  const minStrike = Math.min(note.strike_entry, note.strike_exit, note.underlying_price_entry)
  const maxStrike = Math.max(note.strike_entry, note.strike_exit, note.underlying_price_entry)
  
  // If BE strike is outside the range, return edge positions
  if (beStrike <= minStrike) return 0
  if (beStrike >= maxStrike) return 100
  
  // For strikes within range, do linear interpolation
  const ratio = (beStrike - minStrike) / (maxStrike - minStrike)
  return ratio * 100
}

export function PriceVisualization({ note }: PriceVisualizationProps) {
  const positions = calculatePositions(note)
  const { leftPosition, middlePosition, rightPosition } = positions
  
  const { data: latestBalance = 0 } = useQuery({
    queryKey: ['latest-balance'],
    queryFn: async () => {
      const { data } = await supabase
        .from('portfolio_data')
        .select('balance')
        .order('month', { ascending: false })
        .limit(1)
      return data?.[0]?.balance || 0
    }
  })

  const contracts = Math.round((latestBalance * (note.exposure/100)) / (note.strike_entry) / 100)
  const premium = calculatePremium(note, contracts)
  
  // Calculate days until expiration
  const today = new Date()
  const expirationDate = note.expiration ? new Date(note.expiration) : today
  const daysUntilExpiration = Math.max(0, (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const yearsUntilExpiration = daysUntilExpiration / 365
  
  // Calculate BE strikes with updated formulas using the consistent premium calculation
  const exposureAmount = latestBalance ? (note.exposure * latestBalance) / 100 : 0
  const be0Strike = note.underlying_price_entry - (premium/contracts/100)
  const be1Strike = note.underlying_price_entry + ((exposureAmount*((note.risk_free_yield*yearsUntilExpiration)/100))/contracts/100)
  const be2Strike = note.underlying_price_entry + ((exposureAmount*(7*yearsUntilExpiration/100))/contracts/100)

  // Calculate BE positions
  const be0Position = calculateBEPosition(be0Strike, note, positions)
  const be1Position = calculateBEPosition(be1Strike, note, positions)
  const be2Position = calculateBEPosition(be2Strike, note, positions)
  
  return (
    <TooltipProvider delayDuration={100}>
      <div className="mt-12 mb-20 relative">
        {/* Underlying Price Circle (Middle) */}
        <PriceCircle 
          price={note.underlying_price_entry}
          position={middlePosition}
          label="Underlying price"
        />
        
        {/* Strike Entry Circle */}
        <PriceCircle 
          price={note.strike_entry}
          position={leftPosition}
          label="Entry strike"
        />
        
        {/* Strike Exit Circle (only for spreads) */}
        {note.action.includes('spread') && (
          <PriceCircle 
            price={note.strike_exit}
            position={rightPosition}
            label="Exit strike"
          />
        )}

        {/* BE Circles */}
        <BECircle 
          price={be0Strike}
          position={be0Position}
          beNumber={0}
        />
        <BECircle 
          price={be1Strike}
          position={be1Position}
          beNumber={1}
        />
        <BECircle 
          price={be2Strike}
          position={be2Position}
          beNumber={2}
        />
        
        {/* Price range bar */}
        <PriceRangeBar 
          leftPosition={leftPosition}
          middlePosition={middlePosition}
          rightPosition={rightPosition}
          action={note.action}
        />
        
        {/* Position indicators */}
        <PositionIndicator
          position={leftPosition}
          contracts={contracts}
          premium={note.premium_entry}
          type="entry"
        />
        
        {note.action.includes('spread') && (
          <PositionIndicator
            position={rightPosition}
            contracts={contracts}
            premium={note.premium_exit}
            type="exit"
          />
        )}
      </div>
    </TooltipProvider>
  )
}