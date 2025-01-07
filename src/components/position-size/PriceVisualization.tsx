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

  // Calculate positions relative to the underlying price
  const underlyingPrice = testNote.underlying_price_entry
  const maxDiff = 100 // Maximum price difference to consider for scaling
  
  // Calculate relative positions (negative = left, positive = right)
  const entryDiff = ((testNote.strike_entry - underlyingPrice) / maxDiff)
  const exitDiff = ((testNote.strike_exit - underlyingPrice) / maxDiff)
  
  // Convert to screen positions (40% range on each side)
  entryPosition = middlePosition + (entryDiff * 40)
  exitPosition = middlePosition + (exitDiff * 40)

  // Ensure positions stay within bounds
  entryPosition = Math.max(10, Math.min(90, entryPosition))
  exitPosition = Math.max(10, Math.min(90, exitPosition))

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