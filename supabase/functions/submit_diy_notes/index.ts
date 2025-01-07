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

    // Step 2: Fetch market data
    console.log(`[${new Date().toISOString()}] Step 2: Fetching market data`)
    const strikes = [
      { ticker: note.ticker, expiration: note.expiration, type: 'call', strike: note.strike_entry },
      { ticker: note.ticker, expiration: note.expiration, type: 'call', strike: note.strike_target },
      { ticker: note.ticker, expiration: note.expiration, type: 'put', strike: note.strike_protection }
    ]

    const { data: marketData, error: marketDataError } = await supabase.functions.invoke('fetch_marketdata_api', {
      body: { strikes }
    })

    if (marketDataError || marketData.error === "API failure") {
      console.error(`[${new Date().toISOString()}] Market data API error:`, marketDataError || "API failure")
      throw new Error("Function failure")
    }

    // Step 3: Update note with market data
    console.log(`[${new Date().toISOString()}] Step 3: Updating note with market data`)
    const [entry, target, protection] = marketData.responses

    const updateData = {
      underlying_price: entry.marketData.underlyingPrice,
      strike_entry_mid: entry.marketData.mid,
      strike_entry_open_interest: entry.marketData.openInterest,
      strike_entry_iv: entry.marketData.iv,
      strike_entry_delta: entry.marketData.delta,
      strike_entry_intrinsic_value: entry.marketData.intrinsicValue,
      strike_entry_extrinsic_value: entry.marketData.extrinsicValue,
      strike_target_mid: target.marketData.mid,
      strike_target_open_interest: target.marketData.openInterest,
      strike_target_iv: target.marketData.iv,
      strike_target_delta: target.marketData.delta,
      strike_target_intrinsic_value: target.marketData.intrinsicValue,
      strike_target_extrinsic_value: target.marketData.extrinsicValue,
      strike_protection_mid: protection.marketData.mid,
      strike_protection_open_interest: protection.marketData.openInterest,
      strike_protection_iv: protection.marketData.iv,
      strike_protection_delta: protection.marketData.delta,
      strike_protection_intrinsic_value: protection.marketData.intrinsicValue,
      strike_protection_extrinsic_value: protection.marketData.extrinsicValue,
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