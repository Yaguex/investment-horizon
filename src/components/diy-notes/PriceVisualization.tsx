import { TooltipProvider } from "@/components/ui/tooltip"
import { calculateCirclePositions } from "./utils/calculatePositions"
import { PriceCircle } from "./PriceCircles"
import { PositionIndicators } from "./PositionIndicators"
import { NoteHeaderMetrics } from "./NoteHeaderMetrics"

interface PriceVisualizationProps {
  note: any
}

export function PriceVisualization({ note }: PriceVisualizationProps) {
  const { 
    leftPosition, 
    middlePosition, 
    rightPosition, 
    be1Position, 
    be2Position, 
    be1Strike, 
    be2Strike 
  } = calculateCirclePositions(note)
  
  return (
    <TooltipProvider delayDuration={100}>
      <NoteHeaderMetrics note={note} />
      
      <div className="mt-12 mb-20 relative">
        {/* Strike Entry Circle (Middle) */}
        {note.strike_entry !== 0 && (
          <PriceCircle
            position={middlePosition}
            price={note.strike_entry}
            label="Entry strike"
            type="primary"
          />
        )}
        
        {/* Strike Target Circle (Right) */}
        {note.strike_target !== 0 && (
          <PriceCircle
            position={rightPosition}
            price={note.strike_target}
            label="Target strike"
            type="primary"
          />
        )}
        
        {/* Strike Protection Circle (Left) */}
        {note.strike_protection !== 0 && (
          <PriceCircle
            position={leftPosition}
            price={note.strike_protection}
            label="Protection strike"
            type="primary"
          />
        )}

        {/* BE1 Circle */}
        {note.strike_entry !== 0 && (
          <PriceCircle
            position={be1Position}
            price={be1Strike}
            label="BE1 (risk free rate)"
            type="secondary"
          />
        )}

        {/* BE2 Circle */}
        {note.strike_entry !== 0 && (
          <PriceCircle
            position={be2Position}
            price={be2Strike}
            label="BE2 (7%)"
            type="secondary"
          />
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
        
        <PositionIndicators note={note} positions={{ leftPosition, middlePosition, rightPosition }} />
      </div>
    </TooltipProvider>
  )
}