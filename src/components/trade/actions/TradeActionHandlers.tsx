import { supabase } from "@/integrations/supabase/client"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/components/ui/use-toast"

export function useTradeActions() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const handleDeleteTrade = async (id: number) => {
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

  const handleAddChildTrade = async (tradeId: number, profileId: string) => {
    try {
      console.log('Adding child trade to trade:', tradeId)
      
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
          trade_id: tradeId,
          row_type: 'child',
          trade_status: 'open'
        })

      if (error) {
        console.error('Error adding child trade:', error)
        toast({
          title: "Error",
          description: "Failed to add child trade",
          variant: "destructive"
        })
        return
      }

      console.log('Successfully added child trade')
      queryClient.invalidateQueries({ queryKey: ['trades'] })
      
      toast({
        title: "Success",
        description: "Child trade added successfully"
      })
    } catch (error) {
      console.error('Error in handleAddChildTrade:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    }
  }

  return {
    handleDeleteTrade,
    handleAddChildTrade
  }
}