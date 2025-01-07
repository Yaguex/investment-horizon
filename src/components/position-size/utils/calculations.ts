export const calculateCirclePositions = (note: any) => {
  const middlePosition = 50
  
  if (!note.underlying_price_entry || !note.strike_entry || !note.strike_exit) {
    return { middlePosition, entryPosition: middlePosition, exitPosition: middlePosition }
  }

  const underlyingPrice = note.underlying_price_entry
  const strikes = [note.strike_entry, note.strike_exit].sort((a, b) => 
    Math.abs(b - underlyingPrice) - Math.abs(a - underlyingPrice)
  )

  // The strike furthest from underlying price
  const furthestStrike = strikes[0]
  // The other strike
  const otherStrike = strikes[1]

  // Determine if furthest strike is above or below underlying
  const furthestPosition = furthestStrike > underlyingPrice ? 90 : 10

  // Calculate the position of the other strike proportionally
  const totalPriceRange = Math.abs(furthestStrike - underlyingPrice)
  const otherStrikeDistance = Math.abs(otherStrike - underlyingPrice)
  const otherPosition = middlePosition + 
    ((otherStrikeDistance / totalPriceRange) * (furthestPosition - middlePosition)) * 
    (otherStrike < underlyingPrice ? -1 : 1) // Fixed positioning logic here

  // Map the positions back to entry and exit strikes
  const entryPosition = note.strike_entry === furthestStrike ? furthestPosition : otherPosition
  const exitPosition = note.strike_entry === furthestStrike ? otherPosition : furthestPosition

  return { middlePosition, entryPosition, exitPosition }
}