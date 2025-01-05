import { TooltipProvider } from "@/components/ui/tooltip"
import { calculateCirclePositions, calculateContractsAndFees } from "./utils/calculations"
import { StrikeCircle } from "./StrikeCircle"
import { PositionIndicator } from "./PositionIndicator"

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
  
  const {
    protectionContracts,
    entryContracts,
    targetContracts,
    protectionFee,
    entryFee,
    targetFee
  } = calculateContractsAndFees(note)
  
  return (
    <TooltipProvider delayDuration={100}>
      <div className="mt-12 mb-20 relative">
        {/* Strike Entry Circle (Middle) */}
        {note.strike_entry !== 0 && (
          <StrikeCircle
            position={middlePosition}
            strike={note.strike_entry}
            entryStrike={note.strike_entry}
            label="Entry strike"
          />
        )}
        
        {/* Strike Target Circle (Right) */}
        {note.strike_target !== 0 && (
          <StrikeCircle
            position={rightPosition}
            strike={note.strike_target}
            entryStrike={note.strike_entry}
            label="Target strike"
          />
        )}
        
        {/* Strike Protection Circle (Left) */}
        {note.strike_protection !== 0 && (
          <StrikeCircle
            position={leftPosition}
            strike={note.strike_protection}
            entryStrike={note.strike_entry}
            label="Protection strike"
          />
        )}

        {/* BE Circles */}
        {note.strike_entry !== 0 && (
          <>
            <StrikeCircle
              position={be1Position}
              strike={be1Strike}
              entryStrike={note.strike_entry}
              label="BE1 (risk free rate)"
              variant="secondary"
            />
            <StrikeCircle
              position={be2Position}
              strike={be2Strike}
              entryStrike={note.strike_entry}
              label="BE2 (7%)"
              variant="secondary"
            />
          </>
        )}
        
        {/* Price rectangles */}
        <div className="w-full bg-gray-100 rounded-lg h-4 relative overflow-hidden">
          {note.strike_protection !== 0 && (
            <div 
              className="absolute left-0 top-0 bottom-0 bg-red-500"
              style={{ width: `${leftPosition}%` }}
            />
          )}
          <div 
            className="absolute top-0 bottom-0 bg-green-500"
            style={{ 
              left: `${middlePosition}%`,
              width: `${rightPosition - middlePosition}%`
            }}
          />
        </div>
        
        {/* Position indicators */}
        {note.strike_entry !== 0 && (
          <PositionIndicator
            position={middlePosition}
            contracts={entryContracts}
            strike={note.strike_entry_mid}
            fee={entryFee}
            type="entry"
          />
        )}
        {note.strike_protection !== 0 && (
          <PositionIndicator
            position={leftPosition}
            contracts={protectionContracts}
            strike={note.strike_protection_mid}
            fee={protectionFee}
            type="protection"
          />
        )}
        {note.strike_target !== 0 && (
          <PositionIndicator
            position={rightPosition}
            contracts={targetContracts}
            strike={note.strike_target_mid}
            fee={targetFee}
            type="target"
          />
        )}
      </div>
    </TooltipProvider>
  )
}