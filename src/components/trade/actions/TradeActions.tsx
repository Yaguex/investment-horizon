import { useState } from "react"
import { ArrowDown, ArrowUp, Edit, Plus, X } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { supabase } from "@/integrations/supabase/client"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/components/ui/use-toast"

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
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const handleAddTrade = async () => {
    console.log('Starting handleAddTrade with props:', { profileId, id, tradeId })
    
    if (!profileId) {
      console.error('No profile ID found')
      toast({
        title: "Error",
        description: "You must be logged in to add a trade",
        variant: "destructive"
      })
      return
    }

    try {
      console.log('Starting new trade creation for user:', profileId)
      
      // First get the max trade_id from the trade_log table
      const { data: maxTradeIdResult, error: tradeIdError } = await supabase
        .from('trade_log')
        .select('trade_id')
        .order('trade_id', { ascending: false })
        .limit(1)
        .single()

      if (tradeIdError) {
        console.error('Error fetching max trade_id:', tradeIdError)
        throw tradeIdError
      }

      const newTradeId = (maxTradeIdResult?.trade_id || 0) + 1
      console.log('Generated new trade_id:', newTradeId)

      // Then get the max id
      const { data: maxIdResult, error: idError } = await supabase
        .from('trade_log')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .single()

      if (idError) {
        console.error('Error fetching max id:', idError)
        throw idError
      }

      const newId = (maxIdResult?.id || 0) + 1
      console.log('Generated new id:', newId)

      const today = new Date()
      
      console.log('Attempting to insert new trade with data:', {
        id: newId,
        profile_id: profileId,
        trade_id: newTradeId,
        row_type: 'child',
        trade_status: 'open',
        ticker: ticker || 'New trade'
      })

      const { error: insertError } = await supabase
        .from('trade_log')
        .insert({
          id: newId,
          profile_id: profileId,
          trade_id: newTradeId,
          row_type: 'child',
          trade_status: 'open',
          ticker: ticker || 'New trade'
        })

      if (insertError) {
        console.error('Error creating new trade:', insertError)
        console.error('Error details:', insertError.details)
        console.error('Error hint:', insertError.hint)
        toast({
          title: "Error",
          description: "Failed to create new trade",
          variant: "destructive"
        })
        return
      }

      console.log('Successfully created new trade')
      queryClient.invalidateQueries({ queryKey: ['trades'] })
      
      toast({
        title: "Success",
        description: "New trade created successfully"
      })
    } catch (error) {
      console.error('Error in handleAddTrade:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    }
  }

  const handleDeleteTrade = async () => {
    if (!id) {
      console.error('No id found for trade')
      return
    }

    try {
      console.log('Deleting trade with id:', id)
      const { error } = await supabase
        .from('trade_log')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting trade:', error)
        toast({
          title: "Error",
          description: "Failed to delete trade",
          variant: "destructive"
        })
        return
      }

      console.log('Successfully deleted trade')
      queryClient.invalidateQueries({ queryKey: ['trades'] })
      
      toast({
        title: "Success",
        description: "Trade deleted successfully"
      })
    } catch (error) {
      console.error('Error in handleDeleteTrade:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    }
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