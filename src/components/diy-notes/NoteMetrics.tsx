
import { formatNumber, formatDate } from "./utils/formatters"

interface NoteMetricsProps {
  note: any
}

export function NoteMetrics({ note }: NoteMetricsProps) {
  // Calculate days until expiration
  const today = new Date()
  const expirationDate = note.expiration ? new Date(note.expiration) : today
  const daysUntilExpiration = Math.max(0, Math.round((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
  const yearsUntilExpiration = daysUntilExpiration / 365

  // Calculate protection contracts
  const protectionContracts = note.strike_protection ? Math.round(note.nominal / note.strike_protection / 100) : 0

  // Calculate bond yield
  const totalBondYield = note.nominal * (note.bond_yield / 100) * yearsUntilExpiration

  // Calculate entry contracts
  const entryContracts = note.strike_entry && note.strike_target && note.strike_protection && note.strike_entry_mid && note.strike_target_mid && note.strike_protection_mid ? 
    Math.round(
      ((totalBondYield * -1) - (protectionContracts * note.strike_protection_mid * 100)) / 
      ((note.strike_target_mid * 100) - (note.strike_entry_mid * 100))
    ) : 0

  // Calculate target contracts (same as entry contracts)
  const targetContracts = entryContracts

  // Calculate fees and net cost
  const protectionFee = protectionContracts * (note.strike_protection_mid || 0) * 100
  const entryFee = entryContracts * (note.strike_entry_mid || 0) * 100 * -1
  const targetFee = targetContracts * (note.strike_target_mid || 0) * 100
  const noteNet = protectionFee + entryFee + targetFee

  // Calculate wiggle as percentage of target strike
  const wiggleDollars = (note.wiggle || 0) / 100 * note.nominal

  // Calculate total dividend
  const totalDividend = (note.dividend_yield || 0) / 100 * note.nominal * yearsUntilExpiration

  // Calculate potential outcomes
  const maxGainDollars = entryContracts * 100 * (note.strike_target - note.strike_entry)
  
  // Calculate leverage (max gain / difference between target and entry strikes)
  const denominator = ((note.nominal * (note.strike_target - note.strike_entry)) + totalDividend)
  const leverage = denominator !== 0 ? maxGainDollars / denominator : 0

  // Calculate convexity (leverage vs bond)
  // Fixed the syntax error in this line by balancing the parentheses
  const convexity = (noteNet - wiggleDollars) !== 0 ? 
    maxGainDollars / ((noteNet - wiggleDollars) + (note.nominal * ((note.bond_yield/100) * (daysUntilExpiration/365)))) : 0

  // Determine the color based on noteNet value
  const getNetColor = (value: number) => {
    if (value > 0) return "text-green-500"
    if (value < 0) return "text-red-500"
    return "text-gray-500"
  }
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="text-sm text-gray-500">Days Until Expiration</div>
        <div className="text-xl font-semibold">{daysUntilExpiration}</div>
      </div>
      
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="text-sm text-gray-500">Entry Contracts</div>
        <div className="text-xl font-semibold">{entryContracts}</div>
      </div>
      
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="text-sm text-gray-500">Protection Contracts</div>
        <div className="text-xl font-semibold">{protectionContracts}</div>
      </div>
      
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="text-sm text-gray-500">Target Contracts</div>
        <div className="text-xl font-semibold">{targetContracts}</div>
      </div>
      
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="text-sm text-gray-500">Protection Fee</div>
        <div className={`text-xl font-semibold ${getNetColor(protectionFee)}`}>${formatNumber(protectionFee, 0)}</div>
      </div>
      
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="text-sm text-gray-500">Entry Fee</div>
        <div className={`text-xl font-semibold ${getNetColor(entryFee)}`}>${formatNumber(entryFee, 0)}</div>
      </div>
      
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="text-sm text-gray-500">Target Fee</div>
        <div className={`text-xl font-semibold ${getNetColor(targetFee)}`}>${formatNumber(targetFee, 0)}</div>
      </div>
      
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="text-sm text-gray-500">Net</div>
        <div className={`text-xl font-semibold ${getNetColor(noteNet)}`}>${formatNumber(noteNet, 0)}</div>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="text-sm text-gray-500">Max Gain</div>
        <div className="text-xl font-semibold text-green-500">${formatNumber(maxGainDollars, 0)}</div>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="text-sm text-gray-500">Leverage</div>
        <div className="text-xl font-semibold">{formatNumber(leverage, 2)}x</div>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="text-sm text-gray-500">Convexity</div>
        <div className="text-xl font-semibold">{formatNumber(convexity, 2)}x</div>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="text-sm text-gray-500">Dividend Yield</div>
        <div className="text-xl font-semibold">{formatNumber(note.dividend_yield || 0, 2)}%</div>
      </div>
    </div>
  )
}
