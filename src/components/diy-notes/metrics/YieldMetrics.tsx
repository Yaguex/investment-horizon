import { formatNumber } from "../../trade/utils/formatters"
import { TooltipMetric } from "./TooltipMetric"

interface YieldMetricsProps {
  note: any
  totalDividend: number
  totalBondYield: number
  yearsUntilExpiration: number
}

export const YieldMetrics = ({ note, totalDividend, totalBondYield, yearsUntilExpiration }: YieldMetricsProps) => (
  <div>
    <p className="text-black">
      <TooltipMetric
        label="Dividend yield"
        value={`${note.dividend_yield}% annual`}
        tooltip="Annual interest rate of a risk free bond with a maturity similar to the note expiration. This is net dividend, meaning after withholding tax"
      />
      {" "}
      <TooltipMetric
        label=""
        value={`($${formatNumber(totalDividend, 0)} total)`}
        tooltip="Total net money (after withholding tax) we would have earned in dividends throughout the entire lifespan of the note"
      />
    </p>
    <p className="text-black">
      <TooltipMetric
        label="Bond yield"
        value={`${note.bond_yield}% annual`}
        tooltip="Annual interest rate of a risk free bond with a maturity similar to the note expiration"
      />
      {" "}
      <TooltipMetric
        label=""
        value={`($${formatNumber(totalBondYield, 0)} total)`}
        tooltip="Total money we will earn from the bond interests throughout the entire lifespan of the note"
      />
    </p>
  </div>
)