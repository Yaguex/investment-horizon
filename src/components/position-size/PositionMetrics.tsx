
import { formatDate } from "./utils/formatters"
import { formatNumber } from "./utils/formatters"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

interface positionMetricsProps {
  position: any
}

export function PositionMetrics({ position }: positionMetricsProps) {
  const today = new Date()
  const expirationDate = new Date(position.expiration)
  const daysUntilExpiration = Math.max(1, Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))

  const contracts = Math.round(position.nominal / position.strike_entry / 100)
  
  // Calculate premiums from options.
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
  const totalPremium = calculatePremium()

  // Calculate ROI
  let maxAnnualROI;
  maxAnnualROI = ((totalPremium / position.nominal) * 100 * (365 / daysUntilExpiration))
  // And express it positive for sell actions, negative for buy actions
  const actionLowerCase = position.action?.toLowerCase() || ''
  if (actionLowerCase.includes('sell')) {
    maxAnnualROI = Math.abs(maxAnnualROI)
  } else if (actionLowerCase.includes('buy')) {
    maxAnnualROI = -Math.abs(maxAnnualROI)
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

  const calculateROI = () => {
    const actionLowerCase = position.action?.toLowerCase() || ''
    let roi = ((totalPremium / position.nominal) * 100 * (365 / daysUntilExpiration))
    
    if (actionLowerCase.includes('sell')) {
      return Math.abs(roi)
    } else if (actionLowerCase.includes('buy')) {
      return -Math.abs(roi)
    }
    return roi
  }

  const roi = calculateROI()
  const normalizedDelta = Math.abs(position.delta_entry ? Math.round((roi / position.delta_entry / 100) * 100) / 100 : 0)

  return (
    <TooltipProvider delayDuration={100}>
      <div className="text-sm space-y-2 flex justify-between">
        

        {/* Below goes the small numbers in the bottom left of the display*/}
        <div className="mt-2 relative">
          <p>
            <Tooltip>
              <TooltipTrigger>
                Premium: <span className={calculatePremium() > 0 ? "text-green-600" : "text-red-600"}>${formatNumber(calculatePremium(), 0)}</span>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                Total premium paid or received
              </TooltipContent>
            </Tooltip>
          </p>
          <p>
            <Tooltip>
              <TooltipTrigger>
                IV entry strike: {formatNumber(position.iv_entry, 0)}%
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                The IV of the entry strike for the selected maturity.
              </TooltipContent>
            </Tooltip>
          </p>
        </div>


        {/* Below goes the large numbers in the bottom right of the display*/}
        <div className="flex gap-8 items-start">
          <div className="text-center">
            <Tooltip>
              <TooltipTrigger>
                <p className={`${getROIColor(roi)} text-xl font-bold`}>{formatNumber(roi, 1)}%</p>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white max-w-[400px]">
                Premium Annual ROI of the premium paid or received. This is only based on the premium, not price behaviour.
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
                ROI normalized by Delta. Explanation: When selling options, the Annual ROI must be normalized by Delta because, for example, 10% ROI with a position of Delta 0.5 is not nearly as good as 10% ROI with a position of Delta 0.2. The higher the ROI at a lower Delta, the better. Sometimes, even if ROI might be good, if the Delta is very high it might not be worth taking the risk because there are too high chances of the options ending ITM and thus getting exercised to buy the underlying. Since Delta already has IV baked in, there's no need to include IV again in this calculation. Using Delta is enough since it already accounts for IV.
              </TooltipContent>
            </Tooltip>
            <p className="text-xs text-black">Delta<br />Normalized</p>
          </div>
          
        </div>
      </div>
    </TooltipProvider>
  )
}
