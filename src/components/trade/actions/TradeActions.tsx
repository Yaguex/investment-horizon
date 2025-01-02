import { ArrowDown, ArrowUp, Edit } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { AddSubPosition } from "./AddSubPosition"
import { DeleteSubPosition } from "./DeleteSubPosition"

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
          
          <AddSubPosition 
            tradeId={tradeId}
            profileId={profileId}
            ticker={ticker}
          />
        </>
      )}
      
      {isSubRow && (
        <DeleteSubPosition 
          id={id}
          profileId={profileId}
        />
      )}
      
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Edit 
              className="h-4 w-4 cursor-pointer" 
              onClick={onEdit}
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