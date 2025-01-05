import { formatNumber } from "./utils/formatters"

interface NoteHeaderMetricsProps {
  note: any
}

export function NoteHeaderMetrics({ note }: NoteHeaderMetricsProps) {
  // Calculate OTM percentages
  const protectionOTM = note.strike_protection && note.strike_entry 
    ? Math.round(((note.strike_protection - note.strike_entry) * -1) / note.strike_entry * 100)
    : 0
  
  const targetOTM = note.strike_target && note.strike_entry
    ? Math.round((note.strike_target - note.strike_entry) / note.strike_entry * 100)
    : 0

  return (
    <div className="flex items-center text-sm">
      <span className="mr-8">${formatNumber(note.nominal, 0)}</span>
      <span className="text-gray-500">
        Protection {protectionOTM}% OTM | Target {targetOTM}% OTM
      </span>
    </div>
  )
}