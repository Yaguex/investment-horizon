import { Circle } from "lucide-react"
import { formatNumber } from "./utils/formatters"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PriceVisualizationProps {
  note: any
}

const calculateCirclePositions = (note: any) => {
  const middlePosition = 50
  let entryPosition, exitPosition

  if (!note.underlying_price_entry || !note.strike_entry || !note.strike_exit) {
    return { middlePosition, entryPosition: middlePosition, exitPosition: middlePosition }
  }

  // Calculate the range of prices
  const minPrice = Math.min(note.underlying_price_entry, note.strike_entry, note.strike_exit)
  const maxPrice = Math.max(note.underlying_price_entry, note.strike_entry, note.strike_exit)
  const priceRange = maxPrice - minPrice

  // Calculate positions based on price values
  entryPosition = priceRange === 0 ? middlePosition : 
    ((note.strike_entry - minPrice) / priceRange) * 80 + 10 // 10-90 range
  exitPosition = priceRange === 0 ? middlePosition : 
    ((note.strike_exit - minPrice) / priceRange) * 80 + 10 // 10-90 range

  return { middlePosition, entryPosition, exitPosition }
}

export function PriceVisualization({ note }: PriceVisualizationProps) {
  const { middlePosition, entryPosition, exitPosition } = calculateCirclePositions(note)
  
  return (
    <TooltipProvider delayDuration={100}>
      <div className="mt-12 mb-20 relative">
        {/* Underlying Price Circle (Middle) */}
        {note.underlying_price_entry && (
          <div 
            className="absolute -translate-x-1/2 -top-6 flex flex-col items-center z-10"
            style={{ left: `${middlePosition}%` }}
          >
            <Tooltip>
              <TooltipTrigger>
                <span className="text-sm text-black mb-1">${note.underlying_price_entry}</span>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white">
                Current price: ${formatNumber(note.underlying_price_entry, 2)}
              </TooltipContent>
            </Tooltip>
            <Circle className="h-4 w-4 fill-black text-black" />
          </div>
        )}
        
        {/* Strike Entry Circle */}
        {note.strike_entry && (
          <div 
            className="absolute -translate-x-1/2 -top-6 flex flex-col items-center z-10"
            style={{ left: `${entryPosition}%` }}
          >
            <Tooltip>
              <TooltipTrigger>
                <span className="text-sm text-black mb-1">${note.strike_entry}</span>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white">
                Entry strike: ${formatNumber(note.strike_entry, 2)}
              </TooltipContent>
            </Tooltip>
            <Circle className="h-4 w-4 fill-black text-black" />
          </div>
        )}
        
        {/* Strike Exit Circle */}
        {note.strike_exit && (
          <div 
            className="absolute -translate-x-1/2 -top-6 flex flex-col items-center z-10"
            style={{ left: `${exitPosition}%` }}
          >
            <Tooltip>
              <TooltipTrigger>
                <span className="text-sm text-black mb-1">${note.strike_exit}</span>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white">
                Exit strike: ${formatNumber(note.strike_exit, 2)}
              </TooltipContent>
            </Tooltip>
            <Circle className="h-4 w-4 fill-black text-black" />
          </div>
        )}
        
        {/* Price rectangles */}
        <div className="w-full bg-gray-100 rounded-lg h-4 relative overflow-hidden">
          {/* Green rectangle for potential profit zone */}
          <div 
            className="absolute top-0 bottom-0 bg-green-500"
            style={{ 
              left: `${entryPosition}%`,
              width: `${exitPosition - entryPosition}%`
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