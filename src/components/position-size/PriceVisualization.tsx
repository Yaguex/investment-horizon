import { Circle } from "lucide-react"
import { formatNumber } from "./utils/formatters"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PriceVisualizationProps {
  note: any
}

const calculateCirclePositions = (note: any) => {
  const middlePosition = 50
  let entryPosition, exitPosition

  if (!note.underlying_price_entry || !note.strike_entry) {
    return { middlePosition, entryPosition: middlePosition, exitPosition: middlePosition }
  }

  // Get the absolute differences from underlying price
  const entryDiff = Math.abs(note.strike_entry - note.underlying_price_entry)
  const exitDiff = note.strike_exit ? Math.abs(note.strike_exit - note.underlying_price_entry) : 0

  // Determine which strike is furthest from underlying price
  if (exitDiff > entryDiff && note.strike_exit) {
    // Exit strike is furthest
    exitPosition = note.strike_exit < note.underlying_price_entry ? 10 : 90
    
    // Calculate entry position proportionally between underlying and exit
    const totalRange = Math.abs(note.underlying_price_entry - note.strike_exit)
    const entryRange = Math.abs(note.underlying_price_entry - note.strike_entry)
    const proportion = entryRange / totalRange
    
    entryPosition = note.strike_entry < note.underlying_price_entry
      ? middlePosition - (40 * proportion)
      : middlePosition + (40 * proportion)
  } else {
    // Entry strike is furthest
    entryPosition = note.strike_entry < note.underlying_price_entry ? 10 : 90
    
    if (note.strike_exit) {
      // Calculate exit position proportionally between underlying and entry
      const totalRange = Math.abs(note.underlying_price_entry - note.strike_entry)
      const exitRange = Math.abs(note.underlying_price_entry - note.strike_exit)
      const proportion = exitRange / totalRange
      
      exitPosition = note.strike_exit < note.underlying_price_entry
        ? middlePosition - (40 * proportion)
        : middlePosition + (40 * proportion)
    }
  }

  // Calculate positions for BE circles using the same formula
  const be1Position = calculateBEPosition(594, note.underlying_price_entry, note.strike_entry, note.strike_exit, middlePosition)
  const be2Position = calculateBEPosition(609, note.underlying_price_entry, note.strike_entry, note.strike_exit, middlePosition)
  const be3Position = calculateBEPosition(613, note.underlying_price_entry, note.strike_entry, note.strike_exit, middlePosition)

  return { 
    middlePosition, 
    entryPosition, 
    exitPosition,
    be1Position,
    be2Position,
    be3Position
  }
}

const calculateBEPosition = (beStrike: number, underlyingPrice: number, strikeEntry: number, strikeExit: number | null, middlePosition: number) => {
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

  const calculateOTMPercentage = (strike: number) => {
    if (!note.underlying_price_entry) return 0
    return Math.abs(Math.round(((strike - note.underlying_price_entry) / note.underlying_price_entry) * 100))
  }
  
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
              <span className="text-sm text-black mb-1">${formatNumber(note.underlying_price_entry, 0)}</span>
            </TooltipTrigger>
            <TooltipContent className="bg-black text-white">
              Current price: ${formatNumber(note.underlying_price_entry, 0)}
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
              <span className="text-sm text-black mb-1">${formatNumber(note.strike_entry, 0)}</span>
            </TooltipTrigger>
            <TooltipContent className="bg-black text-white">
              Entry strike: ${formatNumber(note.strike_entry, 0)}
            </TooltipContent>
          </Tooltip>
          <Circle className="h-4 w-4 fill-black text-black" />
        </div>
        
        {/* Strike Exit Circle */}
        {note.strike_exit && (
          <div 
            className="absolute -translate-x-1/2 -top-6 flex flex-col items-center z-10"
            style={{ left: `${exitPosition}%` }}
          >
            <Tooltip>
              <TooltipTrigger>
                <span className="text-sm text-black mb-1">${formatNumber(note.strike_exit, 0)}</span>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white">
                Exit strike: ${formatNumber(note.strike_exit, 0)}
              </TooltipContent>
            </Tooltip>
            <Circle className="h-4 w-4 fill-black text-black" />
          </div>
        )}

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
          {note.strike_exit && (
            <div 
              className="absolute top-0 bottom-0 bg-green-500"
              style={{ 
                left: `${Math.min(entryPosition, exitPosition)}%`,
                width: `${Math.abs(exitPosition - entryPosition)}%`
              }}
            />
          )}
        </div>
        
        {/* Position indicators */}
        <div 
          className="absolute -translate-x-1/2 top-8 flex flex-col items-center"
          style={{ left: `${entryPosition}%` }}
        >
          <span className="text-xs text-black">
            <span className="font-bold">-42P</span> for ${formatNumber(note.premium_entry, 2)}
          </span>
          <span className="text-xs text-black">{calculateOTMPercentage(note.strike_entry)}% OTM</span>
        </div>
        {note.strike_exit && (
          <div 
            className="absolute -translate-x-1/2 top-8 flex flex-col items-center"
            style={{ left: `${exitPosition}%` }}
          >
            <span className="text-xs text-black">
              <span className="font-bold">+42P</span> for ${formatNumber(note.premium_exit, 2)}
            </span>
            <span className="text-xs text-black">{calculateOTMPercentage(note.strike_exit)}% OTM</span>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
