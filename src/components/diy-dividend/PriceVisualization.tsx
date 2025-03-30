
import { Circle } from "lucide-react"
import { formatNumber } from "@/components/trade/utils/formatters"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PriceVisualizationProps {
  dividend: any
}

const calculateCirclePositions = (dividend: any) => {
  const middlePosition = 50
  const underlyingPosition = 50 // Underlying price will be at 50% position
  let leftPosition, rightPosition, be1Position, be2Position, callPosition, putPosition

  // Determine which strike is farther from underlying price
  const callDiff = Math.abs(dividend.strike_call - dividend.underlying_price)
  const putDiff = dividend.strike_put ? Math.abs(dividend.strike_put - dividend.underlying_price) : 0
  
  // Calculate positions based on which is farther
  if (putDiff > callDiff && dividend.strike_put) {
    // Put is farther from underlying
    if (dividend.strike_put < dividend.underlying_price) {
      // Put is to the left
      putPosition = 10
      callPosition = 50 - ((callDiff * 40) / putDiff)
    } else {
      // Put is to the right
      putPosition = 90
      callPosition = 50 + ((callDiff * 40) / putDiff)
    }
  } else {
    // Call is farther from underlying (or no put)
    if (dividend.strike_call < dividend.underlying_price) {
      // Call is to the left
      callPosition = 10
      putPosition = dividend.strike_put ? 50 - ((putDiff * 40) / callDiff) : null
    } else {
      // Call is to the right
      callPosition = 90
      putPosition = dividend.strike_put ? 50 + ((putDiff * 40) / callDiff) : null
    }
  }

  const putDiffForRectangle = dividend.strike_put ? dividend.strike_put - dividend.strike_call : 0

  if (putDiffForRectangle >= dividend.strike_put) {
    rightPosition = 90
    leftPosition = 50 - ((dividend.strike_put * 40) / putDiffForRectangle)
  } else {
    leftPosition = 10
    rightPosition = 50 + ((putDiffForRectangle * 40) / dividend.strike_put)
  }

  // Calculate days until expiration
  const today = new Date()
  const expirationDate = dividend.expiration ? new Date(dividend.expiration) : today
  const daysUntilExpiration = (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  const yearsUntilExpiration = daysUntilExpiration / 365

  // Calculate BE strikes with updated formulas
  const be1Strike = dividend.strike_call + (dividend.strike_call * ((dividend.bond_yield/100) * yearsUntilExpiration))
  const be2Strike = dividend.strike_call + (dividend.strike_call * ((7/100) * yearsUntilExpiration))

  // Calculate BE positions
  if (putDiffForRectangle >= dividend.strike_put) {
    be1Position = Math.min(100, 50 + ((be1Strike - dividend.strike_call) * 40 / putDiffForRectangle))
    be2Position = Math.min(100, 50 + ((be2Strike - dividend.strike_call) * 40 / putDiffForRectangle))
  } else {
    be1Position = Math.min(100, 50 + ((be1Strike - dividend.strike_call) * 40 / dividend.strike_put))
    be2Position = Math.min(100, 50 + ((be2Strike - dividend.strike_call) * 40 / dividend.strike_put))
  }

  return { 
    leftPosition, 
    middlePosition, 
    rightPosition, 
    underlyingPosition, 
    callPosition,
    putPosition,
    be1Position, 
    be2Position, 
    be1Strike, 
    be2Strike 
  }
}

export function PriceVisualization({ dividend }: PriceVisualizationProps) {
  // Add error handling for dividend data
  if (!dividend || !dividend.strike_call) {
    console.warn("Invalid dividend data received:", dividend)
    return <div className="text-red-500">Invalid dividend data</div>
  }

  const { 
    leftPosition, 
    middlePosition, 
    rightPosition, 
    underlyingPosition, 
    callPosition,
    putPosition,
    be1Position, 
    be2Position, 
    be1Strike, 
    be2Strike 
  } = calculateCirclePositions(dividend)
  
  // Calculate days until expiration for bond yield
  const today = new Date()
  const expirationDate = dividend.expiration ? new Date(dividend.expiration) : today
  const daysUntilExpiration = (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  const yearsUntilExpiration = daysUntilExpiration / 365


  // Calculate the shares of underlying, call contracts and put contracts based on whether we are willing to sell puts
  let underlyingShares, callContracts, putContracts, positionSize, totalBondYield, totalDividend;
  if (dividend.strike_put === null) {
    // If strike_put is NULL, we can buy into the position in full amount right away
    underlyingShares =  Math.round(dividend.nominal / dividend.underlying_price)
    callContracts = Math.round(underlyingShares/100)
    putContracts = 0
    positionSize = "full"
    totalBondYield = 0
    totalDividend = underlyingShares * dividend.underlying_price * (dividend.dividend_yield / 100) * yearsUntilExpiration
  } else {
    // If strike_put is not NULL, we can only buy into the position in half, since the other half would be assigned if the short put triggers.
    underlyingShares =  Math.round((dividend.nominal/2) / dividend.underlying_price)
    callContracts = Math.round(underlyingShares/100)
    putContracts = Math.round(((dividend.nominal/2) / dividend.strike_put)/100)
    positionSize = "half"
    totalBondYield = (dividend.nominal/2) * (dividend.bond_yield / 100) * yearsUntilExpiration
    totalDividend = underlyingShares * dividend.underlying_price * (dividend.dividend_yield / 100) * yearsUntilExpiration
  }

  // Calculate option premium collected
  const callFee = callContracts * dividend.strike_call_mid * 100
  const putFee = putContracts * dividend.strike_put_mid * 100
  const totalFee = callFee + putFee
  
  return (
    <TooltipProvider delayDuration={100}>
      <div className="mt-12 mb-20 relative">
        {/* Underlying Price Circle (center) */}
        {dividend.underlying_price !== 0 && (
          <div 
            className="absolute -translate-x-1/2 -top-6 flex flex-col items-center z-10"
            style={{ left: `${underlyingPosition}%` }}
          >
            <Tooltip>
              <TooltipTrigger>
                <span className="text-sm text-black mb-1">${formatNumber(dividend.underlying_price, 2)}</span>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white">
                Underlying price: ${formatNumber(dividend.underlying_price, 2)}
              </TooltipContent>
            </Tooltip>
            <Circle className="h-4 w-4 fill-black text-black" />
          </div>
        )}

        {/* Strike Call Circle */}
        {dividend.strike_call !== 0 && callPosition && (
          <div 
            className="absolute -translate-x-1/2 -top-6 flex flex-col items-center z-10"
            style={{ left: `${callPosition}%` }}
          >
            <Tooltip>
              <TooltipTrigger>
                <span className="text-sm text-black mb-1">${formatNumber(dividend.strike_call, 0)}</span>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white">
                Call at ${formatNumber(dividend.strike_call, 0)} and Put at ${formatNumber(dividend.strike_put, 0)}
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
        {dividend.underlying_price !== 0 && (
          <div 
            className="absolute -translate-x-1/2 top-8 flex flex-col items-center"
            style={{ left: `${underlyingPosition}%` }}
          >
            <span className="text-xs text-black">Long <span className="font-bold"></span>{formatNumber(underlyingShares, 0)}</span> shares</span>
          </div>
        )}

        {dividend.strike_call !== 0 && callPosition && (
          <div 
            className="absolute -translate-x-1/2 top-8 flex flex-col items-center"
            style={{ left: `${callPosition}%` }}
          >
            <span className="text-xs text-black"><span className="font-bold">-{callContracts}C</span> at ${formatNumber(dividend.strike_call_mid, 2)}</span>
            <span className="text-xs text-black"><span className="font-bold">-{putContracts}P</span> at ${formatNumber(dividend.strike_put_mid, 2)}</span>
            <span className="text-xs text-green-500">${formatNumber(totalFee, 0)}</span>
          </div>
        )}
        
        {dividend.strike_put !== 0 && putPosition && (
          <div 
            className="absolute -translate-x-1/2 top-8 flex flex-col items-center"
            style={{ left: `${putPosition}%` }}
          >
            <span className="text-xs text-black"><span className="font-bold">-{putContracts}P</span> at ${formatNumber(dividend.strike_put_mid, 2)}</span>
            <span className="text-xs text-green-500">${formatNumber(putFee, 0)}</span>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
