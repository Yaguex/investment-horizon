import { EditButton } from "./buttons/EditButton"
import { DeleteButton } from "./buttons/DeleteButton"
import { ExpandButton } from "./buttons/ExpandButton"
import { AddSubpositionButton } from "./buttons/AddSubpositionButton"

interface TradeActionsProps {
  isSubRow: boolean
  isExpanded: boolean
  onToggle: () => void
  onEdit: () => void
  id?: number
  profileId?: string
  bucket?: string
  bucketId?: number
  tradeId?: number
  ticker?: string
}

export const TradeActions = ({ 
  isSubRow, 
  isExpanded, 
  onToggle, 
  onEdit,
  id,
  profileId,
  tradeId,
  ticker
}: TradeActionsProps) => {
  console.log('TradeActions rendered with:', { isSubRow, id, tradeId, ticker })

  return (
    <div className="flex items-center gap-2">
      {!isSubRow && (
        <>
          <ExpandButton isExpanded={isExpanded} onToggle={onToggle} />
          
          {tradeId && profileId && ticker && (
            <AddSubpositionButton 
              tradeId={tradeId}
              profileId={profileId}
              portfolioId={null}
              ticker={ticker}
            />
          )}
        </>
      )}
      
      {isSubRow && id && (
        <DeleteButton id={id} isSubRow={isSubRow} />
      )}
      
      <EditButton onEdit={onEdit} isSubRow={isSubRow} />
    </div>
  )
}