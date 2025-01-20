import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from './utils.ts'

console.log("Submit DIY notes function initialized")

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { note, profile_id } = await req.json()
    console.log(`[${new Date().toISOString()}] Processing note submission for profile ${profile_id}:`, note)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Step 1: Save/Update note
    console.log(`[${new Date().toISOString()}] Step 1: Saving note to database`)
    const { data: savedNote, error: saveError } = note.id 
      ? await supabase
          .from('diy_notes')
          .update(note)
          .eq('id', note.id)
          .select()
          .single()
      : await supabase
          .from('diy_notes')
          .insert([{ ...note, profile_id }])
          .select()
          .single()

    if (saveError) {
      console.error(`[${new Date().toISOString()}] Error saving note:`, saveError)
      throw saveError
    }

    // Step 2: Validate required fields and prepare market data request
    if (!note.ticker || !note.expiration) {
      console.log(`[${new Date().toISOString()}] Missing required fields for market data`)
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 3: Prepare strikes array
    console.log(`[${new Date().toISOString()}] Preparing strikes for market data fetch:`, {
      strike_entry: note.strike_entry,
      strike_target: note.strike_target,
      strike_protection: note.strike_protection
    })

    const strikes = []

    if (note.strike_entry) {
      strikes.push({
        ticker: note.ticker,
        expiration: note.expiration,
        type: 'call',
        strike: note.strike_entry
      })
    }

    if (note.strike_target) {
      strikes.push({
        ticker: note.ticker,
        expiration: note.expiration,
        type: 'call',
        strike: note.strike_target
      })
    }

    if (note.strike_protection) {
      strikes.push({
        ticker: note.ticker,
        expiration: note.expiration,
        type: 'put',
        strike: note.strike_protection
      })
    }

    if (strikes.length === 0) {
      console.log(`[${new Date().toISOString()}] No valid strikes to process`)
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 4: Fetch market data
    console.log(`[${new Date().toISOString()}] Fetching market data for strikes:`, strikes)
    const { data: marketData, error: marketDataError } = await supabase.functions.invoke('fetch_marketdata_api', {
      body: { strikes }
    })

    if (marketDataError || marketData.error === "API failure") {
      console.error(`[${new Date().toISOString()}] Market data API error:`, marketDataError || "API failure")
      throw new Error("Function failure")
    }

    // Step 5: Update note with market data using Position Size's methodology
    console.log(`[${new Date().toISOString()}] Updating note with market data`)
    const updateData: any = {}

    // Handle entry strike data if present
    if (note.strike_entry && marketData.responses[0]) {
      updateData.underlying_price = marketData.responses[0]?.marketData?.underlyingPrice || null
      updateData.strike_entry_mid = marketData.responses[0]?.marketData?.mid || null
      updateData.strike_entry_open_interest = marketData.responses[0]?.marketData?.openInterest || null
      updateData.strike_entry_iv = marketData.responses[0]?.marketData?.iv || null
      updateData.strike_entry_delta = marketData.responses[0]?.marketData?.delta || null
      updateData.strike_entry_intrinsic_value = marketData.responses[0]?.marketData?.intrinsicValue || null
      updateData.strike_entry_extrinsic_value = marketData.responses[0]?.marketData?.extrinsicValue || null
    }

    // Handle target strike data if present
    if (note.strike_target && marketData.responses[1]) {
      updateData.strike_target_mid = marketData.responses[1]?.marketData?.mid || null
      updateData.strike_target_open_interest = marketData.responses[1]?.marketData?.openInterest || null
      updateData.strike_target_iv = marketData.responses[1]?.marketData?.iv || null
      updateData.strike_target_delta = marketData.responses[1]?.marketData?.delta || null
      updateData.strike_target_intrinsic_value = marketData.responses[1]?.marketData?.intrinsicValue || null
      updateData.strike_target_extrinsic_value = marketData.responses[1]?.marketData?.extrinsicValue || null
    }

    // Handle protection strike data if present
    if (note.strike_protection && marketData.responses[2]) {
      updateData.strike_protection_mid = marketData.responses[2]?.marketData?.mid || null
      updateData.strike_protection_open_interest = marketData.responses[2]?.marketData?.openInterest || null
      updateData.strike_protection_iv = marketData.responses[2]?.marketData?.iv || null
      updateData.strike_protection_delta = marketData.responses[2]?.marketData?.delta || null
      updateData.strike_protection_intrinsic_value = marketData.responses[2]?.marketData?.intrinsicValue || null
      updateData.strike_protection_extrinsic_value = marketData.responses[2]?.marketData?.extrinsicValue || null
    }

    const { error: updateError } = await supabase
      .from('diy_notes')
      .update(updateData)
      .eq('id', savedNote.id)

    if (updateError) {
      console.error(`[${new Date().toISOString()}] Error updating note with market data:`, updateError)
      throw updateError
    }

    console.log(`[${new Date().toISOString()}] Successfully processed note submission`)
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error:`, error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})