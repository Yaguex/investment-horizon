import { formatNumber } from "./utils/formatters"

interface PositionIndicatorProps {
  position: number
  contracts: number
  strike: number
  fee: number
  type: "entry" | "protection" | "target"
}

export function PositionIndicator({ position, contracts, strike, fee, type }: PositionIndicatorProps) {
  const sign = type === "entry" ? "+" : "-"
  const feeColor = type === "entry" ? "text-red-500" : "text-green-500"
  
  return (
    <div 
      className="absolute -translate-x-1/2 top-8 flex flex-col items-center"
      style={{ left: `${position}%` }}
    >
      <span className="text-xs text-black">
        <span className="font-bold">{sign}{contracts}{type === "protection" ? "P" : "C"}</span> at ${strike}
      </span>
      <span className={`text-xs ${feeColor}`}>${formatNumber(fee, 0)}</span>
    </div>
  )
}