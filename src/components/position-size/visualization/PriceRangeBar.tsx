interface PriceRangeBarProps {
  leftPosition: number
  middlePosition: number
  rightPosition: number
  hasProtection: boolean
}

export function PriceRangeBar({ leftPosition, middlePosition, rightPosition, hasProtection }: PriceRangeBarProps) {
  return (
    <div className="w-full bg-gray-100 rounded-lg h-4 relative overflow-hidden">
      {hasProtection && (
        <div 
          className="absolute left-0 top-0 bottom-0 bg-red-500"
          style={{ width: `${leftPosition}%` }}
        />
      )}
      <div 
        className="absolute top-0 bottom-0 bg-green-500"
        style={{ 
          left: `${middlePosition}%`,
          width: `${rightPosition - middlePosition}%`
        }}
      />
    </div>
  )
}