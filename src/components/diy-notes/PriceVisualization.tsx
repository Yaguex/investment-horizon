import { StrikeCircle } from "./visualization/StrikeCircle"
import { PositionIndicator } from "./visualization/PositionIndicator"
import { PriceRectangle } from "./visualization/PriceRectangle"
import { formatNumber } from "./utils/formatters"

interface PriceVisualizationProps {
  note: any
}

const calculateCirclePositions = (note: any) => {
  const middlePosition = 50
  let leftPosition, rightPosition

  const targetDiff = note.strike_target - note.strike_entry
  const protectionDiff = note.strike_entry - note.strike_protection

  if (targetDiff >= protectionDiff) {
    rightPosition = 90
    leftPosition = 50 - ((protectionDiff * 40) / targetDiff)
  } else {
    leftPosition = 10
    rightPosition = 50 + ((targetDiff * 40) / protectionDiff)
  }

  return { leftPosition, middlePosition, rightPosition }
}

const calculateBEPositions = (note: any, middlePosition: number, rightPosition: number) => {
  // Calculate days until expiration
  const today = new Date()
  const expirationDate = note.expiration ? new Date(note.expiration) : today
  const daysUntilExpiration = (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  const yearsUntilExpiration = daysUntilExpiration / 365

  // Calculate BE1 and BE2 strikes
  const strike_be1 = note.strike_entry + note.strike_entry * ((note.bond_yield/100) * yearsUntilExpiration)
  const strike_be2 = note.strike_entry + note.strike_entry * ((7/100) * yearsUntilExpiration)

  // Calculate positions based on the strikes
  const targetRange = note.strike_target - note.strike_entry
  const be1Range = strike_be1 - note.strike_entry
  const be2Range = strike_be2 - note.strike_entry

  // Calculate positions proportionally between strike_entry (50%) and strike_target (rightPosition%)
  const be1Position = middlePosition + ((be1Range * (rightPosition - middlePosition)) / targetRange)
  const be2Position = middlePosition + ((be2Range * (rightPosition - middlePosition)) / targetRange)

  return { 
    be1Position, 
    be2Position,
    strike_be1,
    strike_be2
  }
}

export function PriceVisualization({ note }: PriceVisualizationProps) {
  const { leftPosition, middlePosition, rightPosition } = calculateCirclePositions(note)
  const { be1Position, be2Position, strike_be1, strike_be2 } = calculateBEPositions(note, middlePosition, rightPosition)
  
  // Calculate the number of contracts for protection
  const protectionContracts = Math.round(note.nominal / note.strike_protection / 100)
  
  // Calculate days until expiration for bond yield
  const today = new Date()
  const expirationDate = note.expiration ? new Date(note.expiration) : today
  const daysUntilExpiration = (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  const yearsUntilExpiration = daysUntilExpiration / 365

  // Calculate total bond yield
  const totalBondYield = note.nominal * (note.bond_yield / 100) * yearsUntilExpiration

  // Calculate entry contracts
  const entryContracts = Math.round(
    ((totalBondYield * -1) - (protectionContracts * note.strike_protection_mid * 100)) / 
    ((note.strike_target_mid * 100) - (note.strike_entry_mid * 100))
  )

  // Set target contracts equal to entry contracts
  const targetContracts = entryContracts

  // Calculate fees
  const protectionFee = protectionContracts * note.strike_protection_mid * 100
  const entryFee = entryContracts * note.strike_entry_mid * 100 * -1
  const targetFee = targetContracts * note.strike_target_mid * 100
  
  return (
    <div className="mt-12 mb-20 relative">
      {/* Strike Entry Circle (Middle) */}
      {note.strike_entry !== 0 && (
        <StrikeCircle 
          position={middlePosition}
          strike={note.strike_entry}
          className="fill-black text-black"
        />
      )}
      
      {/* Strike Target Circle (Right) */}
      {note.strike_target !== 0 && (
        <StrikeCircle 
          position={rightPosition}
          strike={note.strike_target}
          className="fill-black text-black"
        />
      )}
      
      {/* Strike Protection Circle (Left) */}
      {note.strike_protection !== 0 && (
        <StrikeCircle 
          position={leftPosition}
          strike={note.strike_protection}
          className="fill-black text-black"
        />
      )}

      {/* BE1 Circle */}
      {note.strike_entry !== 0 && (
        <StrikeCircle 
          position={be1Position}
          strike={formatNumber(strike_be1, 2)}
          style={{ fill: 'rgba(0,0,0,0.2)', color: 'rgba(0,0,0,0.2)' }}
        />
      )}

      {/* BE2 Circle */}
      {note.strike_entry !== 0 && (
        <StrikeCircle 
          position={be2Position}
          strike={formatNumber(strike_be2, 2)}
          style={{ fill: 'rgba(0,0,0,0.2)', color: 'rgba(0,0,0,0.2)' }}
        />
      )}
      
      {/* Price rectangles */}
      <PriceRectangle 
        leftPosition={leftPosition}
        middlePosition={middlePosition}
        rightPosition={rightPosition}
        showProtection={note.strike_protection !== 0}
      />
      
      {/* Position indicators */}
      {note.strike_entry !== 0 && (
        <PositionIndicator
          position={middlePosition}
          contracts={entryContracts}
          strike={note.strike_entry_mid}
          fee={entryFee}
        />
      )}
      {note.strike_protection !== 0 && (
        <PositionIndicator
          position={leftPosition}
          contracts={protectionContracts}
          strike={note.strike_protection_mid}
          fee={protectionFee}
          prefix="-"
        />
      )}
      {note.strike_target !== 0 && (
        <PositionIndicator
          position={rightPosition}
          contracts={targetContracts}
          strike={note.strike_target_mid}
          fee={targetFee}
          prefix="-"
        />
      )}
    </div>
  )
}