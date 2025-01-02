import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/integrations/supabase/client"

export const useAddSubposition = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const handleAddSubposition = async (tradeId: number) => {
    try {
      console.log('Starting new subposition creation for trade:', tradeId)
      
      // First, fetch the parent trade data
      const { data: parentTrade, error: parentError } = await supabase
        .from('trade_log')
        .select('*')
        .eq('trade_id', tradeId)
        .eq('row_type', 'parent')
        .single()

      if (parentError || !parentTrade) {
        console.error('Error fetching parent trade:', parentError)
        toast({
          title: "Error",
          description: "Failed to fetch parent trade data",
          variant: "destructive"
        })
        return
      }

      console.log('Found parent trade:', parentTrade)

      // Get new ID for the child trade
      const { data: maxIdResult } = await supabase
        .from('trade_log')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .single()

      const newId = (maxIdResult?.id || 0) + 1
      console.log('Generated new id:', newId)

      const today = new Date().toISOString().split('T')[0]

      // Create child trade using parent's data
      const { error } = await supabase
        .from('trade_log')
        .insert({
          id: newId,
          profile_id: parentTrade.profile_id,
          portfolio_id: parentTrade.portfolio_id,
          trade_id: tradeId,
          ticker: parentTrade.ticker,
          row_type: 'child',
          trade_status: 'open',
          vehicle: 'Stock',
          order: 'Buy to open',
          qty: 0,
          date_entry: today,
          date_expiration: null,
          date_exit: null,
          days_in_trade: null,
          strike_start: null,
          strike_end: null,
          premium: null,
          stock_price: null,
          "risk_%": null,
          "risk_$": null,
          commission: null,
          pnl: null,
          roi: null,
          roi_yearly: null,
          roi_portfolio: null,
          be_0: null,
          be_1: null,
          be_2: null,
          delta: null,
          iv: null,
          iv_percentile: null,
          notes: null
        })

      if (error) {
        console.error('Error adding subposition:', error)
        toast({
          title: "Error",
          description: "Failed to add subposition",
          variant: "destructive"
        })
        return
      }

      console.log('Successfully added subposition')
      queryClient.invalidateQueries({ queryKey: ['trades'] })
      
      toast({
        title: "Success",
        description: "New subposition added successfully"
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

  return { handleAddSubposition }
}