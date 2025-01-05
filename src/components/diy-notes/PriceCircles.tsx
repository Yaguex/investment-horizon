import { Circle } from "lucide-react"
import { formatNumber } from "./utils/formatters"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PriceCircleProps {
  position: number
  price: number
  label: string
  type: 'primary' | 'secondary'
}

export function PriceCircle({ position, price, label, type }: PriceCircleProps) {
  const style = type === 'primary' 
    ? "text-black fill-black"
    : "text-gray-300 fill-[rgba(0,0,0,0.2)]"

  return (
    <div 
      className="absolute -translate-x-1/2 -top-6 flex flex-col items-center z-10"
      style={{ left: `${position}%` }}
    >
      <Tooltip>
        <TooltipTrigger>
          <span className={`text-sm mb-1 ${type === 'secondary' ? 'text-gray-300' : 'text-black'}`}>
            ${Math.round(price)}
          </span>
        </TooltipTrigger>
        <TooltipContent className="bg-black text-white">
          {label}: ${formatNumber(price, 2)}
        </TooltipContent>
      </Tooltip>
      <Circle className={`h-4 w-4 ${style}`} />
    </div>
  )
}