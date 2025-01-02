import { Edit } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface EditButtonProps {
  onEdit: () => void
  isSubRow: boolean
}

export const EditButton = ({ onEdit, isSubRow }: EditButtonProps) => {
  return (
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
  )
}