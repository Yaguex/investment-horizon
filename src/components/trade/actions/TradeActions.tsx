import { ArrowDown, ArrowUp, Edit, Plus, X } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { format } from "date-fns"
import { supabase } from "@/integrations/supabase/client"
import { useQueryClient } from "@tanstack/react-query"

interface TradeActionsProps {
  isSubRow: boolean
  isExpanded: boolean
  onToggle: () => void
  onEdit: () => void
  tradeId?: number
  id?: number
  profileId?: string
  ticker?: string
}

export const TradeActions = ({ 
  isSubRow, 
  isExpanded, 
  onToggle, 
  onEdit,
  tradeId,
  id,
  profileId,
  ticker
}: TradeActionsProps) => {
  const queryClient = useQueryClient()

  const handleAddTrade = async () => {
    if (!tradeId || !profileId || !ticker) {
      console.error('Missing required fields for adding trade')
      return
    }

    const today = new Date()
    const { error } = await supabase
      .from('trade_log')
      .insert({
        profile_id: profileId,
        trade_id: tradeId,
        row_type: 'child',
        trade_status: 'open',
        ticker: ticker,
        date_entry: format(today, 'yyyy-MM-dd')
      })

    if (error) {
      console.error('Error adding trade:', error)
      return
    }

    queryClient.invalidateQueries({ queryKey: ['trades'] })
  }

  const handleDeleteTrade = async () => {
    if (!id) {
      console.error('No id found for child row')
      return
    }

    const { error } = await supabase
      .from('trade_log')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting trade:', error)
      return
    }

    queryClient.invalidateQueries({ queryKey: ['trades'] })
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
                <Plus className="h-4 w-4 cursor-pointer" onClick={handleAddTrade} />
              </TooltipTrigger>
              <TooltipContent>
                <p>Add Trade</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      )}
      
      {isSubRow ? (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <X className="h-4 w-4 cursor-pointer" onClick={handleDeleteTrade} />
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete Trade</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : null}
      
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Edit className="h-4 w-4 cursor-pointer" onClick={onEdit} />
          </TooltipTrigger>
          <TooltipContent>
            <p>Edit Trade</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}