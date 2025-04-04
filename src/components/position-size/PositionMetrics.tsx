import { formatNumber } from "./utils/formatters"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

interface positionMetricsProps {
  position: any
}

export function positionMetrics({ position }: positionMetricsProps) {

  const contracts = Math.round(position.nominal / position.strike_entry / 100)

  const calculateROI = () => {
    const today = new Date()
    const expirationDate = new Date(position.expiration)
    const daysToExpiration = Math.max(1, Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
    
    const totalPremium = calculatePremium()

    const maxAnnualROI = formatNumber(((totalPremium / dividend.nominal) * 100 * (365 / daysUntilExpiration)), 1)
    const action = position.action?.toLowerCase() || ''
    const isSellAction = action.includes('sell')

    // Return positive for sell actions, negative for buy actions
    return isSellAction ? Math.abs(maxAnnualROI) : -Math.abs(maxAnnualROI)
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

  const calculatePremium = () => {
    const action = position.action?.toLowerCase() || ''
    const premium = (position.premium_entry - position.premium_exit) * contracts * 100
    const roundedPremium = Math.round(premium)
    
    if (action.includes('sell')) {
      return Math.abs(roundedPremium)
    } else if (action.includes('buy')) {
      return -Math.abs(roundedPremium)
    }
    return roundedPremium
  }

  const roi = calculateROI()
  const normalizedDelta = position.delta_entry ? Math.round((roi / position.delta_entry / 100) * 100) / 100 : 0

  return (
    <TooltipProvider delayDuration={100}>
      <div className="text-sm space-y-2 flex justify-between">
        <div>
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