import { formatNumber } from "./utils/formatters"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

interface NoteMetricsProps {
  note: any
}

export function NoteMetrics({ note }: NoteMetricsProps) {
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

  const exposureAmount = latestBalance ? (note.exposure * latestBalance) / 100 : 0
  const contracts = Math.round((latestBalance * (note.exposure/100)) / (note.strike_entry) / 100)

  const calculateROI = () => {
    const today = new Date()
    const expirationDate = new Date(note.expiration)
    const daysToExpiration = Math.max(1, Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
    
    const totalPremium = calculatePremium()
    const totalCommission = calculateCommission()
    const exposureValue = note.underlying_price_entry * contracts

    if (!exposureValue || !daysToExpiration) return 0

    const annualROI = ((totalPremium + totalCommission) / exposureValue) * (365 / daysToExpiration)

    const action = note.action?.toLowerCase() || ''
    const isSellAction = action.includes('sell')
    
    // Round to 1 decimal
    const roundedROI = Math.round(annualROI * 10) / 10

    // Return positive for sell actions, negative for buy actions
    return isSellAction ? Math.abs(roundedROI) : -Math.abs(roundedROI)
  }

  const getROIColor = (value: number) => {
    if (value > 10) return "text-green-600"
    if (value > 6 && value <= 10) return "text-orange-500"
    if (value > 0 && value <= 6) return "text-red-600"
    if (value > -6 && value <= 0) return "text-green-600"
    if (value > -10 && value <= -6) return "text-orange-500"
    if (value <= -10) return "text-red-600"
    return "text-black"
  }

  const getDeltaColor = (value: number) => {
    if (value > 0.6) return "text-green-600"
    if (value > 0.3 && value <= 0.6) return "text-orange-500"
    if (value > 0 && value <= 0.3) return "text-red-600"
    if (value > -0.3 && value <= 0) return "text-green-600"
    if (value > -0.6 && value <= -0.3) return "text-orange-500"
    if (value <= -0.6) return "text-red-600"
    return "text-black"
  }

  const calculateCommission = () => {
    const isSpread = note.action?.toLowerCase().includes('spread')
    const baseCommission = (contracts * 1.25) + 100
    const commission = isSpread ? baseCommission * 2 : baseCommission
    return -Math.abs(Math.round(commission))
  }

  const calculatePremium = () => {
    const action = note.action?.toLowerCase() || ''
    const premium = (note.premium_entry - note.premium_exit) * contracts * 100
    const roundedPremium = Math.round(premium)
    
    if (action.includes('sell')) {
      return Math.abs(roundedPremium)
    } else if (action.includes('buy')) {
      return -Math.abs(roundedPremium)
    }
    return roundedPremium
  }

  const roi = calculateROI()
  const normalizedDelta = note.delta_entry ? Math.round((roi / note.delta_entry / 100) * 100) / 100 : 0

  return (
    <TooltipProvider delayDuration={100}>
      <div className="text-sm space-y-2 flex justify-between">
        <div>
          <p className="text-black">
            <Tooltip>
              <TooltipTrigger>
                Exposure: {note.exposure}% (${formatNumber(exposureAmount, 0)})
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                Percentage of portfolio at risk
              </TooltipContent>
            </Tooltip>
          </p>
          <p className={calculatePremium() > 0 ? "text-green-600" : "text-red-600"}>
            <Tooltip>
              <TooltipTrigger>
                Premium: ${formatNumber(calculatePremium(), 0)}
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                Total net premium paid
              </TooltipContent>
            </Tooltip>
          </p>
          <p className="text-red-600">
            <Tooltip>
              <TooltipTrigger>
                Commission: ${formatNumber(calculateCommission(), 0)}
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                Total commission cost
              </TooltipContent>
            </Tooltip>
          </p>
        </div>
        <div className="flex gap-8 items-start">
          <div className="text-center">
            <Tooltip>
              <TooltipTrigger>
                <p className={`${getROIColor(roi)} text-xl font-bold`}>{formatNumber(roi, 1)}%</p>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                Premium Annual ROI
              </TooltipContent>
            </Tooltip>
            <p className="text-xs text-black">Premium<br />Annual ROI</p>
          </div>
          <div className="text-center">
            <Tooltip>
              <TooltipTrigger>
                <p className={`${getDeltaColor(normalizedDelta)} text-xl font-bold`}>{normalizedDelta}</p>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                Delta normalized for position size
              </TooltipContent>
            </Tooltip>
            <p className="text-xs text-black">Delta<br />Normalized</p>
          </div>
          <div className="text-center">
            <Tooltip>
              <TooltipTrigger>
                <p className="text-black text-xl font-bold">{contracts}</p>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                Number of contracts in the position
              </TooltipContent>
            </Tooltip>
            <p className="text-xs text-black">Contracts</p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}