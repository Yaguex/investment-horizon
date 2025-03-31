import { Circle } from "lucide-react"
import { formatNumber } from "@/components/trade/utils/formatters"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PriceVisualizationProps {
  dividend: any
}

const calculateCirclePositions = (dividend: any) => {
  const underlyingPosition = 50 // Underlying price will be at 50% position
  let callPosition
  
  // Determine which strike is farther from underlying price
  const callDiff = Math.abs(dividend.strike_call - dividend.underlying_price)
  
  // Calculate positions based on which is farther
  if (dividend.strike_call < dividend.underlying_price) {
    // Call is to the left
    callPosition = 10
  } else {
    // Call is to the right
    callPosition = 90
  }

  // Calculate days until expiration
  const today = new Date()
  const expirationDate = dividend.expiration ? new Date(dividend.expiration) : today
  const daysUntilExpiration = (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  const yearsUntilExpiration = daysUntilExpiration / 365

  return { 
    underlyingPosition, 
    callPosition
  }
}

export function PriceVisualization({ dividend }: PriceVisualizationProps) {
  // Add error handling for dividend data
  if (!dividend || !dividend.strike_call) {
    console.warn("Invalid dividend data received:", dividend)
    return <div className="text-red-500">Invalid dividend data</div>
  }

  // Move the putDiffForRectangle calculation outside of the functions so it's accessible everywhere
  const putDiffForRectangle = dividend.strike_put ? dividend.strike_put - dividend.strike_call : 0
  
  const { 
    underlyingPosition, 
    callPosition
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

  // Calculate Total Income
  const totalIncome = totalBondYield + totalFee + totalDividend

  // Calculate BE1 and BE2
  const be1Strike = dividend.underlying_price * (1 + (dividend.bond_yield/100))
  const be2Strike = dividend.underlying_price * (1 + (7/100))

  // Improved positioning logic
  // Find the minimum and maximum strike prices to establish our range
  const allStrikes = [dividend.underlying_price, dividend.strike_call, be0Strike, be1Strike, be2Strike];
  const lowestStrike = Math.min(...allStrikes);
  const highestStrike = Math.max(...allStrikes);
  
  // Fixed positions for the visualization
  const leftEdge = 10; // Leftmost position (10%)
  const rightEdge = 90; // Rightmost position (90%)
  const fullWidth = rightEdge - leftEdge; // Total width of the visualization space
  
  // Always place underlying at 50%
  const underlyingPos = 50;
  
  // Helper function to calculate relative positions based on strike price
  const calculatePosition = (strike: number) => {
    // Calculate the position as a percentage within the full range
    return leftEdge + ((strike - lowestStrike) / (highestStrike - lowestStrike)) * fullWidth;
  };
  
  // Calculate positions for each point
  const callPos = calculatePosition(dividend.strike_call);
  const bePos = calculatePosition(be0Strike);
  const be1Pos = calculatePosition(be1Strike);
  const be2Pos = calculatePosition(be2Strike);
  
  return (
    <TooltipProvider delayDuration={100}>
      <div className="mt-12 mb-20 relative">
        {/* Underlying Price Circle (always at 50%) */}
        {dividend.underlying_price !== 0 && (
          <div 
            className="absolute -translate-x-1/2 -top-6 flex flex-col items-center z-10"
            style={{ left: `${underlyingPos}%` }}
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
        {dividend.strike_call !== 0 && callPos && (
          <div 
            className="absolute -translate-x-1/2 -top-6 flex flex-col items-center z-10"
            style={{ left: `${callPos}%` }}
          >
            <Tooltip>
              <TooltipTrigger>
                <span className="text-sm text-black mb-1">${formatNumber(dividend.strike_call, 0)}</span>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white">
                {dividend.strike_put ? 'Call/Put strike' : 'Call strike'}: ${formatNumber(dividend.strike_call, 0)}
              </TooltipContent>
            </Tooltip>
            <Circle className="h-4 w-4 fill-black text-black" />
          </div>
        )}

        {/* BE0 Circle */}
        {dividend.strike_call !== 0 && (
          <div 
            className="absolute -translate-x-1/2 -top-6 flex flex-col items-center z-10"
            style={{ left: `${bePos}%` }}
          >
            <Tooltip>
              <TooltipTrigger>
                <span className="text-sm text-gray-300 mb-1">${Math.round(be0Strike)}</span>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white">
                BE0 (nominal): ${formatNumber(be0Strike, 2)}
              </TooltipContent>
            </Tooltip>
            <Circle className="h-4 w-4" style={{ fill: 'rgba(0,0,0,0.2)', color: 'rgba(0,0,0,0.2)' }} />
          </div>
        )}
        
        {/* BE1 Circle */}
        <div 
          className="absolute -translate-x-1/2 -top-6 flex flex-col items-center z-10"
          style={{ left: `${be1Pos}%` }}
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
        
        {/* BE2 Circle */}
        <div 
          className="absolute -translate-x-1/2 -top-6 flex flex-col items-center z-10"
          style={{ left: `${be2Pos}%` }}
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
        
        {/* Price rectangles */}
        <div className="w-full bg-gray-100 rounded-lg h-4 relative overflow-hidden">
          {/* Red rectangle - only show if strike_put exists */}
          {dividend.strike_put !== 0 && (
            <div 
              className="absolute left-0 top-0 bottom-0 bg-red-500"
              style={{ width: `${callPos}%` }}
            />
          )}
          {/* Green rectangle */}
          <div 
            className="absolute top-0 bottom-0 bg-green-500"
            style={{ 
              left: `${bePos}%`,
              width: `${callPos - bePos}%`
            }}
          />
        </div>
        
        {/* Position indicators aligned with circles */}
        {dividend.underlying_price !== 0 && (
          <div 
            className="absolute -translate-x-1/2 top-8 flex flex-col items-center"
            style={{ left: `${underlyingPos}%` }}
          >
            <span className="text-xs text-black">Long <span className="font-bold">{formatNumber(underlyingShares, 0)}</span> shares</span>
          </div>
        )}

        {/* Call and Put information (consolidated) */}
        {dividend.strike_call !== 0 && callPos && (
          <div 
            className="absolute -translate-x-1/2 top-8 flex flex-col items-center"
            style={{ left: `${callPos}%` }}
          >
            <span className="text-xs text-black"><span className="font-bold">-{callContracts}C</span> at ${formatNumber(dividend.strike_call_mid || 0, 2)}</span>
            {dividend.strike_put !== 0 && (
              <span className="text-xs text-black"><span className="font-bold">-{putContracts}P</span> at ${formatNumber(dividend.strike_put_mid || 0, 2)}</span>
            )}
            <span className="text-xs text-green-500">${formatNumber(totalFee, 0)}</span>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
