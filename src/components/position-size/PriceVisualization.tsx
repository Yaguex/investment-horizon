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

const calculatePositions = (note: any, beStrikes: { be0: number; be1: number; be2: number }) => {
  const middlePosition = 50 // underlying_price_entry is always at 50%
  const underlyingPrice = note.underlying_price_entry
  
  // Collect all valid strikes
  const strikes = [
    note.strike_entry,
    note.action.includes('spread') ? note.strike_exit : null,
    beStrikes.be0,
    beStrikes.be1,
    beStrikes.be2
  ].filter(strike => strike !== null && strike !== undefined)

  // Find strike furthest from underlying price
  let maxDistance = 0
  let furthestStrike = strikes[0]

  strikes.forEach(strike => {
    const distance = Math.abs(strike - underlyingPrice)
    if (distance > maxDistance) {
      maxDistance = distance
      furthestStrike = strike
    }
  })

  // Calculate position for each strike based on furthest strike
  const calculateRelativePosition = (strike: number) => {
    if (strike === underlyingPrice) return middlePosition
    
    const isFurthest = strike === furthestStrike
    const isBelow = strike < underlyingPrice
    
    if (isFurthest) {
      return isBelow ? 10 : 90
    }

    // Linear interpolation between 10/90 and 50
    const ratio = Math.abs(strike - underlyingPrice) / maxDistance
    return isBelow
      ? middlePosition - (ratio * (middlePosition - 10))
      : middlePosition + (ratio * (90 - middlePosition))
  }

  return {
    leftPosition: calculateRelativePosition(note.strike_entry),
    middlePosition,
    rightPosition: note.action.includes('spread') 
      ? calculateRelativePosition(note.strike_exit)
      : calculateRelativePosition(note.strike_entry),
    be0Position: calculateRelativePosition(beStrikes.be0),
    be1Position: calculateRelativePosition(beStrikes.be1),
    be2Position: calculateRelativePosition(beStrikes.be2)
  }
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

export function PriceVisualization({ note }: PriceVisualizationProps) {
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
  
  // Calculate BE strikes
  const exposureAmount = latestBalance ? (note.exposure * latestBalance) / 100 : 0
  const be0Strike = note.underlying_price_entry - (premium/contracts/100)
  const be1Strike = note.underlying_price_entry + ((exposureAmount*((note.risk_free_yield*yearsUntilExpiration)/100))/contracts/100)
  const be2Strike = note.underlying_price_entry + ((exposureAmount*(7*yearsUntilExpiration/100))/contracts/100)

  // Calculate positions using new function
  const positions = calculatePositions(note, {
    be0: be0Strike,
    be1: be1Strike,
    be2: be2Strike
  })
  
  return (
    <TooltipProvider delayDuration={100}>
      <div className="mt-12 mb-10 relative">
        {/* Underlying Price Circle (Middle) */}
        <PriceCircle 
          price={note.underlying_price_entry}
          position={positions.middlePosition}
          label="Underlying price"
        />
        
        {/* Strike Entry Circle */}
        <PriceCircle 
          price={note.strike_entry}
          position={positions.leftPosition}
          label="Entry strike"
        />
        
        {/* Strike Exit Circle (only for spreads) */}
        {note.action.includes('spread') && (
          <PriceCircle 
            price={note.strike_exit}
            position={positions.rightPosition}
            label="Exit strike"
          />
        )}

        {/* BE Circles */}
        <BECircle 
          price={be0Strike}
          position={positions.be0Position}
          beNumber={0}
        />
        <BECircle 
          price={be1Strike}
          position={positions.be1Position}
          beNumber={1}
        />
        <BECircle 
          price={be2Strike}
          position={positions.be2Position}
          beNumber={2}
        />
        
        {/* Price range bar */}
        <PriceRangeBar 
          leftPosition={positions.leftPosition}
          middlePosition={positions.middlePosition}
          rightPosition={positions.rightPosition}
          action={note.action}
        />
        
        {/* Position indicators */}
        <PositionIndicator
          position={positions.leftPosition}
          contracts={contracts}
          premium={note.premium_entry}
          type="entry"
        />
        
        {note.action.includes('spread') && (
          <PositionIndicator
            position={positions.rightPosition}
            contracts={contracts}
            premium={note.premium_exit}
            type="exit"
          />
        )}
      </div>
    </TooltipProvider>
  )
}