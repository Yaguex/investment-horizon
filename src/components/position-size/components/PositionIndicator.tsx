import { formatNumber } from "../utils/formatters"

interface PositionIndicatorProps {
  position: number
  contracts: number
  price: number
  isEntry: boolean
  action: string
  fee: number
}

export function PositionIndicator({ position, contracts, price, isEntry, action, fee }: PositionIndicatorProps) {
  const prefix = isEntry ? 
    (action === 'buy_call' ? '+' : '-') : 
    (action === 'buy_call' ? '-' : '+')

  return (
    <div 
      className="absolute -translate-x-1/2 top-8 flex flex-col items-center"
      style={{ left: `${position}%` }}
    >
      <span className="text-xs text-black">
        <span className="font-bold">
          {prefix}{contracts}
          {action?.includes('call') ? 'C' : 'P'}
        </span> 
        at ${price}
      </span>
      <span className={`text-xs ${isEntry ? 'text-red-500' : 'text-green-500'}`}>
        ${formatNumber(fee, 0)}
      </span>
    </div>
  )
}