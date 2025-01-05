import { formatNumber } from "../trade/utils/formatters"

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

  // Determine the color based on noteNet value
  const getNetColor = (value: number) => {
    if (value > 0) return "text-green-600"
    if (value < 0) return "text-red-600"
    return "text-black"
  }

  return (
    <div className="text-sm space-y-2 flex justify-between">
      <div>
        <p className="text-black">
          Dividend yield: {note.dividend_yield}% annual (${formatNumber(totalDividend, 0)} total)
        </p>
        <p className="text-black">
          Bond yield: {note.bond_yield}% annual (${formatNumber(totalBondYield, 0)} total)
        </p>
        <p className="text-black">Max gain: {formatNumber(maxGainPercentage, 2)}% total (${formatNumber(maxGainDollars, 0)} total)</p>
        <p className="text-black">Note's net: <span className={getNetColor(noteNet)}>${formatNumber(noteNet, 0)}</span></p>
        <p className="text-black">Options premium: <span className="text-red-600">${formatNumber(totalFee, 0)}</span></p>
      </div>
      <div className="flex gap-8 items-start">
        <div className="text-center">
          <p className="text-red-600 text-xl font-bold">8.3%</p>
          <p className="text-xs text-black">Max ROI<br />annualized</p>
        </div>
        <div className="text-center">
          <p className="text-green-600 text-xl font-bold">58%</p>
          <p className="text-xs text-black">Leverage<br />ratio</p>
        </div>
        <div className="text-center">
          <p className="text-red-600 text-xl font-bold">2.0</p>
          <p className="text-xs text-black">Convexity<br />ratio</p>
        </div>
      </div>
    </div>
  )
}