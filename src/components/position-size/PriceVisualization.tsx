import { Circle } from "lucide-react"
import { formatNumber } from "./utils/formatters"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PriceVisualizationProps {
  note: any
}

const calculateCirclePositions = (note: any) => {
  const middlePosition = 50
  let leftPosition, rightPosition

  // Calculate positions based on entry and exit strikes
  const strikeDiff = note.strike_exit - note.strike_entry
  
  // For a call option purchase
  if (note.action === 'buy_call') {
    leftPosition = middlePosition
    rightPosition = 90
  } 
  // For a put option purchase
  else if (note.action === 'buy_put') {
    leftPosition = 10
    rightPosition = middlePosition
  }
  // Default to middle if no action specified
  else {
    leftPosition = middlePosition
    rightPosition = middlePosition
  }

  return { leftPosition, middlePosition, rightPosition }
}

export function PriceVisualization({ note }: PriceVisualizationProps) {
  const { leftPosition, middlePosition, rightPosition } = calculateCirclePositions(note)
  
  // Calculate number of contracts based on exposure
  const contracts = Math.round(note.exposure / (note.strike_entry * 100))
  
  return (
    <TooltipProvider delayDuration={100}>
      <div className="mt-12 mb-20 relative">
        {/* Strike Entry Circle */}
        {note.strike_entry !== 0 && (
          <div 
            className="absolute -translate-x-1/2 -top-6 flex flex-col items-center z-10"
            style={{ left: `${middlePosition}%` }}
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
        {note.strike_exit !== 0 && (
          <div 
            className="absolute -translate-x-1/2 -top-6 flex flex-col items-center z-10"
            style={{ left: `${rightPosition}%` }}
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
              left: `${middlePosition}%`,
              width: `${rightPosition - middlePosition}%`
            }}
          />
        </div>
        
        {/* Position indicators aligned with circles */}
        {note.strike_entry !== 0 && (
          <div 
            className="absolute -translate-x-1/2 top-8 flex flex-col items-center"
            style={{ left: `${middlePosition}%` }}
          >
            <span className="text-xs text-black">
              <span className="font-bold">
                {note.action === 'buy_call' ? '+' : '-'}{contracts}
                {note.action?.includes('call') ? 'C' : 'P'}
              </span> 
              at ${note.premium_entry}
            </span>
            <span className="text-xs text-red-500">
              ${formatNumber(contracts * note.premium_entry * 100, 0)}
            </span>
          </div>
        )}
        {note.strike_exit !== 0 && (
          <div 
            className="absolute -translate-x-1/2 top-8 flex flex-col items-center"
            style={{ left: `${rightPosition}%` }}
          >
            <span className="text-xs text-black">
              <span className="font-bold">
                {note.action === 'buy_call' ? '-' : '+'}{contracts}
                {note.action?.includes('call') ? 'C' : 'P'}
              </span> 
              at ${note.premium_exit || '?'}
            </span>
            <span className="text-xs text-green-500">
              ${formatNumber((contracts * (note.premium_exit || 0) * 100), 0)}
            </span>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}