interface PriceRangeBarProps {
  leftPosition: number
  middlePosition: number
  rightPosition: number
  action: string
}

export function PriceRangeBar({ leftPosition, middlePosition, rightPosition, action }: PriceRangeBarProps) {
  const isSpread = action.includes('spread')
  const isBuy = action.toLowerCase().includes('buy')
  const isPut = action.toLowerCase().includes('put')
  
  // Determine the color based on whether it's a buy or sell
  const color = isBuy ? 'bg-green-500' : 'bg-red-500'
  
  // Calculate start and end positions based on action type
  let start: number, end: number
  
  if (isSpread) {
    // For spreads, use the calculated positions directly
    start = Math.min(leftPosition, rightPosition)
    end = Math.max(leftPosition, rightPosition)
  } else {
    // For single options
    start = leftPosition
    if (isPut) {
      // Puts stretch to 0%
      end = 0
    } else {
      // Calls stretch to 100%
      end = 100
    }
  }
  
  return (
    <div className="w-full bg-gray-100 rounded-lg h-4 relative overflow-hidden">
      <div 
        className={`absolute top-0 bottom-0 ${color}`}
        style={{ 
          left: `${Math.min(start, end)}%`,
          width: `${Math.abs(end - start)}%`
        }}
      />
    </div>
  )
}