import { Circle } from "lucide-react"
import { formatNumber } from "./utils/formatters"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { PriceCircle } from "./components/PriceCircle"
import { PositionIndicator } from "./components/PositionIndicator"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

interface PriceVisualizationProps {
  note: any
}

const calculateCirclePositions = (note: any) => {
  const middlePosition = 50
  let entryPosition, exitPosition

  if (!note.underlying_price_entry || !note.strike_entry) {
    return { middlePosition, entryPosition: middlePosition, exitPosition: middlePosition }
  }

  // Get the absolute differences from underlying price
  const entryDiff = Math.abs(note.strike_entry - note.underlying_price_entry)
  const exitDiff = note.strike_exit ? Math.abs(note.strike_exit - note.underlying_price_entry) : 0

  // Determine which strike is furthest from underlying price
  if (exitDiff > entryDiff && note.strike_exit) {
    // Exit strike is furthest
    exitPosition = note.strike_exit < note.underlying_price_entry ? 10 : 90
    
    // Calculate entry position proportionally between underlying and exit
    const totalRange = Math.abs(note.underlying_price_entry - note.strike_exit)
    const entryRange = Math.abs(note.underlying_price_entry - note.strike_entry)
    const proportion = entryRange / totalRange
    
    entryPosition = note.strike_entry < note.underlying_price_entry
      ? middlePosition - (40 * proportion)
      : middlePosition + (40 * proportion)
  } else {
    // Entry strike is furthest
    entryPosition = note.strike_entry < note.underlying_price_entry ? 10 : 90
    
    if (note.strike_exit) {
      // Calculate exit position proportionally between underlying and entry
      const totalRange = Math.abs(note.underlying_price_entry - note.strike_entry)
      const exitRange = Math.abs(note.underlying_price_entry - note.strike_exit)
      const proportion = exitRange / totalRange
      
      exitPosition = note.strike_exit < note.underlying_price_entry
        ? middlePosition - (40 * proportion)
        : middlePosition + (40 * proportion)
    }
  }

  // Calculate positions for BE circles using the same formula
  const be1Position = calculateBEPosition(594, note.underlying_price_entry, note.strike_entry, note.strike_exit, middlePosition)
  const be2Position = calculateBEPosition(609, note.underlying_price_entry, note.strike_entry, note.strike_exit, middlePosition)
  const be3Position = calculateBEPosition(613, note.underlying_price_entry, note.strike_entry, note.strike_exit, middlePosition)

  return { 
    middlePosition, 
    entryPosition, 
    exitPosition,
    be1Position,
    be2Position,
    be3Position
  }
}

const calculateBEPosition = (beStrike: number, underlyingPrice: number, strikeEntry: number, strikeExit: number | null, middlePosition: number) => {
  const entryDiff = Math.abs(strikeEntry - underlyingPrice)
  const exitDiff = Math.abs(strikeExit - underlyingPrice)
  const beDiff = Math.abs(beStrike - underlyingPrice)

  if (exitDiff > entryDiff) {
    const totalRange = Math.abs(underlyingPrice - strikeExit)
    const beRange = Math.abs(underlyingPrice - beStrike)
    const proportion = beRange / totalRange
    
    return beStrike < underlyingPrice
      ? middlePosition - (40 * proportion)
      : middlePosition + (40 * proportion)
  } else {
    const totalRange = Math.abs(underlyingPrice - strikeEntry)
    const beRange = Math.abs(underlyingPrice - beStrike)
    const proportion = beRange / totalRange
    
    return beStrike < underlyingPrice
      ? middlePosition - (40 * proportion)
      : middlePosition + (40 * proportion)
  }
}

export function PriceVisualization({ note }: PriceVisualizationProps) {
  const { 
    middlePosition, 
    entryPosition, 
    exitPosition,
    be1Position,
    be2Position,
    be3Position
  } = calculateCirclePositions(note)

  const { data: latestBalance } = useQuery({
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

  const calculateContracts = (strike: number) => {
    if (!latestBalance || !note.strike_entry) return 0
    return Math.round((latestBalance * (note.exposure / 100)) / (strike) / 100)
  }

  return (
    <TooltipProvider delayDuration={100}>
      <div className="mt-12 mb-20 relative">
        {/* Underlying Price Circle */}
        <PriceCircle 
          price={note.underlying_price_entry}
          label="Current price"
          tooltipText="Current price"
          position={middlePosition}
        />
        
        {/* Strike Entry Circle */}
        <PriceCircle 
          price={note.strike_entry}
          label="Entry strike"
          tooltipText="Entry strike"
          position={entryPosition}
        />
        
        {/* Strike Exit Circle */}
        {note.strike_exit && (
          <PriceCircle 
            price={note.strike_exit}
            label="Exit strike"
            tooltipText="Exit strike"
            position={exitPosition}
          />
        )}

        {/* BE Circles */}
        {[
          { position: be1Position, strike: 594 },
          { position: be2Position, strike: 609 },
          { position: be3Position, strike: 613 }
        ].map((be, index) => (
          <PriceCircle 
            key={index}
            price={be.strike}
            label={`BE${index + 1}`}
            tooltipText={`BE${index + 1}`}
            position={be.position}
            style={{ fill: 'rgba(0,0,0,0.2)', color: 'rgba(0,0,0,0.2)' }}
          />
        ))}
        
        {/* Price rectangles */}
        <div className="w-full bg-gray-100 rounded-lg h-4 relative overflow-hidden">
          {/* Green rectangle for potential profit zone */}
          {note.strike_exit && (
            <div 
              className="absolute top-0 bottom-0 bg-green-500"
              style={{ 
                left: `${Math.min(entryPosition, exitPosition)}%`,
                width: `${Math.abs(exitPosition - entryPosition)}%`
              }}
            />
          )}
        </div>
        
        {/* Position indicators */}
        <PositionIndicator 
          strike={note.strike_entry}
          premium={note.premium_entry}
          position={entryPosition}
          isEntry={true}
          note={note}
        />
        
        {note.strike_exit && (
          <PositionIndicator 
            strike={note.strike_exit}
            premium={note.premium_exit}
            position={exitPosition}
            isEntry={false}
            note={note}
          />
        )}
      </div>
    </TooltipProvider>
  )
}
