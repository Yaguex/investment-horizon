
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

export function PriceVisualization({ position }: PriceVisualizationProps) {
  // Lower case the wording the Action form dropdown for better use within the code
  const action = position.action?.toLowerCase() || ''

  // Calculate days until expiration
  const today = new Date()
  const expirationDate = position.expiration ? new Date(position.expiration) : today
  const daysUntilExpiration = Math.max(0, (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const yearsUntilExpiration = daysUntilExpiration / 365

  // Calculate underlyingPrice and contracts
  const underlyingPrice = Number(position.underlying_price_entry) || 0
  const contracts = Math.round(Number(position.nominal || 0) / Number(position.strike_entry || 1) / 100)

  // Calculate premiums from options.
  const calculatePremium = () => {
    const action = position.action?.toLowerCase() || ''
    const premium = (Number(position.premium_entry || 0) - Number(position.premium_exit || 0)) * contracts * 100
    const roundedPremium = Math.round(premium)
    // Convert premium into a debit or credit, depending on whether we are buying or selling options
    if (action.includes('sell')) {
      return Math.abs(roundedPremium)
    } else if (action.includes('buy')) {
      return -Math.abs(roundedPremium)
    }
    return roundedPremium
  }
  const totalPremium = calculatePremium()

  // Calculate BE strikes
  const be0Strike = Number(position.strike_entry || 0) - (totalPremium/contracts/100)
  const be1Strike = be0Strike * (1 + (Number(position.bond_yield || 0)/100))
  const be2Strike = be0Strike * (1 + (7/100))

  // Calculate positions for all circles
  const circlePositions = calculateCirclePositions(position, underlyingPrice, be0Strike, be1Strike, be2Strike)

  function calculateCirclePositions(position: any, underlyingPrice: number, be0Strike: number, be1Strike: number, be2Strike: number) {
    // 1. The underlyingPrice circle must always be at 50% position
    const underlyingPos = 50
    
    // 2. Gather all strikes we need to position
    const strikes = [
      Number(position.strike_entry || 0),
      position.action.includes('spread') ? Number(position.strike_exit || 0) : null,
      be0Strike,
      be1Strike,
      be2Strike
    ].filter(strike => strike !== null && strike !== undefined)
    
    // Find the lowest and highest strikes
    const lowestStrike = Math.min(...strikes as number[])
    const highestStrike = Math.max(...strikes as number[])
    
    // 3. Calculate which one is furthest away from underlyingPrice
    const lowestDiff = Math.abs(lowestStrike - underlyingPrice)
    const highestDiff = Math.abs(highestStrike - underlyingPrice)
    
    // 4. Determine which extreme strike position to use
    let extremeStrike, extremePosition
    if (lowestDiff > highestDiff) {
      extremeStrike = lowestStrike
      extremePosition = 10
    } else {
      extremeStrike = highestStrike
      extremePosition = 90
    }
    
    // 5. Calculate positions for all strikes relative to the fixed points
    const calculateStrikePosition = (strike: number) => {
      if (strike === underlyingPrice) return underlyingPos
      if (strike === extremeStrike) return extremePosition
      
      // Calculate the position using linear interpolation
      const ratio = (strike - underlyingPrice) / (extremeStrike - underlyingPrice)
      return underlyingPos + ratio * (extremePosition - underlyingPos)
    }
    
    return {
      entryPosition: calculateStrikePosition(Number(position.strike_entry || 0)),
      exitPosition: position.action.includes('spread') 
        ? calculateStrikePosition(Number(position.strike_exit || 0)) 
        : null,
      underlyingPosition: underlyingPos,
      be0Position: calculateStrikePosition(be0Strike),
      be1Position: calculateStrikePosition(be1Strike),
      be2Position: calculateStrikePosition(be2Strike),
    }
  }

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

  // Function for displaying the position text with the correct prefix and option type
  function getPositionIndicatorText(position: any, type: 'entry' | 'exit', contracts: number) {
    const action = position.action?.toLowerCase() || ''
    const isBuy = action.includes('buy')
    const isCall = action.includes('call')
    const optionType = isCall ? 'C' : 'P'
    
    // Determine sign based on the buy/sell action and entry/exit position
    let sign = ''
    
    if (type === 'entry') {
      sign = isBuy ? '+' : '-'
    } else { // type === 'exit'
      sign = isBuy ? '-' : '+'
    }
    
    return `${sign}${contracts}${optionType}`
  }

  function PositionPriceDisplay({ position, type, contracts, posX }: { position: any, type: 'entry' | 'exit', contracts: number, posX: number }) {
    const premium = type === 'entry' 
      ? Number(position.premium_entry || 0) 
      : Number(position.premium_exit || 0)
    
    const displayText = getPositionIndicatorText(position, type, contracts)
    
    return (
      <div 
        className="absolute -translate-x-1/2 top-8 flex flex-col items-center"
        style={{ left: `${posX}%` }}
      >
        <span className="text-xs text-black">
          <span className="font-bold">{displayText}</span> for ${formatNumber(premium, 2)}
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
      <div className="mt-12 mb-20 relative">
        {/* Underlying Price Circle (Middle) */}
        <PriceCircle 
          price={underlyingPrice}
          position={circlePositions.underlyingPosition}
          label="Underlying price"
        />
        
        
        {/* Strike Entry Circle */}
        <PriceCircle 
          price={Number(position.strike_entry || 0)}
          position={circlePositions.entryPosition}
          label="Entry strike"
        />
        
        {/* Strike Exit Circle (only for spreads) */}
        {position.action.includes('spread') && circlePositions.exitPosition !== null && (
          <PriceCircle 
            price={Number(position.strike_exit || 0)}
            position={circlePositions.exitPosition}
            label="Exit strike"
          />
        )}

        {/* BE Circles */}
        <BECircle 
          price={be0Strike}
          position={circlePositions.be0Position}
          beNumber={0}
        />
        <BECircle 
          price={be1Strike}
          position={circlePositions.be1Position}
          beNumber={1}
        />
        <BECircle 
          price={be2Strike}
          position={circlePositions.be2Position}
          beNumber={2}
        />
        
        {/* Price range bar */}
        <PriceRangeBar 
          leftPosition={circlePositions.entryPosition}
          middlePosition={circlePositions.underlyingPosition}
          rightPosition={circlePositions.exitPosition || circlePositions.entryPosition}
          action={position.action}
        />
        
        {/* Position indicators with updated logic */}
        <PositionPriceDisplay
          position={position}
          type="entry"
          contracts={contracts}
          posX={circlePositions.entryPosition}
        />
        
        {position.action.includes('spread') && circlePositions.exitPosition !== null && (
          <PositionPriceDisplay
            position={position}
            type="exit"
            contracts={contracts}
            posX={circlePositions.exitPosition}
          />
        )}
      </div>
    </TooltipProvider>
  )
}
