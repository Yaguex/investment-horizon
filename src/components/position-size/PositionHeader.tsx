import { Copy, Edit, Trash } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatDate } from "../position-size/utils/formatters"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { useQueryClient } from "@tanstack/react-query"

interface positionHeaderProps {
  position: any
  onEdit: (position: any) => void
}

export function positionHeader({ position, onEdit }: positionHeaderProps) {
  const queryClient = useQueryClient()

  const handleDelete = async () => {
    try {
      console.log('Deleting position size:', position.id)
      const { error } = await supabase
        .from('position_size')
        .delete()
        .eq('id', position.id)

      if (error) throw error

      console.log('Position size deleted successfully')
      toast.success('Position size deleted')
      queryClient.invalidateQueries({ queryKey: ['position-sizes'] })
    } catch (error) {
      console.error('Error deleting position size:', error)
      toast.error('Error deleting position size')
    }
  }

  const handleClone = async () => {
    try {
      // Create a new position object without the id
      const { id, ...positionWithoutId } = position

      const { error } = await supabase
        .from('position_size')
        .insert([positionWithoutId])

      if (error) throw error

      toast.success('Position size cloned')
      queryClient.invalidateQueries({ queryKey: ['position-sizes'] })
    } catch (error) {
      console.error('Error cloning position size:', error)
      toast.error('Error cloning position size')
    }
  }

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center">
        <span className="font-bold text-lg mr-8">{position.ticker}</span>
        <span className="text-sm text-gray-500 mr-8">{formatDate(position.expiration)}</span>
        <span className="text-sm text-gray-500 mr-8">${formatNumber(position.nominal, 0)}</span>
        <span className="text-sm text-gray-500 mr-8">{position.action}</span>
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
              <button className="cursor-pointer" onClick={() => onEdit(position)}>
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