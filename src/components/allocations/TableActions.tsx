import { Button } from "@/components/ui/button"
import { ArrowUp, Plus, Edit, X } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface TableActionsProps {
  isSubRow?: boolean
  isExpanded?: boolean
  onToggle?: () => void
}

export const TableActions = ({ isSubRow, isExpanded, onToggle }: TableActionsProps) => {
  if (isSubRow) {
    return (
      <div className="flex items-center gap-2 ml-8">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon">
              <X className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete ticker</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit ticker</TooltipContent>
        </Tooltip>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
      >
        <ArrowUp className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </Button>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Add ticker</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Edit bucket</TooltipContent>
      </Tooltip>
    </div>
  )
}