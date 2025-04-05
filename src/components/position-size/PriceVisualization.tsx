import { TooltipProvider } from "@/components/ui/tooltip"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { PriceCircle } from "./visualization/PriceCircle"
import { PriceRangeBar } from "./visualization/PriceRangeBar"
import { PositionIndicator } from "./visualization/PositionIndicator"
import { BECircle } from "./visualization/BECircle"
import { formatDate } from "./utils/formatters"
import { formatNumber } from "./utils/formatters"

interface PriceVisualizationProps {
  position: any
}

const calculatePositions = (position: any, beStrikes: { be0: number; be1: number; be2: number }) => {
  const middlePosition = 50 // underlying_price_entry is always at 50%
  const underlyingPrice = position.underlying_price_entry
  
  // Collect all valid strikes
  const strikes = [
    position.strike_entry,
    position.action.includes('spread') ? position.strike_exit : null,
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
    leftPosition: calculateRelativePosition(position.strike_entry),
    middlePosition,
    rightPosition: position.action.includes('spread') 
      ? calculateRelativePosition(position.strike_exit)
      : calculateRelativePosition(position.strike_entry),
    be0Position: calculateRelativePosition(beStrikes.be0),
    be1Position: calculateRelativePosition(beStrikes.be1),
    be2Position: calculateRelativePosition(beStrikes.be2)
  }
}

const calculatePremium = (position: any, contracts: number) => {
  const action = position.action?.toLowerCase() || ''
  const premium = (position.premium_entry - position.premium_exit) * contracts * 100
  const roundedPremium = Math.round(premium)
  
  if (action.includes('sell')) {
    return Math.abs(roundedPremium)
  } else if (action.includes('buy')) {
    return -Math.abs(roundedPremium)
  }
  return roundedPremium
}

export function PriceVisualization({ position }: PriceVisualizationProps) {
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

  const contracts = Math.round((latestBalance * (position.exposure/100)) / (position.strike_entry) / 100)
  const premium = calculatePremium(position, contracts)
  
  // Calculate days until expiration
  const today = new Date()
  const expirationDate = position.expiration ? new Date(position.expiration) : today
  const daysUntilExpiration = Math.max(0, (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const yearsUntilExpiration = daysUntilExpiration / 365
  
  // Calculate BE strikes
  const exposureAmount = latestBalance ? (position.exposure * latestBalance) / 100 : 0
  const be0Strike = position.underlying_price_entry - (premium/contracts/100)
  const be1Strike = position.underlying_price_entry + ((exposureAmount*((position.risk_free_yield*yearsUntilExpiration)/100))/contracts/100)
  const be2Strike = position.underlying_price_entry + ((exposureAmount*(7*yearsUntilExpiration/100))/contracts/100)

  // Calculate positions using new function
  const positions = calculatePositions(position, {
    be0: be0Strike,
    be1: be1Strike,
    be2: be2Strike
  })
  
  return (
    <TooltipProvider delayDuration={100}>
      <div className="mt-12 mb-10 relative">
        {/* Underlying Price Circle (Middle) */}
        <PriceCircle 
          price={position.underlying_price_entry}
          position={positions.middlePosition}
          label="Underlying price"
        />
        <div 
            className="absolute -translate-x-1/2 -top-6 flex flex-col items-center z-10"
            style={{ left: `${underlyingPos}%` }}
          >
            <Tooltip>
              <TooltipTrigger>
                <span className="text-sm text-black mb-1">${formatNumber(dividend.underlying_price, 2)}</span>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white">
                Underlying price: ${formatNumber(dividend.underlying_price, 2)}
              </TooltipContent>
            </Tooltip>
            <Circle className="h-4 w-4 fill-black text-black" />
          </div>
        
        {/* Strike Entry Circle */}
        <PriceCircle 
          price={position.strike_entry}
          position={positions.leftPosition}
          label="Entry strike"
        />
        
        {/* Strike Exit Circle (only for spreads) */}
        {position.action.includes('spread') && (
          <PriceCircle 
            price={position.strike_exit}
            position={positions.rightPosition}
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
          leftPosition={positions.leftPosition}
          middlePosition={positions.middlePosition}
          rightPosition={positions.rightPosition}
          action={position.action}
        />
        
        {/* Position indicators */}
        <PositionIndicator
          position={positions.leftPosition}
          contracts={contracts}
          premium={position.premium_entry}
          type="entry"
        />
        
        {position.action.includes('spread') && (
          <PositionIndicator
            position={positions.rightPosition}
            contracts={contracts}
            premium={position.premium_exit}
            type="exit"
          />
        )}
      </div>
    </TooltipProvider>
  )
}