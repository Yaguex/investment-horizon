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

  // Calculate Net Profit if price remains above strike_call: how much income we've receive minus how much I will lose in the short call
  const netProfit = totalIncome - (underlyingShares * (dividend.underlying_price - dividend.strike_call))

  // Calculate BE0 at maturity
  const be0Strike = (((underlyingShares * dividend.underlying_price) + (putContracts * dividend.strike_put * 100)) - netProfit ) / (underlyingShares + (putContracts * 100))

  
  // Calculate BE1 and BE2 strikes based on the provided formulas
  const be1Strike = dividend.underlying_price * (1 + (dividend.bond_yield/100))
  const be2Strike = dividend.underlying_price * (1 + (7/100))

  // POSITIONING LOGIC for the strikes in the price bar UI
  
  // Find all strikes we need to position...
  const strikes = [
    dividend.underlying_price, 
    dividend.strike_call,
    be0Strike,
    be1Strike,
    be2Strike
  ];
  
  // Find the lowest and highest strikes
  const lowestStrike = Math.min(...strikes);
  const highestStrike = Math.max(...strikes);
  
  // Fix the position of the lowest strike always at 10% and the underlying always at 50%
  const lowestPos = 10;
  const underlyingPos = 50;
  
  // Calculate the positions for all circles using a single unified rule
  const getRelativePosition = (strike: number) => {
    // Fixed positions for lowest strike to 10% and the underlying price to 50
    if (strike === lowestStrike) return lowestPos;
    if (strike === dividend.underlying_price) return underlyingPos;
    
    // For all other strikes, use a linear scale that maps:
    const scale = (underlyingPos - lowestPos) / (dividend.underlying_price - lowestStrike);
    return underlyingPos + ((strike - dividend.underlying_price) * scale);
  };
  
  // Get all positions
  const callPos = getRelativePosition(dividend.strike_call);
  const be0Pos = getRelativePosition(be0Strike);
  const be1Pos = getRelativePosition(be1Strike);
  const be2Pos = getRelativePosition(be2Strike);
  
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
        {dividend.strike_call !== 0 && (
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
            style={{ left: `${be0Pos}%` }}
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
        
        {/* BE1 Circle - Risk-free rate */}
        {dividend.underlying_price !== 0 && (
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
        )}
        
        {/* BE2 Circle - 7% */}
        {dividend.underlying_price !== 0 && (
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
        )}
        
        {/* Price rectangles with updated gradient coloring */}
        <div className="w-full bg-gray-100 rounded-lg h-4 relative overflow-hidden">
          
          {/* Left segment with red to gray gradient - everything left of BE0 */}
          <div 
            className="absolute left-0 top-0 bottom-0"
            style={{ 
              width: `${be0Pos}%`,
              background: `linear-gradient(to right, #ef4444, #f3f4f6 40px)`
            }}
          />
          
          {/* Middle segment with gray to green gradient - between BE0 and Underlying Price */}
          <div 
            className="absolute top-0 bottom-0"
            style={{ 
              left: `${be0Pos}%`,
              width: `${underlyingPos - be0Pos}%`,
              background: `linear-gradient(to right, #f3f4f6, #22c55e 40px)`
            }}
          />
          
          {/* Right segment always green - everything right of Underlying Price */}
          <div 
            className="absolute top-0 bottom-0 bg-green-500"
            style={{ 
              left: `${underlyingPos}%`,
              width: `${100 - underlyingPos}%`
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
        {dividend.strike_call !== 0 && (
          <div 
            className="absolute -translate-x-1/2 top-8 flex flex-col items-center"
            style={{ left: `${callPos}%` }}
          >
            <span className="text-xs text-black"><span className="font-bold">-{callContracts}C</span> at ${formatNumber(dividend.strike_call_mid || 0, 2)}</span>
            {dividend.strike_put !== 0 && (
              <span className="text-xs text-black"><span className="font-bold">-{putContracts}P</span> at ${formatNumber(dividend.strike_put_mid || 0, 2)}</span>
            )}
            {/* <span className="text-xs text-green-500">${formatNumber(totalFee, 0)}</span> */}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
