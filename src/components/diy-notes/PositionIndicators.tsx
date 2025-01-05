import { formatNumber } from "./utils/formatters"

interface PositionIndicatorsProps {
  note: any
  positions: {
    leftPosition: number
    middlePosition: number
    rightPosition: number
  }
}

export function PositionIndicators({ note, positions }: PositionIndicatorsProps) {
  const { leftPosition, middlePosition, rightPosition } = positions
  
  // Calculate days until expiration for bond yield
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

  // Calculate target contracts
  const targetContracts = entryContracts

  // Calculate fees
  const protectionFee = protectionContracts * note.strike_protection_mid * 100
  const entryFee = entryContracts * note.strike_entry_mid * 100 * -1
  const targetFee = targetContracts * note.strike_target_mid * 100

  return (
    <>
      {note.strike_entry !== 0 && (
        <div 
          className="absolute -translate-x-1/2 top-8 flex flex-col items-center"
          style={{ left: `${middlePosition}%` }}
        >
          <span className="text-xs text-black">
            <span className="font-bold">+{entryContracts}C</span> at ${note.strike_entry_mid}
          </span>
          <span className="text-xs text-red-500">${formatNumber(entryFee, 0)}</span>
        </div>
      )}
      {note.strike_protection !== 0 && (
        <div 
          className="absolute -translate-x-1/2 top-8 flex flex-col items-center"
          style={{ left: `${leftPosition}%` }}
        >
          <span className="text-xs text-black">
            <span className="font-bold">-{protectionContracts}P</span> at ${note.strike_protection_mid}
          </span>
          <span className="text-xs text-green-500">${formatNumber(protectionFee, 0)}</span>
        </div>
      )}
      {note.strike_target !== 0 && (
        <div 
          className="absolute -translate-x-1/2 top-8 flex flex-col items-center"
          style={{ left: `${rightPosition}%` }}
        >
          <span className="text-xs text-black">
            <span className="font-bold">-{targetContracts}C</span> at ${note.strike_target_mid}
          </span>
          <span className="text-xs text-green-500">${formatNumber(targetFee, 0)}</span>
        </div>
      )}
    </>
  )
}