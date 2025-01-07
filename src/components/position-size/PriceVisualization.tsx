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

  // Calculate positions for BE circles using the same formula
  const be1Position = calculateBEPosition(594, testNote.underlying_price_entry, testNote.strike_entry, testNote.strike_exit, middlePosition)
  const be2Position = calculateBEPosition(609, testNote.underlying_price_entry, testNote.strike_entry, testNote.strike_exit, middlePosition)
  const be3Position = calculateBEPosition(613, testNote.underlying_price_entry, testNote.strike_entry, testNote.strike_exit, middlePosition)

  return { 
    middlePosition, 
    entryPosition, 
    exitPosition,
    be1Position,
    be2Position,
    be3Position
  }
}

const calculateBEPosition = (beStrike: number, underlyingPrice: number, strikeEntry: number, strikeExit: number, middlePosition: number) => {
  const entryDiff = Math.abs(strikeEntry - underlyingPrice)
  const exitDiff = Math.abs(strikeExit - underlyingPrice)
  const beDiff = Math.abs(beStrike - underlyingPrice)

  if (exitDiff > entryDiff) {
    const totalRange = Math.abs(underlyingPrice - strikeExit)
    const beRange = Math.abs(underlyingPrice - beStrike)
    const proportion = beRange / totalRange
    
    return beStrike < underlyingPrice
      ? middlePosition - (40 * proportion)
      : middlePosition + (40 * proportion)
  } else {
    const totalRange = Math.abs(underlyingPrice - strikeEntry)
    const beRange = Math.abs(underlyingPrice - beStrike)
    const proportion = beRange / totalRange
    
    return beStrike < underlyingPrice
      ? middlePosition - (40 * proportion)
      : middlePosition + (40 * proportion)
  }
}

export function PriceVisualization({ note }: PriceVisualizationProps) {
  const { 
    middlePosition, 
    entryPosition, 
    exitPosition,
    be1Position,
    be2Position,
    be3Position
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
              <span className="text-sm text-black mb-1">$580</span>
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
              <span className="text-sm text-black mb-1">$540</span>
            </TooltipTrigger>
            <TooltipContent className="bg-black text-white">
              Exit strike: $540
            </TooltipContent>
          </Tooltip>
          <Circle className="h-4 w-4 fill-black text-black" />
        </div>

        {/* BE Circles */}
        {[
          { position: be1Position, strike: 594 },
          { position: be2Position, strike: 609 },
          { position: be3Position, strike: 613 }
        ].map((be, index) => (
          <div 
            key={index}
            className="absolute -translate-x-1/2 -top-6 flex flex-col items-center z-10"
            style={{ left: `${be.position}%` }}
          >
            <Tooltip>
              <TooltipTrigger>
                <span className="text-sm text-gray-300 mb-1">${be.strike}</span>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white">
                BE{index + 1}: ${be.strike}
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
        
        {/* Position indicators */}
        <div 
          className="absolute -translate-x-1/2 top-8 flex flex-col items-center"
          style={{ left: `${entryPosition}%` }}
        >
          <span className="text-xs text-black">-42P for $2.03</span>
          <span className="text-xs text-black">8% OTM</span>
        </div>
        <div 
          className="absolute -translate-x-1/2 top-8 flex flex-col items-center"
          style={{ left: `${exitPosition}%` }}
        >
          <span className="text-xs text-black">+42P for $20.74</span>
          <span className="text-xs text-black">15% OTM</span>
        </div>
      </div>
    </TooltipProvider>
  )
}