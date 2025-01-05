import { formatNumber } from "../trade/utils/formatters"
import { TooltipProvider } from "@/components/ui/tooltip"
import { YieldMetrics } from "./metrics/YieldMetrics"
import { GainMetrics } from "./metrics/GainMetrics"
import { RatioMetrics } from "./metrics/RatioMetrics"
import { MetricTooltip } from "./metrics/MetricTooltip"

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

  // Calculate note's net
  const noteNet = totalBondYield + totalFee

  // Calculate max gain in dollars
  const maxGainDollars = ((note.strike_target - note.strike_entry) * entryContracts * 100) + noteNet - (totalFee * (note.wiggle/100))

  // Calculate max gain percentage
  const maxGainPercentage = (maxGainDollars / (note.nominal + totalFee - noteNet + (totalFee * (note.wiggle/100)))) * 100

  // Calculate max annual ROI
  const maxAnnualROI = maxGainPercentage * (365 / daysUntilExpiration)

  // Calculate convexity ratio
  const convexity = maxGainDollars / (noteNet - (totalFee * (note.wiggle/100)) + (note.nominal * ((note.bond_yield/100) * (daysUntilExpiration/365))))

  // Calculate leverage ratio
  const leverage = entryContracts / ((1000000 + totalDividend - noteNet + (totalFee * (note.wiggle/100))) / note.strike_entry / 100)

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
          <MetricTooltip description="IV for calls for the designated expiration">
            <p className="text-black">IV: {note.strike_entry_iv}%</p>
          </MetricTooltip>
          <YieldMetrics 
            note={note}
            totalDividend={totalDividend}
            totalBondYield={totalBondYield}
          />
          <GainMetrics 
            maxGainPercentage={maxGainPercentage}
            maxGainDollars={maxGainDollars}
            noteNet={noteNet}
            totalFee={totalFee}
            getNetColor={getNetColor}
          />
        </div>
        <RatioMetrics 
          maxAnnualROI={maxAnnualROI}
          leverage={leverage}
          convexity={convexity}
          getROIColor={getROIColor}
          getLeverageColor={getLeverageColor}
          getConvexityColor={getConvexityColor}
        />
      </div>
    </TooltipProvider>
  )
}