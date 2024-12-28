import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { supabase } from "@/integrations/supabase/client"
import { useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/components/ui/use-toast"

export function NewTradeDialog() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const handleNewTrade = async () => {
    console.log('Starting handleNewTrade function')
    
    if (!user) {
      console.error('No user found')
      toast({
        title: "Error",
        description: "You must be logged in to create a trade",
        variant: "destructive"
      })
      return
    }

    try {
      console.log('Starting new trade creation for user:', user.id)
      
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
        profile_id: user.id,
        trade_id: newTradeId,
        row_type: 'parent',
        trade_status: 'open',
        ticker: 'New trade',
        date_entry: format(today, 'yyyy-MM-dd')
      })

      const { data: insertData, error: insertError } = await supabase
        .from('trade_log')
        .insert({
          id: newId,
          profile_id: user.id,
          trade_id: newTradeId,
          row_type: 'parent',
          trade_status: 'open',
          ticker: 'New trade',
          date_entry: format(today, 'yyyy-MM-dd')
        })
        .select()

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

      console.log('Successfully created new trade:', insertData)
      queryClient.invalidateQueries({ queryKey: ['trades'] })
      
      toast({
        title: "Success",
        description: "New trade created successfully"
      })
    } catch (error) {
      console.error('Error in handleNewTrade:', error)
      console.error('Full error object:', JSON.stringify(error, null, 2))
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    }
  }

  return (
    <Button onClick={handleNewTrade}>New Trade</Button>
  )
}