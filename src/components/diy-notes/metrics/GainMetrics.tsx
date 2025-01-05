import { formatNumber } from "../../trade/utils/formatters"
import { TooltipWrapper } from "./TooltipWrapper"

interface GainMetricsProps {
  maxGainPercentage: number
  maxGainDollars: number
  noteNet: number
  totalFee: number
  getNetColor: (value: number) => string
}

export function GainMetrics({ maxGainPercentage, maxGainDollars, noteNet, totalFee, getNetColor }: GainMetricsProps) {
  return (
    <div>
      <p className="text-black">
        <TooltipWrapper content="Total ROI if our target is reached at expiration">
          Max gain: {formatNumber(maxGainPercentage, 2)}% total
        </TooltipWrapper>
        {" "}
        <TooltipWrapper content="Total money earned if our target is reached at expiration">
          (${formatNumber(maxGainDollars, 0)} total)
        </TooltipWrapper>
      </p>
      <p className="text-black">
        Note's net: {" "}
        <TooltipWrapper content="Cost of the option structure minus what we will recoup through bond interests. Ideally, you should be aiming for a costless note">
          <span className={getNetColor(noteNet)}>${formatNumber(noteNet, 0)}</span>
        </TooltipWrapper>
      </p>
      <p className="text-black">
        Options premium: {" "}
        <TooltipWrapper content="Outlay in premiums to enter the trade today">
          <span className="text-red-600">${formatNumber(totalFee, 0)}</span>
        </TooltipWrapper>
      </p>
    </div>
  )
}