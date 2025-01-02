import { useState } from "react"
import { ArrowDown, ArrowUp, Edit } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { NewTradeDialog } from "@/components/trade/NewTradeDialog"

interface TradeActionsProps {
  isSubRow: boolean
  isExpanded: boolean
  onToggle: () => void
  onEdit: () => void
  id?: number
  profileId?: string
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
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleEditClick = () => {
    console.log('Edit clicked for:', {
      isSubRow,
      id,
      tradeId,
      ticker,
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
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-pointer">
                      <NewTradeDialog />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add Trade</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </DialogTrigger>
            <DialogContent>
              <NewTradeDialog />
            </DialogContent>
          </Dialog>
        </>
      )}
      
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Edit 
              className="h-4 w-4 cursor-pointer" 
              onClick={handleEditClick}
            />
          </TooltipTrigger>
          <TooltipContent>
            <p>{isSubRow ? "Edit Trade" : "Edit Position"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}