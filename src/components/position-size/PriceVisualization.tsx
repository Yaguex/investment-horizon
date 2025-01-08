import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { TooltipProvider } from "@/components/ui/tooltip"
import { PriceCircle } from "./visualization/PriceCircle"
import { PositionIndicator } from "./visualization/PositionIndicator"
import { PriceRangeBar } from "./visualization/PriceRangeBar"

interface PriceVisualizationProps {
  note: any
}

const calculateCirclePositions = (note: any) => {
  const middlePosition = 50
  let leftPosition, rightPosition

  const targetDiff = note.strike_exit - note.underlying_price_entry
  const protectionDiff = note.underlying_price_entry - note.strike_protection

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
        {/* Underlying Price Entry Circle (Middle) */}
        <PriceCircle 
          value={note.underlying_price_entry}
          label="Underlying price entry"
          position={middlePosition}
        />
        
        {/* Strike Exit Circle (Right) */}
        <PriceCircle 
          value={note.strike_exit}
          label="Exit strike"
          position={rightPosition}
        />
        
        {/* Strike Protection Circle (Left) */}
        <PriceCircle 
          value={note.strike_protection}
          label="Protection strike"
          position={leftPosition}
        />
        
        {/* Price Range Bar */}
        <PriceRangeBar 
          leftPosition={leftPosition}
          middlePosition={middlePosition}
          rightPosition={rightPosition}
          hasProtection={note.strike_protection !== 0}
        />
        
        {/* Position Indicators */}
        {note.underlying_price_entry !== 0 && (
          <PositionIndicator
            contracts={contracts}
            premium={note.premium_entry}
            position={middlePosition}
            type="entry"
          />
        )}
        {note.strike_exit !== 0 && (
          <PositionIndicator
            contracts={contracts}
            premium={note.premium_exit}
            position={rightPosition}
            type="exit"
          />
        )}
      </div>
    </TooltipProvider>
  )
}