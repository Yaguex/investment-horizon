import { Circle } from "lucide-react"
import { formatNumber } from "./utils/formatters"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PriceVisualizationProps {
  note: any
}

const calculateCirclePositions = (note: any) => {
  const middlePosition = 50
  let entryPosition, exitPosition

  // For testing purposes, we'll use the hardcoded values
  const testNote = {
    ...note,
    strike_entry: 580,
    strike_exit: 540,
    underlying_price_entry: 590
  }

  if (!testNote.underlying_price_entry || !testNote.strike_entry || !testNote.strike_exit) {
    return { middlePosition, entryPosition: middlePosition, exitPosition: middlePosition }
  }

  // Get the absolute differences from underlying price
  const entryDiff = Math.abs(testNote.strike_entry - testNote.underlying_price_entry)
  const exitDiff = Math.abs(testNote.strike_exit - testNote.underlying_price_entry)

  // Determine which strike is furthest from underlying price
  if (exitDiff > entryDiff) {
    // Exit strike is furthest
    exitPosition = testNote.strike_exit < testNote.underlying_price_entry ? 10 : 90
    
    // Calculate entry position proportionally between underlying and exit
    const totalRange = Math.abs(testNote.underlying_price_entry - testNote.strike_exit)
    const entryRange = Math.abs(testNote.underlying_price_entry - testNote.strike_entry)
    const proportion = entryRange / totalRange
    
    entryPosition = testNote.strike_entry < testNote.underlying_price_entry
      ? middlePosition - (40 * proportion)
      : middlePosition + (40 * proportion)
  } else {
    // Entry strike is furthest
    entryPosition = testNote.strike_entry < testNote.underlying_price_entry ? 10 : 90
    
    // Calculate exit position proportionally between underlying and entry
    const totalRange = Math.abs(testNote.underlying_price_entry - testNote.strike_entry)
    const exitRange = Math.abs(testNote.underlying_price_entry - testNote.strike_exit)
    const proportion = exitRange / totalRange
    
    exitPosition = testNote.strike_exit < testNote.underlying_price_entry
      ? middlePosition - (40 * proportion)
      : middlePosition + (40 * proportion)
  }

  // Calculate positions for semi-transparent circles
  const calculateSemiTransparentPosition = (strike: number) => {
    const strikeDiff = Math.abs(strike - testNote.underlying_price_entry)
    if (strikeDiff > exitDiff) {
      return strike < testNote.underlying_price_entry ? 5 : 95
    }
    const proportion = strikeDiff / Math.max(exitDiff, entryDiff)
    return strike < testNote.underlying_price_entry
      ? middlePosition - (45 * proportion)
      : middlePosition + (45 * proportion)
  }

  return {
    middlePosition,
    entryPosition,
    exitPosition,
    circle594Position: calculateSemiTransparentPosition(594),
    circle609Position: calculateSemiTransparentPosition(609),
    circle613Position: calculateSemiTransparentPosition(613)
  }
}

const getValueColor = (value: number, type: 'roi' | 'delta') => {
  if (type === 'roi') {
    if (value > 10) return 'text-green-600'
    if (value > 6) return 'text-orange-500'
    if (value > 0) return 'text-red-600'
    if (value > -6) return 'text-green-600'
    if (value > -10) return 'text-orange-500'
    return 'text-red-600'
  } else {
    if (value > 0.6) return 'text-green-600'
    if (value > 0.3) return 'text-orange-500'
    if (value > 0) return 'text-red-600'
    if (value > -0.3) return 'text-green-600'
    if (value > -0.6) return 'text-orange-500'
    return 'text-red-600'
  }
}

