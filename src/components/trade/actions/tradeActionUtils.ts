import { supabase } from "@/integrations/supabase/client"

export const createSubPosition = async (
  profileId: string | undefined,
  parentId: number | undefined,
  parentStatus: string
) => {
  if (!profileId || !parentId) {
    console.error('Missing required fields for adding sub-position:', { profileId, parentId })
    throw new Error('Missing required fields for adding sub-position')
  }

  console.log('Starting new sub-position creation for parent id:', parentId)
  
  // First, get the parent's trade_id
  const { data: parentTrade, error: parentError } = await supabase
    .from('trade_log')
    .select('trade_id')
    .eq('id', parentId)
    .single()

  if (parentError || !parentTrade) {
    console.error('Error fetching parent trade:', parentError)
    throw new Error('Could not fetch parent trade')
  }

  console.log('Found parent trade with trade_id:', parentTrade.trade_id)

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
      trade_id: parentTrade.trade_id, // Use parent's trade_id instead of its id
      row_type: 'child',
      trade_status: parentStatus,
      date_entry: new Date().toISOString().split('T')[0]
    })

  if (error) {
    console.error('Error adding sub-position:', error)
    throw error
  }

  console.log('Successfully added sub-position with parent trade_id:', parentTrade.trade_id)
  return newId
}