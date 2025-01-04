import { Circle } from "lucide-react"
import { formatNumber } from "./utils/formatters"

interface PriceVisualizationProps {
  note: any
}

const calculateCirclePositions = (note: any) => {
  const middlePosition = 50
  let leftPosition, rightPosition

  const targetDiff = note.strike_target - note.strike_entry
  const protectionDiff = note.strike_entry - note.strike_protection

  if (targetDiff >= protectionDiff) {
    rightPosition = 90
    leftPosition = 50 - ((protectionDiff * 40) / targetDiff)
  } else {
    leftPosition = 10
    rightPosition = 50 + ((targetDiff * 40) / protectionDiff)
  }

  return { leftPosition, middlePosition, rightPosition }
}

export function PriceVisualization({ note }: PriceVisualizationProps) {
  const { leftPosition, middlePosition, rightPosition } = calculateCirclePositions(note)
  
  return (
    <div className="mt-12 mb-20 relative">
      {/* Strike Entry Circle (Middle) */}
      {note.strike_entry !== 0 && (
        <div 
          className="absolute -translate-x-1/2 -top-6 flex flex-col items-center z-10"
          style={{ left: `${middlePosition}%` }}
        >
          <span className="text-sm text-black mb-1">${note.strike_entry}</span>
          <Circle className="h-4 w-4 fill-black text-black" />
        </div>
      )}
      
      {/* Strike Target Circle (Right) */}
      {note.strike_target !== 0 && (
        <div 
          className="absolute -translate-x-1/2 -top-6 flex flex-col items-center z-10"
          style={{ left: `${rightPosition}%` }}
        >
          <span className="text-sm text-black mb-1">${note.strike_target}</span>
          <Circle className="h-4 w-4 fill-black text-black" />
        </div>
      )}
      
      {/* Strike Protection Circle (Left) */}
      {note.strike_protection !== 0 && (
        <div 
          className="absolute -translate-x-1/2 -top-6 flex flex-col items-center z-10"
          style={{ left: `${leftPosition}%` }}
        >
          <span className="text-sm text-black mb-1">${note.strike_protection}</span>
          <Circle className="h-4 w-4 fill-black text-black" />
        </div>
      )}
      
      {/* Price rectangles */}
      <div className="w-full bg-gray-100 rounded-lg h-4 relative overflow-hidden">
        {/* Red rectangle - only show if strike_protection exists */}
        {note.strike_protection !== 0 && (
          <div 
            className="absolute left-0 top-0 bottom-0 bg-red-500"
            style={{ width: `${leftPosition}%` }}
          />
        )}
        {/* Green rectangle */}
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
          <span className="text-xs text-black"><span className="font-bold">+46C</span> at $80.45</span>
          <span className="text-xs text-red-500">$-58,094</span>
        </div>
      )}
      {note.strike_protection !== 0 && (
        <div 
          className="absolute -translate-x-1/2 top-8 flex flex-col items-center"
          style={{ left: `${leftPosition}%` }}
        >
          <span className="text-xs text-black"><span className="font-bold">-32P</span> at $11.20</span>
          <span className="text-xs text-green-500">$7,450</span>
        </div>
      )}
      {note.strike_target !== 0 && (
        <div 
          className="absolute -translate-x-1/2 top-8 flex flex-col items-center"
          style={{ left: `${rightPosition}%` }}
        >
          <span className="text-xs text-black"><span className="font-bold">-46C</span> at $50.22</span>
          <span className="text-xs text-green-500">$32,622</span>
        </div>
      )}
    </div>
  )
}
