import { ArrowDown, ArrowUp, Edit, Plus, X } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAddSubposition } from "./handlers/useAddSubposition"
import { useDeleteTrade } from "./handlers/useDeleteTrade"

interface TradeActionsProps {
  isSubRow: boolean
  isExpanded: boolean
  onToggle: () => void
  onEdit: () => void
  id?: number
  tradeId?: number
}

export const TradeActions = ({ 
  isSubRow, 
  isExpanded, 
  onToggle, 
  onEdit,
  id,
  tradeId
}: TradeActionsProps) => {
  console.log('TradeActions rendered with:', { isSubRow, id, tradeId })
  
  const { handleAddSubposition } = useAddSubposition()
  const { handleDeleteTrade } = useDeleteTrade()

  const handleEditClick = () => {
    console.log('Edit clicked for:', {
      isSubRow,
      id,
      tradeId,
      type: isSubRow ? 'child row' : 'parent row'
    })
    onEdit()
  }

  return (
    <div className="flex items-center gap-2">
      {!isSubRow && (
        <>
          <div 
            onClick={onToggle}
            className="cursor-pointer"
          >
            {isExpanded ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )}
          </div>
          
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Plus 
                  className="h-4 w-4 cursor-pointer" 
                  onClick={() => tradeId && handleAddSubposition(tradeId)} 
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Add Sub-position</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      )}
      
      {isSubRow ? (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <X className="h-4 w-4 cursor-pointer" onClick={() => id && handleDeleteTrade(id)} />
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete Sub-position</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : null}
      
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Edit 
              className="h-4 w-4 cursor-pointer" 
              onClick={handleEditClick}
            />
          </TooltipTrigger>
          <TooltipContent>
            <p>{isSubRow ? "Edit Sub-position" : "Edit Position"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}