import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ReactNode } from "react"

interface TooltipWrapperProps {
  children: ReactNode
  content: string
}

export function TooltipWrapper({ children, content }: TooltipWrapperProps) {
  return (
    <Tooltip>
      <TooltipTrigger>
        {children}
      </TooltipTrigger>
      <TooltipContent className="bg-black text-white max-w-[400px]">
        {content}
      </TooltipContent>
    </Tooltip>
  )
}