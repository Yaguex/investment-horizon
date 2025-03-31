
import { formatNumber } from "@/components/trade/utils/formatters"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface DividendMetricsProps {
  dividend: any
}

export function DividendMetrics({ dividend }: DividendMetricsProps) {
  // Calculate days until expiration
  const today = new Date()
  const expirationDate = dividend.expiration ? new Date(dividend.expiration) : today
  const daysUntilExpiration = (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  const yearsUntilExpiration = daysUntilExpiration / 365

  // Calculate the shares of underlying, call contracts and put contracts based on whether we are willing to sell puts
  let underlyingShares, callContracts, putContracts, positionSize, totalBondYield, totalDividend;
  if (dividend.strike_put === null) {
    // If strike_put is NULL, we can buy into the position in full amount right away.
    underlyingShares =  Math.round(dividend.nominal / dividend.underlying_price)
    callContracts = Math.round(underlyingShares/100)
    putContracts = 0
    positionSize = "full"
    totalBondYield = 0
    totalDividend = underlyingShares * dividend.underlying_price * (dividend.dividend_yield / 100) * yearsUntilExpiration
  } else {
    // If strike_put is not NULL, we can only buy into the position in half, since the other half would be assigned if the short put triggers.
    underlyingShares =  Math.round((dividend.nominal/2) / dividend.underlying_price)
    callContracts = Math.round(underlyingShares/100)
    putContracts = Math.round(((dividend.nominal/2) / dividend.strike_put)/100)
    positionSize = "half"
    totalBondYield = (dividend.nominal/2) * (dividend.bond_yield / 100) * yearsUntilExpiration
    totalDividend = underlyingShares * dividend.underlying_price * (dividend.dividend_yield / 100) * yearsUntilExpiration
  }

  // Calculate option premium collected
  const callFee = callContracts * dividend.strike_call_mid * 100
  const putFee = putContracts * dividend.strike_put_mid * 100
  const totalFee = callFee + putFee

  // Calculate Total Incom
  const totalIncome = totalBondYield + totalFee + totalDividend

  // Calculate Extrinsic vs Total ratio
  const extrinsicRatio = (((dividend.strike_call_extrinsic_value * callContracts * 100 ) + (dividend.strike_put_extrinsic_value * putContracts * 100 )) / totalIncome ) * 100

  // Calculate maxAnnualROI
  let maxAnnualROI;
  if (dividend.strike_put === null) {
    maxAnnualROI = (((totalIncome + (dividend.strike_call*callContracts*100)) - (underlyingShares * dividend.underlying_price)) / dividend.nominal) * 100 * (365 / daysUntilExpiration)
  } else {
    maxAnnualROI = 10
  }


  // Determine the color based on value above or below 0
  const getNetColor = (value: number) => {
    if (value > 0) return "text-green-600"
    if (value < 0) return "text-red-600"
    return "text-black" // for values equal to 0
  }

  // Determine the color based on maxAnnualROI value
  const getROIColor = (value: number) => {
    if (value > 10) return "text-green-600"
    if (value < 7) return "text-red-600"
    return "text-orange-500"  // for values between 7 and 10 (inclusive)
  }

  // Determine the color based on Extrinsic vs Total Income ratio value
  const getExtrinsicRatioColor = (value: number) => {
    if (value > 50) return "text-green-600"
    if (value < 30) return "text-red-600"
    return "text-orange-500"  // for values between 30 and 50 (inclusive)
  }

  return (
    <TooltipProvider delayDuration={100}>

      {/* Below goes the small numbers in the bottom left of the display*/}

      <div className="text-sm space-y-2 flex justify-between">
        <div>
          <p className="text-black">
            <Tooltip>
              <TooltipTrigger>
                <span>Shares to buy today: </span><span>{formatNumber(underlyingShares, 0)} shares ({positionSize} position)</span>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                Based on whether we sell puts, this is the numbers of shares we should buy outright today to construct our DIY Dividend. If we sell puts, the amount to buy today will be half of the total allowed by the Nominal exposed.
              </TooltipContent>
            </Tooltip>
          </p>
          <p className="text-black">
            <Tooltip>
              <TooltipTrigger>
                <span>Options premium: </span><span className={getNetColor(totalFee)}>${formatNumber(totalFee, 0)}</span>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
              Earnings collected in option premiums.
              </TooltipContent>
            </Tooltip>
          </p>
          <p className="text-black">
            <Tooltip>
              <TooltipTrigger>
                <span>Dividend income: </span><span className={getNetColor(totalDividend)}>${formatNumber(totalDividend, 0)}</span><span> ({dividend.dividend_yield}% annual)</span>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                Total net money (after withholding tax) earned in dividends throughout the entire lifespan of the DIY Dividend for the amount of shares to be bought today.
              </TooltipContent>
            </Tooltip>
          </p>
          <p className="text-black">
            <Tooltip>
              <TooltipTrigger>
                <span>Bond income: </span><span className={getNetColor(totalBondYield)}>${formatNumber(totalBondYield, 0)}</span><span> ({dividend.bond_yield}% annual)</span>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
              Annual interest rate of a risk free bond with a maturity similar to the dividend expiration. If no puts were sold and a full outright allocation is purchased from the beginning, there will be no allocation to bonds (thus no bonus yield).
              </TooltipContent>
            </Tooltip>
          </p>
          <p className="text-black">
            <Tooltip>
              <TooltipTrigger>
                <span>Total Income: </span><span className={getNetColor(totalIncome)}>${formatNumber(totalIncome, 0)}</span>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
              Sum of option premiums, dividends and bond yield for the entire duration of the DIY Dividend lifespan.
              </TooltipContent>
            </Tooltip>
          </p>
        </div>

        {/* Below goes the large numbers in the bottom right of the display*/}
        
        <div className="flex gap-8 items-start">
          <div className="text-center">
            <Tooltip>
              <TooltipTrigger>
                <p className={`${getROIColor(maxAnnualROI)} text-xl font-bold`}>{formatNumber(maxAnnualROI, 1)}%</p>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                Total annualized ROI of our DIY Dividend structure.
              </TooltipContent>
            </Tooltip>
            <p className="text-xs text-black">DIY Dividend<br />annualized</p>
          </div>
          <div className="text-center">
            <Tooltip>
              <TooltipTrigger>
                <p className={`${getExtrinsicRatioColor(extrinsicRatio)} text-xl font-bold`}>{formatNumber(extrinsicRatio, 1)}%</p>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                How much of the DIY Dividend's total income comes from Extrinsic value (the higher the better). If most of the income comes from intrinsic, bond yield, underlying's natural dividend, etc. then the DIY Dividend structure is not providing much alpha.
              </TooltipContent>
            </Tooltip>
            <p className="text-xs text-black">Extrinsic<br />vs Total</p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
