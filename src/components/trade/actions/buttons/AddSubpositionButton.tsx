import { Plus } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

interface AddSubpositionButtonProps {
  tradeId: number
  profileId: string
  portfolioId: number | null
  ticker: string
}

export const AddSubpositionButton = ({ 
  tradeId, 
  profileId, 
  portfolioId, 
  ticker 
}: AddSubpositionButtonProps) => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const handleAddSubposition = async () => {
    try {
      console.log('Adding subposition for trade:', { tradeId, profileId, portfolioId, ticker })
      
      const { data: maxIdResult } = await supabase
        .from('trade_log')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .single()

      const newId = (maxIdResult?.id || 0) + 1
      console.log('Generated new id:', newId)

      const { error } = await supabase
        .from('trade_log')
        .insert({
          id: newId,
          profile_id: profileId,
          portfolio_id: portfolioId,
          trade_id: tradeId,
          ticker: ticker,
          row_type: 'child',
          trade_status: 'open',
          vehicle: 'Stock',
          order: 'Buy to open',
          qty: 0,
          date_entry: new Date().toISOString().split('T')[0],
        })

      if (error) {
        console.error('Error adding subposition:', error)
        toast({
          title: "Error",
          description: "Failed to add sub-position",
          variant: "destructive"
        })
        return
      }

      console.log('Successfully added subposition')
      queryClient.invalidateQueries({ queryKey: ['trades'] })
      
      toast({
        title: "Success",
        description: "Sub-position added successfully"
      })
    } catch (error) {
      console.error('Error in handleAddSubposition:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Plus className="h-4 w-4 cursor-pointer" onClick={handleAddSubposition} />
        </TooltipTrigger>
        <TooltipContent>
          <p>Add Sub-position</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}