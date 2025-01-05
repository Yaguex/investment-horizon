import { Circle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatNumber } from "./utils/formatters"

interface StrikeCircleProps {
  position: number
  strike: number
  entryStrike: number
  label: string
  variant?: "primary" | "secondary"
}

export function StrikeCircle({ position, strike, entryStrike, label, variant = "primary" }: StrikeCircleProps) {
  const isProtection = label.toLowerCase().includes("protection")
  const otmCalculation = isProtection
    ? ((strike - entryStrike) * -1) / entryStrike
    : (strike - entryStrike) / entryStrike
  
  return (
    <div 
      className="absolute -translate-x-1/2 -top-6 flex flex-col items-center z-10"
      style={{ left: `${position}%` }}
    >
      <Tooltip>
        <TooltipTrigger>
          <span className="text-sm text-black mb-1">
            <span className="font-bold">${strike}</span>
            <span className="text-xs ml-1">({formatNumber(otmCalculation * 100, 1)}% OTM)</span>
          </span>
        </TooltipTrigger>
        <TooltipContent className="bg-black text-white">
          {label}: ${formatNumber(strike, 2)}
        </TooltipContent>
      </Tooltip>
      <Circle 
        className={`h-4 w-4 ${
          variant === "primary" 
            ? "fill-black text-black" 
            : "fill-black/20 text-black/20"
        }`} 
      />
    </div>
  )
}