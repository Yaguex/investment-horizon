import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ReactNode } from "react"

interface MetricTooltipProps {
  children: ReactNode
  description: string
}

export function MetricTooltip({ children, description }: MetricTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger>
        {children}
      </TooltipTrigger>
      <TooltipContent className="bg-black text-white max-w-[400px]">
        {description}
      </TooltipContent>
    </Tooltip>
  )
}