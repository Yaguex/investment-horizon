import { Circle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatNumber } from "../utils/formatters"

interface PriceCircleProps {
  value: number
  label: string
  position: number
  style?: "default" | "muted"
}

export function PriceCircle({ value, label, position, style = "default" }: PriceCircleProps) {
  if (value === 0) return null
  
  return (
    <div 
      className="absolute -translate-x-1/2 -top-6 flex flex-col items-center z-10"
      style={{ left: `${position}%` }}
    >
      <Tooltip>
        <TooltipTrigger>
          <span className={`text-sm mb-1 ${style === "muted" ? "text-gray-300" : "text-black"}`}>
            ${Math.round(value)}
          </span>
        </TooltipTrigger>
        <TooltipContent className="bg-black text-white">
          {label}: ${formatNumber(value, 2)}
        </TooltipContent>
      </Tooltip>
      <Circle 
        className="h-4 w-4" 
        style={style === "muted" ? 
          { fill: 'rgba(0,0,0,0.2)', color: 'rgba(0,0,0,0.2)' } : 
          { fill: 'black', color: 'black' }
        } 
      />
    </div>
  )
}