import { Copy, Edit, Trash } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatDate } from "../diy-notes/utils/formatters"
import { toast } from "sonner"

interface NoteHeaderProps {
  note: any
  onEdit: (note: any) => void
}

export function NoteHeader({ note, onEdit }: NoteHeaderProps) {
  const handleDelete = async () => {
    toast.success('Position size deleted')
  }

  const handleClone = async () => {
    toast.success('Position size cloned')
  }

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center">
        <span className="font-bold text-lg mr-8">{note.ticker}</span>
        <span className="text-sm text-gray-500 mr-8">{formatDate(note.expiration)}</span>
        <span className="text-sm text-gray-500 mr-8">${note.exposure}</span>
      </div>
      <TooltipProvider>
        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="cursor-pointer" onClick={handleClone}>
                <Copy className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy Position Size</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="cursor-pointer" onClick={() => onEdit(note)}>
                <Edit className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit Position Size</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="cursor-pointer" onClick={handleDelete}>
                <Trash className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete Position Size</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  )
}