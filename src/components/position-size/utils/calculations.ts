export const calculateCirclePositions = (note: any) => {
  const middlePosition = 50;
  let entryPosition, exitPosition;

  // For testing purposes, we'll use the hardcoded values
  const testNote = {
    ...note,
    strike_entry: 580,
    strike_exit: 540,
    underlying_price_entry: 590
  };

  if (!testNote.underlying_price_entry || !testNote.strike_entry || !testNote.strike_exit) {
    return { middlePosition, entryPosition: middlePosition, exitPosition: middlePosition };
  }

  const underlyingPrice = testNote.underlying_price_entry;
  const strikes = [testNote.strike_entry, testNote.strike_exit].sort((a, b) => 
    Math.abs(underlyingPrice - a) - Math.abs(underlyingPrice - b)
  );

  // The strike furthest from underlying price
  const furthestStrike = strikes[1];
  // The other strike
  const otherStrike = strikes[0];

  // Determine if furthest strike is above or below underlying
  const furthestPosition = furthestStrike > underlyingPrice ? 90 : 10;

  // Calculate the position of the other strike proportionally
  const totalPriceRange = Math.abs(furthestStrike - underlyingPrice);
  const otherStrikeDistance = Math.abs(otherStrike - underlyingPrice);
  const otherPosition = middlePosition + 
    ((otherStrikeDistance / totalPriceRange) * (furthestPosition - middlePosition)) * 
    (otherStrike > underlyingPrice ? 1 : -1);

  // Map the positions back to entry and exit strikes
  if (testNote.strike_entry === furthestStrike) {
    entryPosition = furthestPosition;
    exitPosition = otherPosition;
  } else {
    entryPosition = otherPosition;
    exitPosition = furthestPosition;
  }

  return { middlePosition, entryPosition, exitPosition };
};