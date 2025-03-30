
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

  // Calculate total dividend amount
  const totalDividend = dividend.nominal * (dividend.dividend_yield / 100) * yearsUntilExpiration

  // Calculate total bond yield amount
  const totalBondYield = dividend.nominal * (dividend.bond_yield / 100) * yearsUntilExpiration

  // Calculate the shares of underlying, call contracts and put contracts based on the "action" field value and whether we are willing to sell puts
  let underlyingShares, callContracts, putContracts, positionSize;
  
  if (dividend.strike_put === null) {
    // If strike_put is NULL, we can buy into the position in full amount right away
    underlyingShares =  Math.round(dividend.nominal / dividend.underlying_price)
    callContracts = Math.round(underlyingShares/100)
    putContracts = 0
    positionSize = "full position"
  } else {
    // If strike_put is not NULL, we can only buy into the position in half, since the other half would be assigned if the short put triggers.
    underlyingShares =  Math.round((dividend.nominal/2) / dividend.underlying_price)
    callContracts = Math.round(underlyingShares/100)
    putContracts = Math.round(((dividend.nominal/2) / dividend.strike_put)/100)
    positionSize = "half position"
  }

  // Calculate fees
  const callFee = callContracts * dividend.strike_call_mid * 100 * -1
  const putFee = putContracts * dividend.strike_put_mid * 100
  const totalFee = callFee + putFee

  // Calculate dividend's net
  const dividendNet = totalBondYield + totalFee

  // Calculate max gain in dollars
  const maxGainDollars = ((dividend.strike_put - dividend.strike_call) * callContracts * 100) + dividendNet - (totalFee * (dividend.wiggle/100))

  // Calculate max gain percentage
  const maxGainPercentage = (maxGainDollars / (dividend.nominal + totalFee - dividendNet + (totalFee * (dividend.wiggle/100)))) * 100

  // Calculate max annual ROI
  const maxAnnualROI = maxGainPercentage * (365 / daysUntilExpiration)

  // Calculate convexity ratio
  const convexity = maxGainDollars / (dividendNet - (totalFee * (dividend.wiggle/100)) + (dividend.nominal * ((dividend.bond_yield/100) * (daysUntilExpiration/365))))

  // Calculate leverage ratio
  const leverage = callContracts / ((1000000 + totalDividend - dividendNet + (totalFee * (dividend.wiggle/100))) / dividend.strike_call / 100)

  // Determine the color based on dividendNet value
  const getNetColor = (value: number) => {
    if (value > 0) return "text-green-600"
    if (value < 0) return "text-red-600"
    return "text-black"
  }

  // Determine the color based on maxAnnualROI value
  const getROIColor = (value: number) => {
    if (value > 15) return "text-green-600"
    if (value < 12) return "text-red-600"
    return "text-orange-500"  // for values between 12 and 15 (inclusive)
  }

  // Determine the color based on convexity value
  const getConvexityColor = (value: number) => {
    if (value > 4) return "text-green-600"
    if (value < 3) return "text-red-600"
    return "text-orange-500"  // for values between 3 and 4 (inclusive)
  }

  // Determine the color based on leverage value
  const getLeverageColor = (value: number) => {
    if (value > 1.50) return "text-green-600"
    if (value < 1.20) return "text-red-600"
    return "text-orange-500"  // for values between 1.20 and 1.50 (inclusive)
  }

  return (
    <TooltipProvider delayDuration={100}>
      <div className="text-sm space-y-2 flex justify-between">
        <div>
        <p className="text-black">
            <Tooltip>
              <TooltipTrigger>
                Shares to buy today: {formatNumber(underlyingShares, 0)} shares ({positionSize})
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                Based on the nominal, the underlying's current price, and whether we want to enter or exit the position, this is the numbers of shares we should buy outright now to construct our DIY Dividend
              </TooltipContent>
            </Tooltip>
          </p>
          <p className="text-black">
            <Tooltip>
              <TooltipTrigger>
                Dividend yield: {dividend.dividend_yield}% annual
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                Net annual dividend yield, meaning after withholding tax
              </TooltipContent>
            </Tooltip>
            {" "}
            <Tooltip>
              <TooltipTrigger>
                (${formatNumber(totalDividend, 0)} total)
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                Total net money (after withholding tax) we would have earned in dividends throughout the entire lifespan of the dividend if we had bought the underlying
              </TooltipContent>
            </Tooltip>
          </p>
          <p className="text-black">
            <Tooltip>
              <TooltipTrigger>
                Bond yield: {dividend.bond_yield}% annual
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                Annual interest rate of a risk free bond with a maturity similar to the dividend expiration
              </TooltipContent>
            </Tooltip>
            {" "}
            <Tooltip>
              <TooltipTrigger>
                (${formatNumber(totalBondYield, 0)} total)
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                Total money we will earn from the bond interests throughout the entire lifespan of the dividend
              </TooltipContent>
            </Tooltip>
          </p>
          <p className="text-black">
            <Tooltip>
              <TooltipTrigger>
                Max gain: {formatNumber(maxGainPercentage, 2)}% total
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                Total ROI if our put is reached at expiration
              </TooltipContent>
            </Tooltip>
            {" "}
            <Tooltip>
              <TooltipTrigger>
                (${formatNumber(maxGainDollars, 0)} total)
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                Total money earned if our put is reached at expiration
              </TooltipContent>
            </Tooltip>
          </p>
          <p className="text-black">
          Dividend's net: {" "}
            <Tooltip>
              <TooltipTrigger>
                <span className={getNetColor(dividendNet)}>${formatNumber(dividendNet, 0)}</span>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                Cost of the option structure minus what we will recoup through bond interests. Ideally, you should be aiming for a costless dividend
              </TooltipContent>
            </Tooltip>
          </p>
          <p className="text-black">
            Options premium: {" "}
            <Tooltip>
              <TooltipTrigger>
                <span className="text-red-600">${formatNumber(totalFee, 0)}</span>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                Outlay in premiums to enter the trade today
              </TooltipContent>
            </Tooltip>
          </p>
        </div>
        <div className="flex gap-8 items-start">
          <div className="text-center">
            <Tooltip>
              <TooltipTrigger>
                <p className={`${getROIColor(maxAnnualROI)} text-xl font-bold`}>{formatNumber(maxAnnualROI, 1)}%</p>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                Annualized ROI should we reach our put by expiration
              </TooltipContent>
            </Tooltip>
            <p className="text-xs text-black">Max ROI<br />annualized</p>
          </div>
          <div className="text-center">
            <Tooltip>
              <TooltipTrigger>
                <p className={`${getLeverageColor(leverage)} text-xl font-bold`}>x {formatNumber(leverage, 2)}</p>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                Dollar-per-dollar gain over just buying the underlying outright. The idea of Leverage comes from being able to afford to buy more Deltas (more calls) than I should have been able to afford had I not financed part of those calls through bond interests plus selling calls+puts. This allows me to kick up my exposure to the position without locking up more than the originally intended nominal (the amount I'm putting in to buy the bonds). Remember though that you have also given up on the dividend yield, so that needs to be subtracted from the nominal to properly calculate the true leverage you get. Also, you give up on the possibility or writing covered calls, but that is hard to quantify
              </TooltipContent>
            </Tooltip>
            <p className="text-xs text-black">Leverage<br />ratio</p>
          </div>
          <div className="text-center">
            <Tooltip>
              <TooltipTrigger>
                <p className={`${getConvexityColor(convexity)} text-xl font-bold`}>{formatNumber(convexity, 1)}</p>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                How many dollars can I potentially earn for every dollar I give up at the risk-free rate. Anything above 4-to-1 is a pretty good convexity bet
              </TooltipContent>
            </Tooltip>
            <p className="text-xs text-black">Convexity<br />ratio</p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
