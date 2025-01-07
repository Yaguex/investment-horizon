import { Circle } from "lucide-react"
import { formatNumber } from "./utils/formatters"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PriceVisualizationProps {
  note: any
}

const calculateCirclePositions = (note: any) => {
  const middlePosition = 50
  let entryPosition, exitPosition

  // For testing purposes, we'll use the hardcoded values
  const testNote = {
    ...note,
    strike_entry: 580,
    strike_exit: 540,
    underlying_price_entry: 590
  }

  if (!testNote.underlying_price_entry || !testNote.strike_entry || !testNote.strike_exit) {
    return { middlePosition, entryPosition: middlePosition, exitPosition: middlePosition }
  }

  // Get the absolute differences from underlying price
  const entryDiff = Math.abs(testNote.strike_entry - testNote.underlying_price_entry)
  const exitDiff = Math.abs(testNote.strike_exit - testNote.underlying_price_entry)

  // Determine which strike is furthest from underlying price
  if (exitDiff > entryDiff) {
    // Exit strike is furthest
    exitPosition = testNote.strike_exit < testNote.underlying_price_entry ? 10 : 90
    
    // Calculate entry position proportionally between underlying and exit
    const totalRange = Math.abs(testNote.underlying_price_entry - testNote.strike_exit)
    const entryRange = Math.abs(testNote.underlying_price_entry - testNote.strike_entry)
    const proportion = entryRange / totalRange
    
    entryPosition = testNote.strike_entry < testNote.underlying_price_entry
      ? middlePosition - (40 * proportion)
      : middlePosition + (40 * proportion)
  } else {
    // Entry strike is furthest
    entryPosition = testNote.strike_entry < testNote.underlying_price_entry ? 10 : 90
    
    // Calculate exit position proportionally between underlying and entry
    const totalRange = Math.abs(testNote.underlying_price_entry - testNote.strike_entry)
    const exitRange = Math.abs(testNote.underlying_price_entry - testNote.strike_exit)
    const proportion = exitRange / totalRange
    
    exitPosition = testNote.strike_exit < testNote.underlying_price_entry
      ? middlePosition - (40 * proportion)
      : middlePosition + (40 * proportion)
  }

  // Calculate positions for semi-transparent circles (594, 609, 613)
  const calculateSemiTransparentPosition = (strike: number) => {
    const strikeDiff = Math.abs(strike - testNote.underlying_price_entry)
    const proportion = strikeDiff / Math.max(entryDiff, exitDiff)
    return strike < testNote.underlying_price_entry
      ? middlePosition - (40 * proportion)
      : middlePosition + (40 * proportion)
  }

  const position594 = calculateSemiTransparentPosition(594)
  const position609 = calculateSemiTransparentPosition(609)
  const position613 = calculateSemiTransparentPosition(613)

  return { 
    middlePosition, 
    entryPosition, 
    exitPosition,
    position594,
    position609,
    position613
  }
}

const getColorForPremiumROI = (value: number) => {
  if (value >= 10) return 'text-green-500'
  if (value > 6) return 'text-orange-500'
  if (value > 0) return 'text-red-500'
  if (value > -6) return 'text-green-500'
  if (value > -10) return 'text-orange-500'
  return 'text-red-500'
}

const getColorForDeltaNormalized = (value: number) => {
  if (value >= 0.6) return 'text-green-500'
  if (value > 0.3) return 'text-orange-500'
  if (value > 0) return 'text-red-500'
  if (value > -0.3) return 'text-green-500'
  if (value > -0.6) return 'text-orange-500'
  return 'text-red-500'
}

export function PriceVisualization({ note }: PriceVisualizationProps) {
  const { 
    middlePosition, 
    entryPosition, 
    exitPosition,
    position594,
    position609,
    position613
  } = calculateCirclePositions(note)
  
  return (
    <TooltipProvider delayDuration={100}>
      <div className="mt-12 mb-20 relative">
        {/* Underlying Price Circle (Middle) */}
        <div 
          className="absolute -translate-x-1/2 -top-6 flex flex-col items-center z-10"
          style={{ left: `${middlePosition}%` }}
        >
          <Tooltip>
            <TooltipTrigger>
              <span className="text-sm text-black mb-1">$590</span>
            </TooltipTrigger>
            <TooltipContent className="bg-black text-white">
              Current price: $590
            </TooltipContent>
          </Tooltip>
          <Circle className="h-4 w-4 fill-black text-black" />
        </div>
        
        {/* Strike Entry Circle */}
        <div 
          className="absolute -translate-x-1/2 -top-6 flex flex-col items-center z-10"
          style={{ left: `${entryPosition}%` }}
        >
          <Tooltip>
            <TooltipTrigger>
              <div className="flex flex-col items-center">
                <span className="text-sm text-black mb-1">$580</span>
                <span className="text-xs text-gray-600">-42P for $2.03</span>
                <span className="text-xs text-gray-600">8% OTM</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-black text-white">
              Entry strike: $580
            </TooltipContent>
          </Tooltip>
          <Circle className="h-4 w-4 fill-black text-black" />
        </div>
        
        {/* Strike Exit Circle */}
        <div 
          className="absolute -translate-x-1/2 -top-6 flex flex-col items-center z-10"
          style={{ left: `${exitPosition}%` }}
        >
          <Tooltip>
            <TooltipTrigger>
              <div className="flex flex-col items-center">
                <span className="text-sm text-black mb-1">$540</span>
                <span className="text-xs text-gray-600">+42P for $20.74</span>
                <span className="text-xs text-gray-600">15% OTM</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-black text-white">
              Exit strike: $540
            </TooltipContent>
          </Tooltip>
          <Circle className="h-4 w-4 fill-black text-black" />
        </div>

        {/* Semi-transparent circles */}
        {[
          { position: position594, strike: 594 },
          { position: position609, strike: 609 },
          { position: position613, strike: 613 }
        ].map(({ position, strike }) => (
          <div 
            key={strike}
            className="absolute -translate-x-1/2 -top-6 flex flex-col items-center z-5"
            style={{ left: `${position}%` }}
          >
            <Tooltip>
              <TooltipTrigger>
                <span className="text-sm text-gray-300 mb-1">${strike}</span>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white">
                Strike: ${strike}
              </TooltipContent>
            </Tooltip>
            <Circle className="h-4 w-4" style={{ fill: 'rgba(0,0,0,0.2)', color: 'rgba(0,0,0,0.2)' }} />
          </div>
        ))}
        
        {/* Price rectangles */}
        <div className="w-full bg-gray-100 rounded-lg h-4 relative overflow-hidden">
          {/* Green rectangle for potential profit zone */}
          <div 
            className="absolute top-0 bottom-0 bg-green-500"
            style={{ 
              left: `${Math.min(entryPosition, exitPosition)}%`,
              width: `${Math.abs(exitPosition - entryPosition)}%`
            }}
          />
        </div>
      </div>
    </TooltipProvider>
  )
}
