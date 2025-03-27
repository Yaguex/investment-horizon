import { Circle } from "lucide-react"
import { formatNumber } from "./utils/formatters"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PriceVisualizationProps {
  dividend: any
}

const calculateCirclePositions = (dividend: any) => {
  const middlePosition = 50
  let leftPosition, rightPosition, be1Position, be2Position

  const targetDiff = dividend.strike_target - dividend.strike_entry
  const protectionDiff = dividend.strike_entry - dividend.strike_protection

  // Calculate days until expiration
  const today = new Date()
  const expirationDate = dividend.expiration ? new Date(dividend.expiration) : today
  const daysUntilExpiration = (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  const yearsUntilExpiration = daysUntilExpiration / 365

  // Calculate total bond yield
  const totalBondYield = dividend.nominal * (dividend.bond_yield / 100) * yearsUntilExpiration

  // Calculate protection contracts
  const protectionContracts = Math.round(dividend.nominal / dividend.strike_protection / 100)

  // Calculate entry contracts
  const entryContracts = Math.round(
    ((totalBondYield * -1) - (protectionContracts * dividend.strike_protection_mid * 100)) / 
    ((dividend.strike_target_mid * 100) - (dividend.strike_entry_mid * 100))
  )

  // Calculate leverage
  const leverage = entryContracts / ((1000000 + (dividend.nominal * (dividend.dividend_yield/100) * yearsUntilExpiration) - (totalBondYield + (protectionContracts * dividend.strike_protection_mid * 100) + (entryContracts * dividend.strike_entry_mid * 100 * -1) + (entryContracts * dividend.strike_target_mid * 100))) / dividend.strike_entry / 100)

  // Calculate BE strikes with updated formulas
  const be1Strike = dividend.strike_entry + ((dividend.strike_entry * ((dividend.bond_yield/100) * yearsUntilExpiration)) / leverage)
  const be2Strike = dividend.strike_entry + ((dividend.strike_entry * ((7/100) * yearsUntilExpiration)) / leverage)

  if (targetDiff >= protectionDiff) {
    rightPosition = 90
    leftPosition = 50 - ((protectionDiff * 40) / targetDiff)
    
    // Calculate BE positions relative to entry and target
    be1Position = Math.min(100, 50 + ((be1Strike - dividend.strike_entry) * 40 / targetDiff))
    be2Position = Math.min(100, 50 + ((be2Strike - dividend.strike_entry) * 40 / targetDiff))
  } else {
    leftPosition = 10
    rightPosition = 50 + ((targetDiff * 40) / protectionDiff)
    
    // Calculate BE positions relative to entry and target
    be1Position = Math.min(100, 50 + ((be1Strike - dividend.strike_entry) * 40 / protectionDiff))
    be2Position = Math.min(100, 50 + ((be2Strike - dividend.strike_entry) * 40 / protectionDiff))
  }

  return { leftPosition, middlePosition, rightPosition, be1Position, be2Position, be1Strike, be2Strike }
}

export function PriceVisualization({ dividend }: PriceVisualizationProps) {
  const { leftPosition, middlePosition, rightPosition, be1Position, be2Position, be1Strike, be2Strike } = calculateCirclePositions(dividend)
  
  // Calculate the number of contracts for protection
  const protectionContracts = Math.round(dividend.nominal / dividend.strike_protection / 100)
  
  // Calculate days until expiration for bond yield
  const today = new Date()
  const expirationDate = dividend.expiration ? new Date(dividend.expiration) : today
  const daysUntilExpiration = (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  const yearsUntilExpiration = daysUntilExpiration / 365

  // Calculate total bond yield
  const totalBondYield = dividend.nominal * (dividend.bond_yield / 100) * yearsUntilExpiration

  // Calculate entry contracts
  const entryContracts = Math.round(
    ((totalBondYield * -1) - (protectionContracts * dividend.strike_protection_mid * 100)) / 
    ((dividend.strike_target_mid * 100) - (dividend.strike_entry_mid * 100))
  )

  // Calculate target contracts
  const targetContracts = entryContracts

  // Calculate fees
  const protectionFee = protectionContracts * dividend.strike_protection_mid * 100
  const entryFee = entryContracts * dividend.strike_entry_mid * 100 * -1
  const targetFee = targetContracts * dividend.strike_target_mid * 100
  
  return (
    <TooltipProvider delayDuration={100}>
      <div className="mt-12 mb-20 relative">
        {/* Strike Entry Circle (Middle) */}
        {dividend.strike_entry !== 0 && (
          <div 
            className="absolute -translate-x-1/2 -top-6 flex flex-col items-center z-10"
            style={{ left: `${middlePosition}%` }}
          >
            <Tooltip>
              <TooltipTrigger>
                <span className="text-sm text-black mb-1">${dividend.strike_entry}</span>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white">
                Entry strike: ${formatNumber(dividend.strike_entry, 2)}
              </TooltipContent>
            </Tooltip>
            <Circle className="h-4 w-4 fill-black text-black" />
          </div>
        )}
        
        {/* Strike Target Circle (Right) */}
        {dividend.strike_target !== 0 && (
          <div 
            className="absolute -translate-x-1/2 -top-6 flex flex-col items-center z-10"
            style={{ left: `${rightPosition}%` }}
          >
            <Tooltip>
              <TooltipTrigger>
                <span className="text-sm text-black mb-1">${dividend.strike_target}</span>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white">
                Target strike: ${formatNumber(dividend.strike_target, 2)}
              </TooltipContent>
            </Tooltip>
            <Circle className="h-4 w-4 fill-black text-black" />
          </div>
        )}
        
        {/* Strike Protection Circle (Left) */}
        {dividend.strike_protection !== 0 && (
          <div 
            className="absolute -translate-x-1/2 -top-6 flex flex-col items-center z-10"
            style={{ left: `${leftPosition}%` }}
          >
            <Tooltip>
              <TooltipTrigger>
                <span className="text-sm text-black mb-1">${dividend.strike_protection}</span>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white">
                Protection strike: ${formatNumber(dividend.strike_protection, 2)}
              </TooltipContent>
            </Tooltip>
            <Circle className="h-4 w-4 fill-black text-black" />
          </div>
        )}

        {/* BE1 Circle */}
        {dividend.strike_entry !== 0 && (
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
        {dividend.strike_entry !== 0 && (
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
          {/* Red rectangle - only show if strike_protection exists */}
          {dividend.strike_protection !== 0 && (
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
        {dividend.strike_entry !== 0 && (
          <div 
            className="absolute -translate-x-1/2 top-8 flex flex-col items-center"
            style={{ left: `${middlePosition}%` }}
          >
            <span className="text-xs text-black"><span className="font-bold">+{entryContracts}C</span> at ${dividend.strike_entry_mid}</span>
            <span className="text-xs text-red-500">${formatNumber(entryFee, 0)}</span>
          </div>
        )}
        {dividend.strike_protection !== 0 && (
          <div 
            className="absolute -translate-x-1/2 top-8 flex flex-col items-center"
            style={{ left: `${leftPosition}%` }}
          >
            <span className="text-xs text-black"><span className="font-bold">-{protectionContracts}P</span> at ${dividend.strike_protection_mid}</span>
            <span className="text-xs text-green-500">${formatNumber(protectionFee, 0)}</span>
          </div>
        )}
        {dividend.strike_target !== 0 && (
          <div 
            className="absolute -translate-x-1/2 top-8 flex flex-col items-center"
            style={{ left: `${rightPosition}%` }}
          >
            <span className="text-xs text-black"><span className="font-bold">-{targetContracts}C</span> at ${dividend.strike_target_mid}</span>
            <span className="text-xs text-green-500">${formatNumber(targetFee, 0)}</span>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}