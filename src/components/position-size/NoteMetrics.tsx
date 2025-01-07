import { formatNumber } from "./utils/formatters"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface NoteMetricsProps {
  note: any
}

export function NoteMetrics({ note }: NoteMetricsProps) {
  return (
    <TooltipProvider delayDuration={100}>
      <div className="text-sm space-y-2 flex justify-between">
        <div>
          <p className="text-black">
            <Tooltip>
              <TooltipTrigger>
                Exposure: {note.exposure || 0}%
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                Percentage of portfolio at risk
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
                Net premium: ${formatNumber(18394, 0)}
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                Total net premium paid
              </TooltipContent>
            </Tooltip>
          </p>
        </div>
        <div className="flex gap-8 items-start">
          <div className="text-center">
            <Tooltip>
              <TooltipTrigger>
                <p className="text-green-600 text-xl font-bold">9.71%</p>
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
                <p className="text-green-600 text-xl font-bold">0.49</p>
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
                <p className="text-orange-500 text-xl font-bold">240</p>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                Number of contracts in the position
              </TooltipContent>
            </Tooltip>
            <p className="text-xs text-black">Contracts</p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}