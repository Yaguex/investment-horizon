import { useState } from "react"
import { ActionButtons } from "./ActionButtons"
import { useTradeActions } from "./TradeActionHandlers"
import { EditBucketSheet } from "@/components/allocations/EditBucketSheet"

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
  bucket,
  bucketId,
  tradeId,
  ticker
}: TradeActionsProps) => {
  const [isEditBucketOpen, setIsEditBucketOpen] = useState(false)
  const { handleDeleteTrade, handleAddChildTrade } = useTradeActions()

  return (
    <>
      <ActionButtons 
        isSubRow={isSubRow}
        isExpanded={isExpanded}
        onToggle={onToggle}
        onEdit={() => isSubRow ? onEdit() : setIsEditBucketOpen(true)}
        onAdd={!isSubRow && tradeId && profileId ? 
          () => handleAddChildTrade(tradeId, profileId) : 
          undefined
        }
        onDelete={isSubRow && id ? 
          () => handleDeleteTrade(id) : 
          undefined
        }
      />

      {!isSubRow && id && bucket && (
        <EditBucketSheet
          isOpen={isEditBucketOpen}
          onClose={() => setIsEditBucketOpen(false)}
          bucket={bucket}
          id={id}
          bucketId={bucketId}
        />
      )}
    </>
  )
}