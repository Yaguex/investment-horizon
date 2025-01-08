import { Circle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface BECircleProps {
  price: number
  position: number
  beNumber: number
}

export function BECircle({ price, position, beNumber }: BECircleProps) {
  const style = { fill: 'rgba(0,0,0,0.2)', color: 'rgba(0,0,0,0.2)' }
  const clampedPosition = Math.max(0, Math.min(100, position))

  return (
    <div 
      className="absolute -translate-x-1/2 -top-6 flex flex-col items-center z-10"
      style={{ left: `${clampedPosition}%` }}
    >
      <Tooltip>
        <TooltipTrigger>
          <span className="text-sm mb-1 text-gray-300">
            ${Math.round(price)}
          </span>
        </TooltipTrigger>
        <TooltipContent className="bg-black text-white">
          BE {beNumber}: ${price.toFixed(2)}
        </TooltipContent>
      </Tooltip>
      <Circle className="h-4 w-4" style={style} />
    </div>
  )
}