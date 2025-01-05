import { MetricTooltip } from "./MetricTooltip"
import { formatNumber } from "../../trade/utils/formatters"

interface YieldMetricsProps {
  note: any
  totalDividend: number
  totalBondYield: number
}

export function YieldMetrics({ note, totalDividend, totalBondYield }: YieldMetricsProps) {
  return (
    <>
      <p className="text-black">
        <MetricTooltip description="Annual dividend yield of the underlying">
          Dividend yield: {note.dividend_yield}% annual
        </MetricTooltip>
        {" "}
        <MetricTooltip description="Total money we would have earned in dividend throughout the entire lifespan of the note">
          (${formatNumber(totalDividend, 0)} total)
        </MetricTooltip>
      </p>
      <p className="text-black">
        <MetricTooltip description="Annual interest rate of a risk free bond with a maturity similar to the note expiration">
          Bond yield: {note.bond_yield}% annual
        </MetricTooltip>
        {" "}
        <MetricTooltip description="Total money we will earn from the bond interests throughout the entire lifespan of the note">
          (${formatNumber(totalBondYield, 0)} total)
        </MetricTooltip>
      </p>
    </>
  )
}