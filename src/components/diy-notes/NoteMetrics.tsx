import { formatNumber } from "../trade/utils/formatters"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface NoteMetricsProps {
  note: any
}

export function NoteMetrics({ note }: NoteMetricsProps) {
  // Calculate days until expiration
  const today = new Date()
  const expirationDate = note.expiration ? new Date(note.expiration) : today
  const daysUntilExpiration = (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  const yearsUntilExpiration = daysUntilExpiration / 365

  // Calculate total dividend amount
  const totalDividend = note.nominal * (note.dividend_yield / 100) * yearsUntilExpiration

  // Calculate total bond yield amount
  const totalBondYield = note.nominal * (note.bond_yield / 100) * yearsUntilExpiration

  // Calculate protection contracts
  const protectionContracts = Math.round(note.nominal / note.strike_protection / 100)

  // Calculate entry contracts
  const entryContracts = Math.round(
    ((totalBondYield * -1) - (protectionContracts * note.strike_protection_mid * 100)) / 
    ((note.strike_target_mid * 100) - (note.strike_entry_mid * 100))
  )

  // Calculate target contracts (equal to entry contracts)
  const targetContracts = entryContracts

  // Calculate fees
  const protectionFee = protectionContracts * note.strike_protection_mid * 100
  const entryFee = entryContracts * note.strike_entry_mid * 100 * -1
  const targetFee = targetContracts * note.strike_target_mid * 100
  const totalFee = entryFee + targetFee + protectionFee
  const wiggleDollars = totalFee * (note.wiggle/100)

  // Calculate note's net
  const noteNet = totalBondYield + totalFee

  // Calculate max gain in dollars
  const maxGainDollars = ((note.strike_target - note.strike_entry) * entryContracts * 100) + noteNet - (totalFee * (note.wiggle/100))

  // Calculate max gain percentage
  const maxGainPercentage = (maxGainDollars / note.nominal) * 100

  // Calculate max annual ROI
  const maxAnnualROI = maxGainPercentage * (365 / daysUntilExpiration)

  // Calculate leverage (leverage vs underlying)
  const leverage = maxGainDollars / ((note.nominal * (note.strike_target - note.strike_entry)) + totalDividend)

  // Calculate convexity (leverage vs bond)
  const convexity = maxGainDollars / (noteNet - wiggleDollars + (note.nominal * ((note.bond_yield/100) * (daysUntilExpiration/365))))

  // Determine the color based on noteNet value
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
                Hypothetical dividends: <span className={getNetColor(totalDividend)}>${formatNumber(totalDividend, 0)}</span> ({note.dividend_yield}% annual)
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
              Dividend earnings (after withholding tax) throughout the entire lifespan of the note if we had bought the underlying instead of going for the DIY Note.
              </TooltipContent>
            </Tooltip>
          </p>
          <p className="text-black">
            <Tooltip>
              <TooltipTrigger>
                Bond income: <span className={getNetColor(totalBondYield)}>${formatNumber(totalBondYield, 0)}</span> ({note.bond_yield}% annual)
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                Total interests we will earn from a bond with similar maturity interests throughout the entire lifespan of the note
              </TooltipContent>
            </Tooltip>
          </p>
          <p className="text-black">
            <Tooltip>
              <TooltipTrigger>
                Max gain: <span className={getNetColor(maxGainDollars)}>${formatNumber(maxGainDollars, 0)}</span> ({formatNumber(maxGainPercentage, 1)}% total)
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                Total earnings if our target is reached at expiration
              </TooltipContent>
            </Tooltip>
          </p>
          <p className="text-black">
            <Tooltip>
              <TooltipTrigger>
               Note's net: <span className={getNetColor(noteNet)}>${formatNumber(noteNet, 0)}</span>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                Cost of the option structure minus what we will recoup through bond interests. Ideally, you should be aiming for a costless note
              </TooltipContent>
            </Tooltip>
          </p>
          <p className="text-black">
            <Tooltip>
              <TooltipTrigger>
                Options premium: <span className="text-red-600">${formatNumber(totalFee, 0)}</span>
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
                Annualized ROI should we reach our target by expiration
              </TooltipContent>
            </Tooltip>
            <p className="text-xs text-black">Max ROI<br />annualized</p>
          </div>
          <div className="text-center">
            <Tooltip>
              <TooltipTrigger>
                <p className={`${getLeverageColor(leverage)} text-xl font-bold`}>x {formatNumber(leverage, 1)}</p>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                Dollar-per-dollar gain over just buying the underlying outright. The idea of Leverage comes from being able to afford to buy more Deltas (more calls) than I should have been able to afford had I not financed part of those calls through bond interests plus selling calls+puts. This allows me to kick up my exposure to the position without locking up more than the originally intended nominal (which is the amount I'm freezing in bonds). Remember though that you have also given up on the dividend yield, so that needs to be accounted for.
              </TooltipContent>
            </Tooltip>
            <p className="text-xs text-black">Leverage<br />vs Underlying</p>
          </div>
          <div className="text-center">
            <Tooltip>
              <TooltipTrigger>
                <p className={`${getConvexityColor(convexity)} text-xl font-bold`}>x {formatNumber(convexity, 1)}</p>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                How many dollars can I potentially earn for every dollar I give up at the risk-free rate. Anything above 4-to-1 is a pretty good convexity bet
              </TooltipContent>
            </Tooltip>
            <p className="text-xs text-black">Leverage<br />vs Risk Free</p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
