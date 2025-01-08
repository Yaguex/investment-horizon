import { Circle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatNumber } from "../utils/formatters"

interface PriceCircleProps {
  price: number
  label: string
  tooltipText: string
  position: number
  style?: React.CSSProperties
}

export function PriceCircle({ price, label, tooltipText, position, style = {} }: PriceCircleProps) {
  return (
    <div 
      className="absolute -translate-x-1/2 -top-6 flex flex-col items-center z-10"
      style={{ left: `${position}%`, ...style }}
    >
      <Tooltip>
        <TooltipTrigger>
          <span className="text-sm text-black mb-1">${formatNumber(price, 0)}</span>
        </TooltipTrigger>
        <TooltipContent className="bg-black text-white">
          {tooltipText}: ${formatNumber(price, 0)}
        </TooltipContent>
      </Tooltip>
      <Circle className="h-4 w-4 fill-black text-black" />
    </div>
  )
}