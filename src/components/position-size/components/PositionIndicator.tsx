import { formatNumber } from "../utils/formatters"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

interface PositionIndicatorProps {
  strike: number
  premium: number
  position: number
  isEntry: boolean
  note: any
}

export function PositionIndicator({ strike, premium, position, isEntry, note }: PositionIndicatorProps) {
  const { data: latestBalance } = useQuery({
    queryKey: ['latest-balance'],
    queryFn: async () => {
      const { data } = await supabase
        .from('portfolio_data')
        .select('balance')
        .order('month', { ascending: false })
        .limit(1)
      return data?.[0]?.balance || 0
    }
  })

  const calculateContracts = () => {
    if (!latestBalance || !note.strike_entry) return 0
    return Math.round((latestBalance * (note.exposure/100)) / (note.strike_entry) / 100)
  }

  const calculateOTMPercentage = () => {
    if (!note.underlying_price_entry) return 0
    return Math.abs(Math.round(((strike - note.underlying_price_entry) / note.underlying_price_entry) * 100))
  }

  const contracts = calculateContracts()

  return (
    <div 
      className="absolute -translate-x-1/2 top-8 flex flex-col items-center"
      style={{ left: `${position}%` }}
    >
      <span className="text-xs text-black">
        <span className="font-bold">{isEntry ? `-${contracts}P` : `+${contracts}P`}</span> for ${formatNumber(premium, 2)}
      </span>
      <span className="text-xs text-black">{calculateOTMPercentage()}% OTM</span>
    </div>
  )
}