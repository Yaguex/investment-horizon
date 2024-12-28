import { ArrowDown, ArrowUp, Edit, Plus, X } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ActionButtonsProps {
  isSubRow: boolean
  isExpanded: boolean
  onToggle: () => void
  onEdit: () => void
  onAdd?: () => void
  onDelete?: () => void
}

export function ActionButtons({ 
  isSubRow, 
  isExpanded, 
  onToggle, 
  onEdit,
  onAdd,
  onDelete
}: ActionButtonsProps) {
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
          
          {onAdd && (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Plus className="h-4 w-4 cursor-pointer" onClick={onAdd} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add Trade</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </>
      )}
      
      {isSubRow && onDelete && (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <X className="h-4 w-4 cursor-pointer" onClick={onDelete} />
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete Trade</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
            <p>{isSubRow ? "Edit Trade" : "Edit bucket"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}