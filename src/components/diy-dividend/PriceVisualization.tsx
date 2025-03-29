import { Circle } from "lucide-react"
import { formatNumber } from "@/components/trade/utils/formatters"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PriceVisualizationProps {
  dividend: any
}

const calculateCirclePositions = (dividend: any) => {
  const middlePosition = 50
  let leftPosition, rightPosition, be1Position, be2Position

  const putDiff = dividend.strike_put - dividend.strike_call

  // Calculate days until expiration
  const today = new Date()
  const expirationDate = dividend.expiration ? new Date(dividend.expiration) : today
  const daysUntilExpiration = (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  const yearsUntilExpiration = daysUntilExpiration / 365

  // Calculate total bond yield
  const totalBondYield = dividend.nominal * (dividend.bond_yield / 100) * yearsUntilExpiration

  // Calculate leverage - this was missing previously
  const leverage = 1.2  // Default leverage value

  // Calculate number of underlying shares based on current underlying price and nominal
  const underlyingShares =  Math.round(dividend.nominal / dividend.underlying_price)

  // Calculate call contracts
  const callContracts = Math.round(100)  // Fixed placeholder

  // Calculate BE strikes with updated formulas
  const be1Strike = dividend.strike_call + ((dividend.strike_call * ((dividend.bond_yield/100) * yearsUntilExpiration)) / leverage)
  const be2Strike = dividend.strike_call + ((dividend.strike_call * ((7/100) * yearsUntilExpiration)) / leverage)

  if (putDiff >= dividend.strike_put) {
    rightPosition = 90
    leftPosition = 50 - ((dividend.strike_put * 40) / putDiff)
    
    // Calculate BE positions relative to call and put
    be1Position = Math.min(100, 50 + ((be1Strike - dividend.strike_call) * 40 / putDiff))
    be2Position = Math.min(100, 50 + ((be2Strike - dividend.strike_call) * 40 / putDiff))
  } else {
    leftPosition = 10
    rightPosition = 50 + ((putDiff * 40) / dividend.strike_put)
    
    // Calculate BE positions relative to call and put
    be1Position = Math.min(100, 50 + ((be1Strike - dividend.strike_call) * 40 / dividend.strike_put))
    be2Position = Math.min(100, 50 + ((be2Strike - dividend.strike_call) * 40 / dividend.strike_put))
  }

  return { leftPosition, middlePosition, rightPosition, be1Position, be2Position, be1Strike, be2Strike }
}

export function PriceVisualization({ dividend }: PriceVisualizationProps) {
  // Add error handling for dividend data
  if (!dividend || !dividend.strike_call) {
    console.warn("Invalid dividend data received:", dividend)
    return <div className="text-red-500">Invalid dividend data</div>
  }

  const { leftPosition, middlePosition, rightPosition, be1Position, be2Position, be1Strike, be2Strike } = calculateCirclePositions(dividend)
  
  // Calculate days until expiration for bond yield
  const today = new Date()
  const expirationDate = dividend.expiration ? new Date(dividend.expiration) : today
  const daysUntilExpiration = (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  const yearsUntilExpiration = daysUntilExpiration / 365

  // Calculate total bond yield
  const totalBondYield = dividend.nominal * (dividend.bond_yield / 100) * yearsUntilExpiration

  // Calculate call contracts 
  const callContracts = Math.round(100)  // Fixed placeholder

  // Calculate put contracts
  const putContracts = callContracts

  // Calculate fees - Add checks to avoid NaN values
  const callFee = dividend.strike_call_mid ? callContracts * dividend.strike_call_mid * 100 * -1 : 0
  const putFee = dividend.strike_put_mid ? putContracts * dividend.strike_put_mid * 100 : 0
  
  return (
    <TooltipProvider delayDuration={100}>
      <div className="mt-12 mb-20 relative">
        {/* Strike Call Circle (Middle) */}
        {dividend.strike_call !== 0 && (
          <div 
            className="absolute -translate-x-1/2 -top-6 flex flex-col items-center z-10"
            style={{ left: `${middlePosition}%` }}
          >
            <Tooltip>
              <TooltipTrigger>
                <span className="text-sm text-black mb-1">${dividend.strike_call}</span>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white">
                Call strike: ${formatNumber(dividend.strike_call, 2)}
              </TooltipContent>
            </Tooltip>
            <Circle className="h-4 w-4 fill-black text-black" />
          </div>
        )}
        
        {/* Strike Put Circle (Right) */}
        {dividend.strike_put !== 0 && (
          <div 
            className="absolute -translate-x-1/2 -top-6 flex flex-col items-center z-10"
            style={{ left: `${rightPosition}%` }}
          >
            <Tooltip>
              <TooltipTrigger>
                <span className="text-sm text-black mb-1">${dividend.strike_put}</span>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white">
                Put strike: ${formatNumber(dividend.strike_put, 2)}
              </TooltipContent>
            </Tooltip>
            <Circle className="h-4 w-4 fill-black text-black" />
          </div>
        )}

        {/* BE1 Circle */}
        {dividend.strike_call !== 0 && (
          <div 
            className="absolute -translate-x-1/2 -top-6 flex flex-col items-center z-10"
            style={{ left: `${be1Position}%` }}
          >
            <Tooltip>
              <TooltipTrigger>
                <span className="text-sm text-gray-300 mb-1">${Math.round(be1Strike)}</span>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white">
                BE1 (risk free rate): ${formatNumber(be1Strike, 2)}
              </TooltipContent>
            </Tooltip>
            <Circle className="h-4 w-4" style={{ fill: 'rgba(0,0,0,0.2)', color: 'rgba(0,0,0,0.2)' }} />
          </div>
        )}

        {/* BE2 Circle */}
        {dividend.strike_call !== 0 && (
          <div 
            className="absolute -translate-x-1/2 -top-6 flex flex-col items-center z-10"
            style={{ left: `${be2Position}%` }}
          >
            <Tooltip>
              <TooltipTrigger>
                <span className="text-sm text-gray-300 mb-1">${Math.round(be2Strike)}</span>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white">
                BE2 (7%): ${formatNumber(be2Strike, 2)}
              </TooltipContent>
            </Tooltip>
            <Circle className="h-4 w-4" style={{ fill: 'rgba(0,0,0,0.2)', color: 'rgba(0,0,0,0.2)' }} />
          </div>
        )}
        
        {/* Price rectangles */}
        <div className="w-full bg-gray-100 rounded-lg h-4 relative overflow-hidden">
          {/* Red rectangle - only show if strike_put exists */}
          {dividend.strike_put !== 0 && (
            <div 
              className="absolute left-0 top-0 bottom-0 bg-red-500"
              style={{ width: `${leftPosition}%` }}
            />
          )}
          {/* Green rectangle */}
          <div 
            className="absolute top-0 bottom-0 bg-green-500"
            style={{ 
              left: `${middlePosition}%`,
              width: `${rightPosition - middlePosition}%`
            }}
          />
        </div>
        
        {/* Position indicators aligned with circles */}
        {dividend.strike_call !== 0 && (
          <div 
            className="absolute -translate-x-1/2 top-8 flex flex-col items-center"
            style={{ left: `${middlePosition}%` }}
          >
            <span className="text-xs text-black"><span className="font-bold">+{callContracts}C</span> at ${dividend.strike_call_mid || 0}</span>
            <span className="text-xs text-red-500">${formatNumber(callFee, 0)}</span>
          </div>
        )}
        {dividend.strike_put !== 0 && (
          <div 
            className="absolute -translate-x-1/2 top-8 flex flex-col items-center"
            style={{ left: `${leftPosition}%` }}
          >
            <span className="text-xs text-black"><span className="font-bold">-{putContracts}P</span> at ${dividend.strike_put_mid || 0}</span>
            <span className="text-xs text-green-500">${formatNumber(putFee, 0)}</span>
          </div>
        )}
        {dividend.strike_put !== 0 && (
          <div 
            className="absolute -translate-x-1/2 top-8 flex flex-col items-center"
            style={{ left: `${rightPosition}%` }}
          >
            <span className="text-xs text-black"><span className="font-bold">-{putContracts}C</span> at ${dividend.strike_put_mid || 0}</span>
            <span className="text-xs text-green-500">${formatNumber(putFee, 0)}</span>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
