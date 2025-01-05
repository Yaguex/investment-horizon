import { formatNumber } from "../../trade/utils/formatters"
import { TooltipWrapper } from "./TooltipWrapper"

interface RatioMetricsProps {
  maxAnnualROI: number
  leverage: number
  convexity: number
  getROIColor: (value: number) => string
  getLeverageColor: (value: number) => string
  getConvexityColor: (value: number) => string
}

export function RatioMetrics({ 
  maxAnnualROI, 
  leverage, 
  convexity,
  getROIColor,
  getLeverageColor,
  getConvexityColor
}: RatioMetricsProps) {
  return (
    <div className="flex gap-8 items-start">
      <div className="text-center">
        <TooltipWrapper content="Annualized ROI should we reach our target by expiration">
          <p className={`${getROIColor(maxAnnualROI)} text-xl font-bold`}>{formatNumber(maxAnnualROI, 1)}%</p>
        </TooltipWrapper>
        <p className="text-xs text-black">Max ROI<br />annualized</p>
      </div>
      <div className="text-center">
        <TooltipWrapper content="Dollar-per-dollar gain over just buying the underlying outright. The idea of Leverage comes from being able to afford to buy more Deltas (more calls) than I should have been able to afford had I not financed part of those calls through bond interests plus selling calls+puts. This allows me to kick up my exposure to the position without locking up more than the originally intended nominal (the amount I'm putting in to buy the bonds). Remember though that you have also given up on the dividend yield, so that needs to be subtracted from the nominal to properly calculate the true leverage you get. Also, you give up on the possibility or writing covered calls, but that is hard to quantify">
          <p className={`${getLeverageColor(leverage)} text-xl font-bold`}>x {formatNumber(leverage, 2)}</p>
        </TooltipWrapper>
        <p className="text-xs text-black">Leverage<br />ratio</p>
      </div>
      <div className="text-center">
        <TooltipWrapper content="How many dollars can I potentially earn for every dollar I give up at the risk-free rate. Anything above 4-to-1 is a pretty good convexity bet">
          <p className={`${getConvexityColor(convexity)} text-xl font-bold`}>{formatNumber(convexity, 1)}</p>
        </TooltipWrapper>
        <p className="text-xs text-black">Convexity<br />ratio</p>
      </div>
    </div>
  )
}