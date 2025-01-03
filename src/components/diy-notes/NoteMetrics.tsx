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

  return (
    <div className="text-sm space-y-2 flex justify-between">
      <div>
        <p className="text-black">
          Dividend yield: {note.dividend_yield}% annual (${formatNumber(totalDividend, 0)} total)
        </p>
        <p className="text-black">
          Bond yield: {note.bond_yield}% annual (${formatNumber(totalBondYield, 0)} total)
        </p>
        <p className="text-black">Max gain: 14.42% total ($130,034 total)</p>
        <p className="text-black">Note's net: <span className="text-green-600">$1,022</span></p>
        <p className="text-black">Options premium: <span className="text-red-600">-$22,390</span></p>
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