import { formatNumber } from "../../trade/utils/formatters"
import { TooltipMetric } from "./TooltipMetric"

interface GainMetricsProps {
  maxGainPercentage: number
  maxGainDollars: number
  noteNet: number
  totalFee: number
}

export const GainMetrics = ({ maxGainPercentage, maxGainDollars, noteNet, totalFee }: GainMetricsProps) => {
  const getNetColor = (value: number) => {
    if (value > 0) return "text-green-600"
    if (value < 0) return "text-red-600"
    return "text-black"
  }

  return (
    <div>
      <p className="text-black">
        <TooltipMetric
          label="Max gain"
          value={`${formatNumber(maxGainPercentage, 2)}% total`}
          tooltip="Total ROI if our target is reached at expiration"
        />
        {" "}
        <TooltipMetric
          label=""
          value={`($${formatNumber(maxGainDollars, 0)} total)`}
          tooltip="Total money earned if our target is reached at expiration"
        />
      </p>
      <p className="text-black">
        <TooltipMetric
          label="Note's net"
          value={`$${formatNumber(noteNet, 0)}`}
          tooltip="Cost of the option structure minus what we will recoup through bond interests. Ideally, you should be aiming for a costless note"
          valueClassName={getNetColor(noteNet)}
        />
      </p>
      <p className="text-black">
        <TooltipMetric
          label="Options premium"
          value={`$${formatNumber(totalFee, 0)}`}
          tooltip="Outlay in premiums to enter the trade today"
          valueClassName="text-red-600"
        />
      </p>
    </div>
  )
}