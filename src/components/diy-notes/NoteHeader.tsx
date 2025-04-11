import { Copy, Edit, Trash } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatDate, formatNumber } from "./utils/formatters"
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

interface NoteHeaderProps {
  note: any
  onEdit: (note: any) => void
}

export function NoteHeader({ note, onEdit }: NoteHeaderProps) {
  const queryClient = useQueryClient()

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('diy_notes')
        .delete()
        .eq('id', note.id)

      if (error) throw error

      toast.success('Note deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['diy-notes'] })
    } catch (error) {
      console.error('Error deleting note:', error)
      toast.error('Error deleting note')
    }
  }

  const handleClone = async () => {
    try {
      // Create a new note object without the id
      const { id, ...noteWithoutId } = note

      const { error } = await supabase
        .from('diy_notes')
        .insert([noteWithoutId])

      if (error) throw error

      toast.success('Note cloned successfully')
      queryClient.invalidateQueries({ queryKey: ['diy-notes'] })
    } catch (error) {
      console.error('Error cloning note:', error)
      toast.error('Error cloning note')
    }
  }

  const protectionOTM = note.strike_entry ? Math.round(((note.strike_protection - note.underlying_price) * -1) / note.underlying_price * 100) : 0
  const targetOTM = note.strike_entry ? Math.round((note.strike_target - note.underlying_price) / note.underlying_price * 100) : 0

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center">
        <span className="font-bold text-lg mr-8">{note.ticker}</span>
        <span className="text-sm text-gray-500 mr-8">{formatDate(note.expiration)}</span>
        <span className="text-sm text-gray-500 mr-8">${formatNumber(note.nominal, 0)}</span>
        <span className="text-sm text-gray-500">Protection {protectionOTM}% OTM | Target {targetOTM}% OTM</span>
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
              <p>Copy Note</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="cursor-pointer" onClick={() => onEdit(note)}>
                <Edit className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit Note</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="cursor-pointer" onClick={handleDelete}>
                <Trash className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete Note</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  )
}