export function PriceVisualization({ note }: PriceVisualizationProps) {
  const { 
    middlePosition, 
    entryPosition, 
    exitPosition,
    circle594Position,
    circle609Position,
    circle613Position 
  } = calculateCirclePositions(note)
  
  return (
    <TooltipProvider delayDuration={100}>
      <div className="mt-12 mb-20 relative">
        {/* Semi-transparent circles */}
        {[
          { strike: 594, position: circle594Position },
          { strike: 609, position: circle609Position },
          { strike: 613, position: circle613Position }
        ].map(({ strike, position }) => (
          <div 
            key={strike}
            className="absolute -translate-x-1/2 -top-6 flex flex-col items-center z-0"
            style={{ left: `${position}%` }}
          >
            <span className="text-sm text-gray-300 mb-1">${strike}</span>
            <Circle className="h-4 w-4" style={{ fill: 'rgba(0,0,0,0.2)', color: 'rgba(0,0,0,0.2)' }} />
          </div>
        ))}

        {/* Underlying Price Circle (Middle) */}
        <div 
          className="absolute -translate-x-1/2 -top-6 flex flex-col items-center z-10"
          style={{ left: `${middlePosition}%` }}
        >
          <Tooltip>
            <TooltipTrigger>
              <span className="text-sm text-black mb-1">$590</span>
            </TooltipTrigger>
            <TooltipContent className="bg-black text-white">
              Current price: $590
            </TooltipContent>
          </Tooltip>
          <Circle className="h-4 w-4 fill-black text-black" />
        </div>
        
        {/* Strike Entry Circle */}
        <div 
          className="absolute -translate-x-1/2 -top-6 flex flex-col items-center z-10"
          style={{ left: `${entryPosition}%` }}
        >
          <Tooltip>
            <TooltipTrigger>
              <span className="text-sm text-black mb-1">$580</span>
            </TooltipTrigger>
            <TooltipContent className="bg-black text-white">
              Entry strike: $580
            </TooltipContent>
          </Tooltip>
          <Circle className="h-4 w-4 fill-black text-black" />
        </div>
        
        {/* Strike Exit Circle */}
        <div 
          className="absolute -translate-x-1/2 -top-6 flex flex-col items-center z-10"
          style={{ left: `${exitPosition}%` }}
        >
          <Tooltip>
            <TooltipTrigger>
              <span className="text-sm text-black mb-1">$540</span>
            </TooltipTrigger>
            <TooltipContent className="bg-black text-white">
              Exit strike: $540
            </TooltipContent>
          </Tooltip>
          <Circle className="h-4 w-4 fill-black text-black" />
        </div>
        
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
        <div 
          className="absolute -translate-x-1/2 top-8 flex flex-col items-center"
          style={{ left: `${entryPosition}%` }}
        >
          <span className="text-xs text-black">-42P for $2.03</span>
          <span className="text-xs text-black">8% OTM</span>
        </div>
        <div 
          className="absolute -translate-x-1/2 top-8 flex flex-col items-center"
          style={{ left: `${exitPosition}%` }}
        >
          <span className="text-xs text-black">+42P for $20.74</span>
          <span className="text-xs text-black">15% OTM</span>
        </div>

        {/* Metrics */}
        <div className="text-sm space-y-2 flex justify-between">
          <div>
            <p className="text-black">
              <Tooltip>
                <TooltipTrigger>
                  Exposure: 3% (${formatNumber(730000, 0)})
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white max-w-[400px]">
                  Percentage of portfolio at risk
                </TooltipContent>
              </Tooltip>
            </p>
            <p className="text-black">
              <Tooltip>
                <TooltipTrigger>
                  Premium: ${formatNumber(18394, 0)}
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white max-w-[400px]">
                  Total premium paid
                </TooltipContent>
              </Tooltip>
            </p>
            <p className="text-black">
              <Tooltip>
                <TooltipTrigger>
                  Commission: ${formatNumber(1830, 0)}
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white max-w-[400px]">
                  Total commission cost
                </TooltipContent>
              </Tooltip>
            </p>
            <p className="text-black">
              <Tooltip>
                <TooltipTrigger>
                  Max gain: ${formatNumber(16564, 0)}
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white max-w-[400px]">
                  Maximum potential gain
                </TooltipContent>
              </Tooltip>
            </p>
          </div>
          <div className="flex gap-8 items-start">
            <div className="text-center">
              <Tooltip>
                <TooltipTrigger>
                  <p className={`text-xl font-bold ${getValueColor(9.71, 'roi')}`}>9.71%</p>
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white max-w-[400px]">
                  Premium Annual ROI
                </TooltipContent>
              </Tooltip>
              <p className="text-xs text-black">Premium<br />Annual ROI</p>
            </div>
            <div className="text-center">
              <Tooltip>
                <TooltipTrigger>
                  <p className={`text-xl font-bold ${getValueColor(0.49, 'delta')}`}>0.49</p>
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white max-w-[400px]">
                  Delta normalized for position size
                </TooltipContent>
              </Tooltip>
              <p className="text-xs text-black">Delta<br />Normalized</p>
            </div>
            <div className="text-center">
              <Tooltip>
                <TooltipTrigger>
                  <p className="text-xl font-bold text-black">240</p>
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white max-w-[400px]">
                  Number of contracts in the position
                </TooltipContent>
              </Tooltip>
              <p className="text-xs text-black">Contracts</p>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}