import { supabase } from "@/integrations/supabase/client"

export const recalculateParentCommissions = async () => {
  console.log('Starting parent commissions recalculation')
  
  try {
    // Get all parent trades
    const { data: parentTrades, error: parentsError } = await supabase
      .from('trade_log')
      .select('id, trade_id')
      .eq('row_type', 'parent')
    
    if (parentsError) {
      console.error('Error fetching parent trades:', parentsError)
      throw parentsError
    }
    
    // For each parent, sum up child commissions and update parent
    for (const parent of parentTrades) {
      const { data: childTrades, error: childrenError } = await supabase
        .from('trade_log')
        .select('commission')
        .eq('trade_id', parent.trade_id)
        .eq('row_type', 'child')
      
      if (childrenError) {
        console.error('Error fetching child trades:', childrenError)
        continue
      }
      
      const totalCommission = childTrades.reduce((sum, trade) => 
        sum + (trade.commission || 0), 0
      )
      
      const { error: updateError } = await supabase
        .from('trade_log')
        .update({ commission: totalCommission })
        .eq('id', parent.id)
      
      if (updateError) {
        console.error('Error updating parent commission:', updateError)
      }
    }
    
    console.log('Parent commissions recalculation completed')
  } catch (error) {
    console.error('Error in recalculateParentCommissions:', error)
    throw error
  }
}