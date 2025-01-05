import { MetricTooltip } from "./MetricTooltip"
import { formatNumber } from "../../trade/utils/formatters"

interface GainMetricsProps {
  maxGainPercentage: number
  maxGainDollars: number
  noteNet: number
  totalFee: number
  getNetColor: (value: number) => string
}

export function GainMetrics({ maxGainPercentage, maxGainDollars, noteNet, totalFee, getNetColor }: GainMetricsProps) {
  return (
    <>
      <p className="text-black">
        <MetricTooltip description="Total ROI if our target is reached at expiration">
          Max gain: {formatNumber(maxGainPercentage, 2)}% total
        </MetricTooltip>
        {" "}
        <MetricTooltip description="Total money earned if our target is reached at expiration">
          (${formatNumber(maxGainDollars, 0)} total)
        </MetricTooltip>
      </p>
      <p className="text-black">
        Note's net: {" "}
        <MetricTooltip description="Cost of the option structure minus what we will recoup through bond interests. Ideally, you should be aiming for a costless note">
          <span className={getNetColor(noteNet)}>${formatNumber(noteNet, 0)}</span>
        </MetricTooltip>
      </p>
      <p className="text-black">
        Options premium: {" "}
        <MetricTooltip description="Outlay in premiums to enter the trade today">
          <span className="text-red-600">${formatNumber(totalFee, 0)}</span>
        </MetricTooltip>
      </p>
    </>
  )
}