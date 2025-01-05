import { formatNumber } from "../../trade/utils/formatters"
import { TooltipWrapper } from "./TooltipWrapper"

interface YieldMetricsProps {
  dividendYield: number
  totalDividend: number
  bondYield: number
  totalBondYield: number
}

export function YieldMetrics({ dividendYield, totalDividend, bondYield, totalBondYield }: YieldMetricsProps) {
  return (
    <div>
      <p className="text-black">
        <TooltipWrapper content="Annual dividend yield of the underlying">
          Dividend yield: {dividendYield}% annual
        </TooltipWrapper>
        {" "}
        <TooltipWrapper content="Total money we would have earned in dividend throughout the entire lifespan of the note">
          (${formatNumber(totalDividend, 0)} total)
        </TooltipWrapper>
      </p>
      <p className="text-black">
        <TooltipWrapper content="Annual interest rate of a risk free bond with a maturity similar to the note expiration. This is net dividend, meaning after withholding tax.">
          Bond yield: {bondYield}% annual
        </TooltipWrapper>
        {" "}
        <TooltipWrapper content="Total net money (after withholding tax) we would have earned in dividends throughout the entire lifespan of the note">
          (${formatNumber(totalBondYield, 0)} total)
        </TooltipWrapper>
      </p>
    </div>
  )
}