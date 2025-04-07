
import { Copy, Edit, Trash } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatDate } from "./utils/formatters"
import { formatNumber } from "./utils/formatters"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { useQueryClient } from "@tanstack/react-query"

interface positionHeaderProps {
  position: any
  onEdit: (position: any) => void
}

export function PositionHeader({ position, onEdit }: positionHeaderProps) {
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

  // Calculate Moniness percentages
  const actionLowerCase = position.action?.toLowerCase() || ''
  let strikeEntryMoniness, strikeExitMoniness, strikeMoniness;
  
  if (actionLowerCase.includes('buy') && actionLowerCase.includes('call')) {
    if (position.strike_entry >= position.underlying_price_entry) {
      strikeEntryMoniness = position.strike_entry ? Math.round(((position.strike_entry - position.underlying_price_entry) * 1) / position.underlying_price_entry * 100) : 0
      strikeExitMoniness = position.strike_exit ? Math.round(((position.strike_exit - position.underlying_price_entry) * 1) / position.underlying_price_entry * 100) : 0
      strikeMoniness = "OTM"
    } else {
      strikeEntryMoniness = position.strike_entry ? Math.round(((position.strike_entry - position.underlying_price_entry) * -1) / position.underlying_price_entry * 100) : 0
      strikeExitMoniness = position.strike_exit ? Math.round(((position.strike_exit - position.underlying_price_entry) * -1) / position.underlying_price_entry * 100) : 0
      strikeMoniness = "ITM"
    }
  } else if (actionLowerCase.includes('sell') && actionLowerCase.includes('call')) {
    if (position.strike_entry >= position.underlying_price_entry) {
      strikeEntryMoniness = position.strike_entry ? Math.round(((position.strike_entry - position.underlying_price_entry) * 1) / position.underlying_price_entry * 100) : 0
      strikeExitMoniness = position.strike_exit ? Math.round(((position.strike_exit - position.underlying_price_entry) * 1) / position.underlying_price_entry * 100) : 0
      strikeMoniness = "OTM"
    } else {
      strikeEntryMoniness = position.strike_entry ? Math.round(((position.strike_entry - position.underlying_price_entry) * -1) / position.underlying_price_entry * 100) : 0
      strikeExitMoniness = position.strike_exit ? Math.round(((position.strike_exit - position.underlying_price_entry) * -1) / position.underlying_price_entry * 100) : 0
      strikeMoniness = "ITM"
    }
  } else if (actionLowerCase.includes('buy') && actionLowerCase.includes('put')) {
    if (position.strike_entry >= position.underlying_price_entry) {
      strikeEntryMoniness = position.strike_entry ? Math.round(((position.strike_entry - position.underlying_price_entry) * 1) / position.underlying_price_entry * 100) : 0
      strikeExitMoniness = position.strike_exit ? Math.round(((position.strike_exit - position.underlying_price_entry) * 1) / position.underlying_price_entry * 100) : 0
      strikeMoniness = "ITM"
    } else {
      strikeEntryMoniness = position.strike_entry ? Math.round(((position.strike_entry - position.underlying_price_entry) * -1) / position.underlying_price_entry * 100) : 0
      strikeExitMoniness = position.strike_exit ? Math.round(((position.strike_exit - position.underlying_price_entry) * -1) / position.underlying_price_entry * 100) : 0
      strikeMoniness = "OTM"
    }
  } else if (actionLowerCase.includes('sell') && actionLowerCase.includes('put')) {
    if (position.strike_entry >= position.underlying_price_entry) {
      strikeEntryMoniness = position.strike_entry ? Math.round(((position.strike_entry - position.underlying_price_entry) * 1) / position.underlying_price_entry * 100) : 0
      strikeExitMoniness = position.strike_exit ? Math.round(((position.strike_exit - position.underlying_price_entry) * 1) / position.underlying_price_entry * 100) : 0
      strikeMoniness = "ITM"
    } else {
      strikeEntryMoniness = position.strike_entry ? Math.round(((position.strike_entry - position.underlying_price_entry) * -1) / position.underlying_price_entry * 100) : 0
      strikeExitMoniness = position.strike_exit ? Math.round(((position.strike_exit - position.underlying_price_entry) * -1) / position.underlying_price_entry * 100) : 0
      strikeMoniness = "OTM"
    }
  }

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center">
        <span className="font-bold text-lg mr-8">{position.ticker}</span>
        <span className="text-sm text-gray-500 mr-8">{formatDate(position.expiration)}</span>
        <span className="text-sm text-gray-500 mr-8">${formatNumber(position.nominal, 0)}</span>
        <span className="text-sm text-gray-500 mr-8">{position.action}</span>
        <span className="text-sm text-gray-500">Entry {strikeEntryMoniness}% {strikeMoniness} {position.strike_exit != null && (<span> | Exit {strikeExitMoniness}% {strikeMoniness}</span>)}</span>
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
