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

  return { middlePosition, entryPosition, exitPosition }
}

export function PriceVisualization({ note }: PriceVisualizationProps) {
  const { middlePosition, entryPosition, exitPosition } = calculateCirclePositions(note)
  
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
        {note.strike_entry && (
          <div 
            className="absolute -translate-x-1/2 top-8 flex flex-col items-center"
            style={{ left: `${entryPosition}%` }}
          >
            <span className="text-xs text-black">
              <span className="font-bold">
                {note.action === 'buy_call' ? '+' : '-'}{note.contracts || 0}
                {note.action?.includes('call') ? 'C' : 'P'}
              </span> 
              at ${note.premium_entry || 0}
            </span>
            <span className="text-xs text-red-500">
              ${formatNumber((note.contracts || 0) * (note.premium_entry || 0) * 100, 0)}
            </span>
          </div>
        )}
        {note.strike_exit && (
          <div 
            className="absolute -translate-x-1/2 top-8 flex flex-col items-center"
            style={{ left: `${exitPosition}%` }}
          >
            <span className="text-xs text-black">
              <span className="font-bold">
                {note.action === 'buy_call' ? '-' : '+'}{note.contracts || 0}
                {note.action?.includes('call') ? 'C' : 'P'}
              </span> 
              at ${note.premium_exit || '?'}
            </span>
            <span className="text-xs text-green-500">
              ${formatNumber((note.contracts || 0) * (note.premium_exit || 0) * 100, 0)}
            </span>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}