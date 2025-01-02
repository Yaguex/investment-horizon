import { supabase } from "@/integrations/supabase/client"
import { toast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"

export const createSubPosition = async (
  profileId: string | undefined,
  tradeId: number | undefined,
  parentStatus: string
) => {
  if (!profileId || !tradeId) {
    console.error('Missing required fields for adding sub-position:', { profileId, tradeId })
    throw new Error('Missing required fields for adding sub-position')
  }

  console.log('Starting new sub-position creation for trade:', tradeId)
  
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
      trade_status: parentStatus,
      date_entry: new Date().toISOString().split('T')[0]
    })

  if (error) {
    console.error('Error adding sub-position:', error)
    throw error
  }

  console.log('Successfully added sub-position')
  return newId
}