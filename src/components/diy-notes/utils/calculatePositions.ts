export const calculateCirclePositions = (note: any) => {
  const middlePosition = 50
  let leftPosition, rightPosition, be1Position, be2Position

  const targetDiff = note.strike_target - note.strike_entry
  const protectionDiff = note.strike_entry - note.strike_protection

  // Calculate days until expiration
  const today = new Date()
  const expirationDate = note.expiration ? new Date(note.expiration) : today
  const daysUntilExpiration = (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  const yearsUntilExpiration = daysUntilExpiration / 365

  // Calculate total bond yield
  const totalBondYield = note.nominal * (note.bond_yield / 100) * yearsUntilExpiration

  // Calculate protection contracts
  const protectionContracts = Math.round(note.nominal / note.strike_protection / 100)

  // Calculate entry contracts
  const entryContracts = Math.round(
    ((totalBondYield * -1) - (protectionContracts * note.strike_protection_mid * 100)) / 
    ((note.strike_target_mid * 100) - (note.strike_entry_mid * 100))
  )

  // Calculate leverage
  const leverage = entryContracts / ((1000000 + (note.nominal * (note.dividend_yield/100) * yearsUntilExpiration) - (totalBondYield + (protectionContracts * note.strike_protection_mid * 100) + (entryContracts * note.strike_entry_mid * 100 * -1) + (entryContracts * note.strike_target_mid * 100))) / note.strike_entry / 100)

  // Calculate BE strikes with updated formulas
  const be1Strike = note.strike_entry + ((note.strike_entry * ((note.bond_yield/100) * yearsUntilExpiration)) / leverage)
  const be2Strike = note.strike_entry + ((note.strike_entry * ((7/100) * yearsUntilExpiration)) / leverage)

  if (targetDiff >= protectionDiff) {
    rightPosition = 90
    leftPosition = 50 - ((protectionDiff * 40) / targetDiff)
    
    // Calculate BE positions relative to entry and target
    be1Position = Math.min(100, 50 + ((be1Strike - note.strike_entry) * 40 / targetDiff))
    be2Position = Math.min(100, 50 + ((be2Strike - note.strike_entry) * 40 / targetDiff))
  } else {
    leftPosition = 10
    rightPosition = 50 + ((targetDiff * 40) / protectionDiff)
    
    // Calculate BE positions relative to entry and target
    be1Position = Math.min(100, 50 + ((be1Strike - note.strike_entry) * 40 / protectionDiff))
    be2Position = Math.min(100, 50 + ((be2Strike - note.strike_entry) * 40 / protectionDiff))
  }

  return { leftPosition, middlePosition, rightPosition, be1Position, be2Position, be1Strike, be2Strike }
}