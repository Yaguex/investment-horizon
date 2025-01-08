import { TooltipProvider } from "@/components/ui/tooltip"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { PriceCircle } from "./visualization/PriceCircle"
import { PriceRangeBar } from "./visualization/PriceRangeBar"
import { PositionIndicator } from "./visualization/PositionIndicator"

interface PriceVisualizationProps {
  note: any
}

const calculatePositions = (note: any) => {
  const middlePosition = 50 // underlying_price_entry is always at 50%
  let leftPosition, rightPosition

  if (note.action.includes('spread')) {
    // Calculate distances from underlying price
    const entryDistance = Math.abs(note.strike_entry - note.underlying_price_entry)
    const exitDistance = Math.abs(note.strike_exit - note.underlying_price_entry)
    
    // Determine which strike is furthest from underlying price
    if (entryDistance >= exitDistance) {
      // strike_entry is furthest
      leftPosition = note.strike_entry < note.underlying_price_entry ? 10 : 90
      // Calculate exit position proportionally
      const ratio = (note.strike_exit - note.underlying_price_entry) / (note.strike_entry - note.underlying_price_entry)
      rightPosition = middlePosition + (leftPosition - middlePosition) * ratio
    } else {
      // strike_exit is furthest
      rightPosition = note.strike_exit < note.underlying_price_entry ? 10 : 90
      // Calculate entry position proportionally
      const ratio = (note.strike_entry - note.underlying_price_entry) / (note.strike_exit - note.underlying_price_entry)
      leftPosition = middlePosition + (rightPosition - middlePosition) * ratio
    }
  } else {
    // For non-spreads, only position strike_entry
    leftPosition = note.strike_entry < note.underlying_price_entry ? 10 : 90
    rightPosition = leftPosition // Not used but needed for the range bar
  }

  return { leftPosition, middlePosition, rightPosition }
}

export function PriceVisualization({ note }: PriceVisualizationProps) {
  const { leftPosition, middlePosition, rightPosition } = calculatePositions(note)
  
  const { data: latestBalance = 0 } = useQuery({
    queryKey: ['latest-balance'],
    queryFn: async () => {
      const { data } = await supabase
        .from('portfolio_data')
        .select('balance')
        .order('month', { ascending: false })
        .limit(1)
      return data?.[0]?.balance || 0
    }
  })

  const contracts = Math.round((latestBalance * (note.exposure/100)) / (note.strike_entry) / 100)
  
  return (
    <TooltipProvider delayDuration={100}>
      <div className="mt-12 mb-20 relative">
        {/* Underlying Price Circle (Middle) */}
        <PriceCircle 
          price={note.underlying_price_entry}
          position={middlePosition}
          label="Underlying price"
        />
        
        {/* Strike Entry Circle */}
        <PriceCircle 
          price={note.strike_entry}
          position={leftPosition}
          label="Entry strike"
        />
        
        {/* Strike Exit Circle (only for spreads) */}
        {note.action.includes('spread') && (
          <PriceCircle 
            price={note.strike_exit}
            position={rightPosition}
            label="Exit strike"
          />
        )}
        
        {/* Price range bar */}
        <PriceRangeBar 
          leftPosition={leftPosition}
          middlePosition={middlePosition}
          rightPosition={rightPosition}
        />
        
        {/* Position indicators */}
        <PositionIndicator
          position={leftPosition}
          contracts={contracts}
          premium={note.premium_entry}
          type="entry"
        />
        
        {note.action.includes('spread') && (
          <PositionIndicator
            position={rightPosition}
            contracts={contracts}
            premium={note.premium_exit}
            type="exit"
          />
        )}
      </div>
    </TooltipProvider>
  )
}