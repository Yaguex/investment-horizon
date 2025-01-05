interface PositionIndicatorProps {
  position: number
  contracts: number
  strike: number
  fee: number
  prefix?: string
}

export function PositionIndicator({ position, contracts, strike, fee, prefix = "+" }: PositionIndicatorProps) {
  return (
    <div 
      className="absolute -translate-x-1/2 top-8 flex flex-col items-center"
      style={{ left: `${position}%` }}
    >
      <span className="text-xs text-black">
        <span className="font-bold">{prefix}{contracts}C</span> at ${strike}
      </span>
      <span className={`text-xs ${fee < 0 ? 'text-red-500' : 'text-green-500'}`}>
        ${fee}
      </span>
    </div>
  )
}