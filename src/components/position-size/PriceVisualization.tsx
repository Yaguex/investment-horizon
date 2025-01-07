import { TooltipProvider } from "@/components/ui/tooltip";
import { PriceCircle } from "./PriceCircle";
import { PositionIndicator } from "./PositionIndicator";
import { calculateCirclePositions } from "./utils/calculations";

interface PriceVisualizationProps {
  note: any;
}

export function PriceVisualization({ note }: PriceVisualizationProps) {
  const { middlePosition, entryPosition, exitPosition } = calculateCirclePositions(note);
  
  return (
    <TooltipProvider delayDuration={100}>
      <div className="mt-12 mb-20 relative">
        {/* Underlying Price Circle */}
        <PriceCircle 
          position={middlePosition}
          price={590}
          label="Current Price"
          description="Current price"
        />
        
        {/* Strike Entry Circle */}
        <PriceCircle 
          position={entryPosition}
          price={580}
          label="Entry Strike"
          description="Entry strike"
        />
        
        {/* Strike Exit Circle */}
        <PriceCircle 
          position={exitPosition}
          price={540}
          label="Exit Strike"
          description="Exit strike"
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
            premium={note.premium_entry || 0}
            isEntry={true}
            action={note.action}
          />
        )}
        {note.strike_exit && (
          <PositionIndicator 
            position={exitPosition}
            contracts={note.contracts || 0}
            premium={note.premium_exit || 0}
            isEntry={false}
            action={note.action}
          />
        )}
      </div>
    </TooltipProvider>
  );
}