import { Circle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PriceCircleProps {
  price: number
  position: number
  label: string
  variant?: 'primary' | 'secondary'
}

export function PriceCircle({ price, position, label, variant = 'primary' }: PriceCircleProps) {
  const style = variant === 'primary' 
    ? { fill: 'rgb(0,0,0)', color: 'rgb(0,0,0)' }
    : { fill: 'rgba(0,0,0,0.2)', color: 'rgba(0,0,0,0.2)' }

  return (
    <div 
      className="absolute -translate-x-1/2 -top-6 flex flex-col items-center z-10"
      style={{ left: `${position}%` }}
    >
      <Tooltip>
        <TooltipTrigger>
          <span className={`text-sm mb-1 ${variant === 'primary' ? 'text-black' : 'text-gray-300'}`}>
            ${Math.round(price)}
          </span>
        </TooltipTrigger>
        <TooltipContent className="bg-black text-white">
          {label}: ${price}
        </TooltipContent>
      </Tooltip>
      <Circle className="h-4 w-4" style={style} />
    </div>
  )
}