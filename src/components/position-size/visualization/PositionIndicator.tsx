import { formatNumber } from "../utils/formatters"

interface PositionIndicatorProps {
  contracts: number
  premium: number
  position: number
  type: "entry" | "exit"
}

export function PositionIndicator({ contracts, premium, position, type }: PositionIndicatorProps) {
  return (
    <div 
      className="absolute -translate-x-1/2 top-8 flex flex-col items-center"
      style={{ left: `${position}%` }}
    >
      <span className="text-xs text-black">
        <span className="font-bold">
          {type === "entry" ? "-" : "+"}{contracts}P
        </span>
        {" "}for ${formatNumber(premium, 2)}
      </span>
    </div>
  )
}