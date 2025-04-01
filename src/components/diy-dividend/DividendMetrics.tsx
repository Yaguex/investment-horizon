
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
  let underlyingShares, callContracts, putContracts, positionSize, nominalForBonds;
  if (dividend.strike_put === null) {
    // If strike_put is NULL, we can buy into the position in full amount right away.
    underlyingShares =  Math.round(dividend.nominal / dividend.underlying_price)
    callContracts = Math.round(underlyingShares/100)
    putContracts = 0
    positionSize = "full"
    nominalForBonds = 0 // Since we dont have a pending short put, we dont have to freeze any capital in bonds.
  } else {
    // If strike_put is not NULL, we can only buy into the position in half, since the other half would be assigned if the short put triggers.
    underlyingShares =  Math.round((dividend.nominal/2) / dividend.underlying_price)
    callContracts = Math.round(underlyingShares/100)
    putContracts = Math.round(((dividend.nominal/2) / dividend.strike_put)/100)
    positionSize = "half"
    nominalForBonds = dividend.nominal/2 // Half of the nominal must be frozen in bonds through the duration of the DIY Dividend due to the pending short put.
  }

  // Calculate option premium collected.
  const callFee = callContracts * dividend.strike_call_mid * 100
  const putFee = putContracts * dividend.strike_put_mid * 100
  const totalFee = callFee + putFee

  // Calculate money earned through standard dividends
  const totalDividend = underlyingShares * dividend.underlying_price * (dividend.dividend_yield / 100) * yearsUntilExpiration

  // Calculate money earned through bond intests.
  const totalBondYield = nominalForBonds * (dividend.bond_yield / 100) * yearsUntilExpiration

  // Calculate Total Income
  const totalIncome = totalBondYield + totalFee + totalDividend

  // Calculate Net Profit if price remains above strike_call: how much we receive minus how much I will lose in the short call
  const netProfit = totalIncome - (underlyingShares * (dividend.underlying_price - dividend.strike_call))

  // Calculate Extrinsic vs Total ratio
  const extrinsicRatio = (((dividend.strike_call_extrinsic_value * callContracts * 100 ) + (dividend.strike_put_extrinsic_value * putContracts * 100 )) / totalIncome ) * 100

  // Calculate maxAnnualROI. It is the same formula regardless of whether we sell Puts or not.
  const maxAnnualROI = (netProfit / dividend.nominal) * 100 * (365 / daysUntilExpiration)  


  // Calculate maxAnnualROI vs Risk free rate ratio
  const ReturnvsBond = maxAnnualROI / dividend.bond_yield

  // Calculate maxAnnualROI vs Risk free rate ratio
  // Calculate how many short puts we'd have if we didnt go for a DIY Dividend structure.
  let putFeeIfNotDIYDividend;
  if (dividend.strike_put === null) {
    // if we dont have a strike_put, we use the strike_call instead
    putFeeIfNotDIYDividend = Math.round(((dividend.nominal / dividend.strike_call)/100) * dividend.strike_put_mid * 100)
  } else {
    putFeeIfNotDIYDividend = Math.round(((dividend.nominal / dividend.strike_put)/100) * dividend.strike_put_mid * 100)
  }
  const ReturnvsShortPut = totalIncome / (putFeeIfNotDIYDividend + (dividend.nominal * (dividend.bond_yield / 100) * yearsUntilExpiration))


  // Determine the text color based on value above or below 0
  const getNetColor = (value: number) => {
    if (value > 0) return "text-green-600"
    if (value < 0) return "text-red-600"
    return "text-black" // for values equal to 0
  }

  // Determine the text color based on maxAnnualROI value
  const getROIColor = (value: number) => {
    if (value > 10) return "text-green-600"
    if (value < 7) return "text-red-600"
    return "text-orange-500"  // for any other value in between
  }

  // Determine the text color based on Extrinsic vs Total Income ratio value
  const getExtrinsicRatioColor = (value: number) => {
    if (value > 35) return "text-green-600"
    if (value < 25) return "text-red-600"
    return "text-orange-500"  // for any other value in between
  }

  // Determine the text color based on Return vs Bond
  const getReturnvsBondColor = (value: number) => {
    if (value > 2.7) return "text-green-600"
    if (value < 1.7) return "text-red-600"
    return "text-orange-500"  // for any other value in between
  } 

  // Determine the text color based on Return vs Short Put
  const getReturnvsShortPutColor = (value: number) => {
    if (value > 5) return "text-green-600"
    if (value < 3) return "text-red-600"
    return "text-orange-500"  // for any other value in between
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
              Sum of option premiums, dividends and bond yield for the entire duration of the DIY Dividend lifespan. Must keep the DIY Dividend structure in place all the way to expiration to realize this max Total Income.
              </TooltipContent>
            </Tooltip>
          </p>
          <p className="text-black">
            <Tooltip>
              <TooltipTrigger>
                <span>Net profit: </span><span className={getNetColor(netProfit)}>${formatNumber(netProfit, 0)}</span>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
              Net profit (Total Income - loss from assigning the ITM short calls) if price remains above Strike Call at expiration.
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
                Total annualized ROI of our DIY Dividend structure to expiration IF the trade is successful (meaning price remains above the Call Strike at expiration). Must keep the DIY Dividend structure in place all the way to expiration to realize this max Total Income.
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
          <div className="text-center">
            <Tooltip>
              <TooltipTrigger>
                <p className={`${getReturnvsBondColor(ReturnvsBond)} text-xl font-bold`}>x {formatNumber(ReturnvsBond, 1)}</p>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                Return of the DIY Dividend structure, if held to maturity, over the risk free rate. The higher the return vs the risk free rate, the worthier taking the risk is.
              </TooltipContent>
            </Tooltip>
            <p className="text-xs text-black">Return<br />vs Bond</p>
          </div>
          <div className="text-center">
            <Tooltip>
              <TooltipTrigger>
                <p className={`${getReturnvsShortPutColor(ReturnvsShortPut)} text-xl font-bold`}>x {formatNumber(ReturnvsShortPut, 1)}</p>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                How much the DIY Dividend would return vs simply selling puts and freezing nominal in bonds
              </TooltipContent>
            </Tooltip>
            <p className="text-xs text-black">Return<br />vs Short Put</p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
