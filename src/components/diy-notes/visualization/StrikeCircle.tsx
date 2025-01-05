import { Circle } from "lucide-react"

interface StrikeCircleProps {
  position: number
  strike: number
  className?: string
  style?: React.CSSProperties
}

export function StrikeCircle({ position, strike, className = "", style }: StrikeCircleProps) {
  return (
    <div 
      className={`absolute -translate-x-1/2 -top-6 flex flex-col items-center z-10 ${className}`}
      style={{ left: `${position}%`, ...style }}
    >
      <span className="text-sm text-black mb-1">${strike}</span>
      <Circle className="h-4 w-4" style={style} />
    </div>
  )
}