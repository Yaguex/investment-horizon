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
                Risk free rate: {note.risk_free_yield}% annual
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                Annual interest rate of a risk free bond with a maturity similar to the option expiration
              </TooltipContent>
            </Tooltip>
          </p>
          <p className="text-black">
            <Tooltip>
              <TooltipTrigger>
                Exposure: ${formatNumber(note.exposure, 0)}
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                Amount of capital at risk in this trade
              </TooltipContent>
            </Tooltip>
          </p>
          <p className="text-black">
            <Tooltip>
              <TooltipTrigger>
                Max gain: 15.5% total
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                Maximum potential return if our target is reached
              </TooltipContent>
            </Tooltip>
            {" "}
            <Tooltip>
              <TooltipTrigger>
                (${formatNumber(7750, 0)} total)
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                Maximum potential profit in dollars
              </TooltipContent>
            </Tooltip>
          </p>
          <p className="text-black">
            Premium: {" "}
            <Tooltip>
              <TooltipTrigger>
                <span className="text-red-600">${formatNumber(2500, 0)}</span>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                Cost to enter the position
              </TooltipContent>
            </Tooltip>
          </p>
        </div>
        <div className="flex gap-8 items-start">
          <div className="text-center">
            <Tooltip>
              <TooltipTrigger>
                <p className="text-green-600 text-xl font-bold">25.2%</p>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                Annualized ROI if we reach our target
              </TooltipContent>
            </Tooltip>
            <p className="text-xs text-black">Max ROI<br />annualized</p>
          </div>
          <div className="text-center">
            <Tooltip>
              <TooltipTrigger>
                <p className="text-green-600 text-xl font-bold">0.65</p>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                Delta measures the rate of change in the option price with respect to the underlying asset's price
              </TooltipContent>
            </Tooltip>
            <p className="text-xs text-black">Delta<br />ratio</p>
          </div>
          <div className="text-center">
            <Tooltip>
              <TooltipTrigger>
                <p className="text-orange-500 text-xl font-bold">22.5%</p>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                Implied volatility represents the market's forecast of likely movement in a security's price
              </TooltipContent>
            </Tooltip>
            <p className="text-xs text-black">IV<br />ratio</p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}