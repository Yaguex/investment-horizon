import { formatNumber } from "../../trade/utils/formatters"
import { TooltipMetric } from "./TooltipMetric"

interface RatioMetricsProps {
  maxAnnualROI: number
  leverage: number
  convexity: number
}

export const RatioMetrics = ({ maxAnnualROI, leverage, convexity }: RatioMetricsProps) => {
  const getROIColor = (value: number) => {
    if (value > 15) return "text-green-600"
    if (value < 12) return "text-red-600"
    return "text-orange-500"
  }

  const getLeverageColor = (value: number) => {
    if (value > 1.50) return "text-green-600"
    if (value < 1.20) return "text-red-600"
    return "text-orange-500"
  }

  const getConvexityColor = (value: number) => {
    if (value > 4) return "text-green-600"
    if (value < 3) return "text-red-600"
    return "text-orange-500"
  }

  return (
    <div className="flex gap-8 items-start">
      <div className="text-center">
        <TooltipMetric
          label=""
          value={`${formatNumber(maxAnnualROI, 1)}%`}
          tooltip="Annualized ROI should we reach our target by expiration"
          valueClassName={getROIColor(maxAnnualROI)}
        />
        <p className="text-xs text-black">Max ROI<br />annualized</p>
      </div>
      <div className="text-center">
        <TooltipMetric
          label=""
          value={`x ${formatNumber(leverage, 2)}`}
          tooltip="Dollar-per-dollar gain over just buying the underlying outright. The idea of Leverage comes from being able to afford to buy more Deltas (more calls) than I should have been able to afford had I not financed part of those calls through bond interests plus selling calls+puts. This allows me to kick up my exposure to the position without locking up more than the originally intended nominal (the amount I'm putting in to buy the bonds). Remember though that you have also given up on the dividend yield, so that needs to be subtracted from the nominal to properly calculate the true leverage you get. Also, you give up on the possibility or writing covered calls, but that is hard to quantify"
          valueClassName={getLeverageColor(leverage)}
        />
        <p className="text-xs text-black">Leverage<br />ratio</p>
      </div>
      <div className="text-center">
        <TooltipMetric
          label=""
          value={formatNumber(convexity, 1)}
          tooltip="How many dollars can I potentially earn for every dollar I give up at the risk-free rate. Anything above 4-to-1 is a pretty good convexity bet"
          valueClassName={getConvexityColor(convexity)}
        />
        <p className="text-xs text-black">Convexity<br />ratio</p>
      </div>
    </div>
  )
}