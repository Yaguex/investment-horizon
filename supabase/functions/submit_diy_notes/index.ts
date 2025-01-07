import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../fetch_marketdata_api/utils.ts'

console.log("Submit DIY notes function initialized")

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { note, profile_id } = await req.json()
    console.log(`[${new Date().toISOString()}] Received note submission:`, { note, profile_id })

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !supabaseKey) throw new Error('Missing Supabase environment variables')
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    console.log(`[${new Date().toISOString()}] Supabase client initialized`)

    // Save or update note
    const isUpdate = note.id !== undefined
    console.log(`[${new Date().toISOString()}] Operation type: ${isUpdate ? 'UPDATE' : 'INSERT'}`)

    const { data: savedNote, error: saveError } = isUpdate
      ? await supabase
          .from('diy_notes')
          .update({
            ...note,
            profile_id,
            expiration: note.expiration || null,
          })
          .eq('id', note.id)
          .select()
          .single()
      : await supabase
          .from('diy_notes')
          .insert([{
            ...note,
            profile_id,
            expiration: note.expiration || null,
          }])
          .select()
          .single()

    if (saveError) throw saveError
    console.log(`[${new Date().toISOString()}] Note saved successfully:`, savedNote)

    // Fetch market data
    console.log(`[${new Date().toISOString()}] Fetching market data`)
    const strikes = [
      {
        ticker: note.ticker,
        expiration: note.expiration,
        type: 'call',
        strike: note.strike_entry
      },
      {
        ticker: note.ticker,
        expiration: note.expiration,
        type: 'call',
        strike: note.strike_target
      },
      {
        ticker: note.ticker,
        expiration: note.expiration,
        type: 'put',
        strike: note.strike_protection
      }
    ]

    const { data: marketData, error: marketDataError } = await supabase.functions.invoke('fetch_marketdata_api', {
      body: { strikes }
    })

    if (marketDataError) throw marketDataError
    console.log(`[${new Date().toISOString()}] Market data fetched successfully:`, marketData)

    // Update note with market data
    const { error: updateError } = await supabase
      .from('diy_notes')
      .update({
        strike_entry_mid: marketData.responses[0]?.marketData?.mid || null,
        strike_entry_open_interest: marketData.responses[0]?.marketData?.openInterest || null,
        strike_entry_iv: marketData.responses[0]?.marketData?.iv || null,
        strike_entry_delta: marketData.responses[0]?.marketData?.delta || null,
        strike_entry_intrinsic_value: marketData.responses[0]?.marketData?.intrinsicValue || null,
        strike_entry_extrinsic_value: marketData.responses[0]?.marketData?.extrinsicValue || null,
        strike_target_mid: marketData.responses[1]?.marketData?.mid || null,
        strike_target_open_interest: marketData.responses[1]?.marketData?.openInterest || null,
        strike_target_iv: marketData.responses[1]?.marketData?.iv || null,
        strike_target_delta: marketData.responses[1]?.marketData?.delta || null,
        strike_target_intrinsic_value: marketData.responses[1]?.marketData?.intrinsicValue || null,
        strike_target_extrinsic_value: marketData.responses[1]?.marketData?.extrinsicValue || null,
        strike_protection_mid: marketData.responses[2]?.marketData?.mid || null,
        strike_protection_open_interest: marketData.responses[2]?.marketData?.openInterest || null,
        strike_protection_iv: marketData.responses[2]?.marketData?.iv || null,
        strike_protection_delta: marketData.responses[2]?.marketData?.delta || null,
        strike_protection_intrinsic_value: marketData.responses[2]?.marketData?.intrinsicValue || null,
        strike_protection_extrinsic_value: marketData.responses[2]?.marketData?.extrinsicValue || null,
        underlying_price: marketData.responses[0]?.marketData?.underlyingPrice || null
      })
      .eq('id', savedNote.id)

    if (updateError) throw updateError
    console.log(`[${new Date().toISOString()}] Note updated with market data successfully`)

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error:`, error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})