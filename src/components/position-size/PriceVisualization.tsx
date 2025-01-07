import { calculateCirclePositions } from "./utils/calculations"
import { PriceCircle } from "./components/PriceCircle"
import { PositionIndicator } from "./components/PositionIndicator"
import { TooltipProvider } from "@/components/ui/tooltip"

interface PriceVisualizationProps {
  note: any
}

export function PriceVisualization({ note }: PriceVisualizationProps) {
  const { middlePosition, entryPosition, exitPosition } = calculateCirclePositions(note)
  
  // Calculate fees
  const entryFee = (note.contracts || 0) * (note.premium_entry || 0) * 100
  const exitFee = (note.contracts || 0) * (note.premium_exit || 0) * 100
  
  return (
    <TooltipProvider delayDuration={100}>
      <div className="mt-12 mb-20 relative">
        {/* Underlying Price Circle (Middle) */}
        <PriceCircle 
          position={middlePosition}
          price={590}
          label="Current price"
        />
        
        {/* Strike Entry Circle */}
        <PriceCircle 
          position={entryPosition}
          price={580}
          label="Entry strike"
        />
        
        {/* Strike Exit Circle */}
        <PriceCircle 
          position={exitPosition}
          price={540}
          label="Exit strike"
        />
        
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
          <PositionIndicator 
            position={entryPosition}
            contracts={note.contracts || 0}
            price={note.premium_entry || 0}
            isEntry={true}
            action={note.action}
            fee={entryFee}
          />
        )}
        {note.strike_exit && (
          <PositionIndicator 
            position={exitPosition}
            contracts={note.contracts || 0}
            price={note.premium_exit || 0}
            isEntry={false}
            action={note.action}
            fee={exitFee}
          />
        )}
      </div>
    </TooltipProvider>
  )
}