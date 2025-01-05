import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface TooltipMetricProps {
  label: string
  value: string
  tooltip: string
  className?: string
  valueClassName?: string
}

export const TooltipMetric = ({ label, value, tooltip, className, valueClassName }: TooltipMetricProps) => (
  <Tooltip>
    <TooltipTrigger>
      <span className={className}>
        {label}: <span className={valueClassName}>{value}</span>
      </span>
    </TooltipTrigger>
    <TooltipContent className="bg-black text-white max-w-[400px]">
      {tooltip}
    </TooltipContent>
  </Tooltip>
)