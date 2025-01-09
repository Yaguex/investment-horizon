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
      
      // Get latest portfolio balance for ROI Portfolio calculation
      const { data: portfolioData, error: portfolioError } = await supabase
        .from('portfolio_data')
        .select('balance')
        .order('month', { ascending: false })
        .limit(1)

      if (portfolioError) {
        console.error('Error fetching portfolio balance:', portfolioError)
        throw portfolioError
      }

      const latestBalance = portfolioData?.[0]?.balance || 0
      console.log('Latest portfolio balance:', latestBalance)
      
      // First get the max trade_id from the trade_log table
      const { data: maxTradeIdResult } = await supabase
        .from('trade_log')
        .select('trade_id')
        .order('trade_id', { ascending: false })
        .limit(1)
        .single()

      const newTradeId = (maxTradeIdResult?.trade_id || 0) + 1
      console.log('Generated new trade_id:', newTradeId)

      // Then get the max id
      const { data: maxIdResult } = await supabase
        .from('trade_log')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .single()

      const newId = (maxIdResult?.id || 0) + 1
      console.log('Generated new id:', newId)

      const today = new Date()
      
      const { error } = await supabase
        .from('trade_log')
        .insert({
          id: newId,
          profile_id: user.id,
          trade_id: newTradeId,
          row_type: 'parent',
          trade_status: 'open',
          ticker: 'New trade',
          date_entry: format(today, 'yyyy-MM-dd'),
          roi_portfolio: 0 // Initialize ROI Portfolio as 0 for new trades
        })

      if (error) {
        console.error('Error creating new trade:', error)
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
      console.error('Error in handleNewTrade:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    }
  }

  return (
    <Button onClick={handleNewTrade}>New Position</Button>
  )
}