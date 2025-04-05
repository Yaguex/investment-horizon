
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Circle } from "lucide-react"
import { formatDate, formatNumber } from "./utils/formatters"

interface PriceVisualizationProps {
  position: any
}

interface PriceCircleProps {
  price: number
  position: number
  label: string
  variant?: 'primary' | 'secondary'
}


// Lower case the wording the Action form dropdown for better use within the code
const action = position.action?.toLowerCase() || ''

// Calculate days until expiration
const today = new Date()
const expirationDate = position.expiration ? new Date(position.expiration) : today
const daysUntilExpiration = Math.max(0, (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
const yearsUntilExpiration = daysUntilExpiration / 365

// Calculate underlyingPrice and contracts
const underlyingPrice = position.underlying_price_entry
const contracts = formatNumber((position.nominal / position.strike_entry / 100), 0)

// Calculate premium and convert it into a credit or debit depending on whether we are buying or selling options
const premiumraw = (position.premium_entry - position.premium_exit) * contracts * 100
let premium = 0;  // Default to zero
if (action.toLowerCase().includes('sell')) {
  premium = Math.abs(premiumraw);
} else if (action.toLowerCase().includes('buy')) {
  premium = -Math.abs(premiumraw);
} else {
  console.warn('Unknown action type, neither a buy or a sell:', action);
}


// Calculate BE strikes
const be0Strike = ((position.strike_exit  * contracts * 100) + premium) / (contracts * 100)
const be1Strike = (1 + (position.bond_yield/100)) * ((position.strike_exit  * contracts * 100) + premium) / (contracts * 100)
const be2Strike = (1 + (7/100)) * ((position.strike_exit  * contracts * 100) + premium) / (contracts * 100)

// Calculate element positions in bar using new function
const circlePositions = calculatePositions(position, {
  be0: be0Strike,
  be1: be1Strike,
  be2: be2Strike
})


interface BECircleProps {
  price: number
  position: number
  beNumber: number
}

interface PriceRangeBarProps {
  leftPosition: number
  middlePosition: number
  rightPosition: number
  action: string
}

function PriceRangeBar({ leftPosition, middlePosition, rightPosition, action }: PriceRangeBarProps) {
  const isSpread = action.includes('spread')
  const isBuy = action.toLowerCase().includes('buy')
  const isPut = action.toLowerCase().includes('put')
  
  // Determine the color based on whether it's a buy or sell
  const color = isBuy ? 'bg-green-500' : 'bg-red-500'
  
  // Calculate start and end positions based on action type
  let start: number, end: number
  
  if (isSpread) {
    // For spreads, use the calculated positions directly
    start = Math.min(leftPosition, rightPosition)
    end = Math.max(leftPosition, rightPosition)
  } else {
    // For single options
    start = leftPosition
    if (isPut) {
      // Puts stretch to 0%
      end = 0
    } else {
      // Calls stretch to 100%
      end = 100
    }
  }
  
  return (
    <div className="w-full bg-gray-100 rounded-lg h-4 relative overflow-hidden">
      <div 
        className={`absolute top-0 bottom-0 ${color}`}
        style={{ 
          left: `${Math.min(start, end)}%`,
          width: `${Math.abs(end - start)}%`
        }}
      />
    </div>
  )
}

interface PositionIndicatorProps {
  position: number
  contracts: number
  premium: number
  type: 'entry' | 'exit'
}


const calculatePositions = (position: any, beStrikes: { be0: number; be1: number; be2: number }) => {
  const middlePosition = 50 // underlying_price_entry is always at 50%

  
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

function PositionIndicator({ position, contracts, premium, type }: PositionIndicatorProps) {
  return (
    <div 
      className="absolute -translate-x-1/2 top-8 flex flex-col items-center"
      style={{ left: `${position}%` }}
    >
      <span className="text-xs text-black">
        <span className="font-bold">{type === 'entry' ? '-' : '+'}{contracts}P</span> for ${formatNumber(premium, 2)}
      </span>
    </div>
  )
}

function PriceCircle({ price, position, label, variant = 'primary' }: PriceCircleProps) {
  const style = variant === 'primary' 
    ? { fill: 'rgb(0,0,0)', color: 'rgb(0,0,0)' }
    : { fill: 'rgba(0,0,0,0.2)', color: 'rgba(0,0,0,0.2)' }

  return (
    <div 
      className="absolute -translate-x-1/2 -top-6 flex flex-col items-center z-10"
      style={{ left: `${position}%` }}
    >
      <Tooltip>
        <TooltipTrigger>
          <span className={`text-sm mb-1 ${variant === 'primary' ? 'text-black' : 'text-gray-300'}`}>
            ${Math.round(price)}
          </span>
        </TooltipTrigger>
        <TooltipContent className="bg-black text-white">
          {label}: ${price}
        </TooltipContent>
      </Tooltip>
      <Circle className="h-4 w-4" style={style} />
    </div>
  )
}

function BECircle({ price, position, beNumber }: BECircleProps) {
  const style = { fill: 'rgba(0,0,0,0.2)', color: 'rgba(0,0,0,0.2)' }
  const clampedPosition = Math.max(0, Math.min(100, position))

  return (
    <div 
      className="absolute -translate-x-1/2 -top-6 flex flex-col items-center z-10"
      style={{ left: `${clampedPosition}%` }}
    >
      <Tooltip>
        <TooltipTrigger>
          <span className="text-sm mb-1 text-gray-300">
            ${Math.round(price)}
          </span>
        </TooltipTrigger>
        <TooltipContent className="bg-black text-white">
          BE {beNumber}: ${price.toFixed(2)}
        </TooltipContent>
      </Tooltip>
      <Circle className="h-4 w-4" style={style} />
    </div>
  )
}
  
  return (
    <TooltipProvider delayDuration={100}>
      <div className="mt-12 mb-10 relative">
        {/* Underlying Price Circle (Middle) */}
        <PriceCircle 
          price={position.underlying_price_entry}
          position={circlePositions.middlePosition}
          label="Underlying price"
        />
        
        
        {/* Strike Entry Circle */}
        <PriceCircle 
          price={position.strike_entry}
          position={circlePositions.leftPosition}
          label="Entry strike"
        />
        
        {/* Strike Exit Circle (only for spreads) */}
        {position.action.includes('spread') && (
          <PriceCircle 
            price={position.strike_exit}
            position={circlePositions.rightPosition}
            label="Exit strike"
          />
        )}

        {/* BE Circles */}
        <BECircle 
          price={be0Strike}
          position={circlePositions.be0}
          beNumber={0}
        />
        <BECircle 
          price={be1Strike}
          position={circlePositions.be1}
          beNumber={1}
        />
        <BECircle 
          price={be2Strike}
          position={circlePositions.be2}
          beNumber={2}
        />
        
        {/* Price range bar */}
        <PriceRangeBar 
          leftPosition={circlePositions.leftPosition}
          middlePosition={circlePositions.middlePosition}
          rightPosition={circlePositions.rightPosition}
          action={position.action}
        />
        
        {/* Position indicators */}
        <PositionIndicator
          position={circlePositions.leftPosition}
          contracts={contracts}
          premium={position.premium_entry}
          type="entry"
        />
        
        {position.action.includes('spread') && (
          <PositionIndicator
            position={circlePositions.rightPosition}
            contracts={contracts}
            premium={position.premium_exit}
            type="exit"
          />
        )}
      </div>
    </TooltipProvider>
  )
}
