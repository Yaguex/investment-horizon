import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from './utils.ts'

console.log("Submit DIY dividend function initialized")

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { dividend, profile_id } = await req.json()
    console.log(`[${new Date().toISOString()}] Processing dividend submission for profile ${profile_id}:`, dividend)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Step 1: Save/Update dividend
    console.log(`[${new Date().toISOString()}] Step 1: Saving dividend to database`)
    const { data: savedDividend, error: saveError } = dividend.id 
      ? await supabase
          .from('diy_dividend')
          .update(dividend)
          .eq('id', dividend.id)
          .select()
          .single()
      : await supabase
          .from('diy_dividend')
          .insert([{ ...dividend, profile_id }])
          .select()
          .single()

    if (saveError) {
      console.error(`[${new Date().toISOString()}] Error saving dividend:`, saveError)
      throw saveError
    }

    // Step 2: Validate required fields and prepare market data request
    if (!dividend.ticker || !dividend.expiration) {
      console.log(`[${new Date().toISOString()}] Missing required fields for market data`)
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 3: Prepare strikes array
    console.log(`[${new Date().toISOString()}] Preparing strikes for market data fetch:`, {
      strike_call: dividend.strike_call,
      strike_put: dividend.strike_put
    })

    const strikes = []

    if (dividend.strike_call) {
      strikes.push({
        ticker: dividend.ticker,
        expiration: dividend.expiration,
        type: 'call',
        strike: dividend.strike_call
      })
    }

    if (dividend.strike_put) {
      strikes.push({
        ticker: dividend.ticker,
        expiration: dividend.expiration,
        type: 'put',
        strike: dividend.strike_put
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

    // Step 5: Update dividend with market data using Position Size's methodology
    console.log(`[${new Date().toISOString()}] Updating dividend with market data`)
    const updateData: any = {}

    // Handle call strike data if present
    if (dividend.strike_call && marketData.responses?.[0]) {
      updateData.underlying_Mprice = marketData.responses[0]?.marketData?.underlyingPrice || null
      updateData.strike_call_mid = marketData.responses[0]?.marketData?.mid || null
      updateData.strike_call_open_interest = marketData.responses[0]?.marketData?.openInterest || null
      updateData.strike_call_iv = marketData.responses[0]?.marketData?.iv || null
      updateData.strike_call_delta = marketData.responses[0]?.marketData?.delta || null
      updateData.strike_call_intrinsic_value = marketData.responses[0]?.marketData?.intrinsicValue || null
      updateData.strike_call_extrinsic_value = marketData.responses[0]?.marketData?.extrinsicValue || null
    }

    // Handle put strike data if present
    if (dividend.strike_put && marketData.responses?.[1]) {
      updateData.underlying_price = marketData.responses[0]?.marketData?.underlyingPrice || null
      updateData.strike_put_mid = marketData.responses[1]?.marketData?.mid || null
      updateData.strike_put_open_interest = marketData.responses[1]?.marketData?.openInterest || null
      updateData.strike_put_iv = marketData.responses[1]?.marketData?.iv || null
      updateData.strike_put_delta = marketData.responses[1]?.marketData?.delta || null
      updateData.strike_put_intrinsic_value = marketData.responses[1]?.marketData?.intrinsicValue || null
      updateData.strike_put_extrinsic_value = marketData.responses[1]?.marketData?.extrinsicValue || null
    }

    const { error: updateError } = await supabase
      .from('diy_dividend')
      .update(updateData)
      .eq('id', savedDividend.id)

    if (updateError) {
      console.error(`[${new Date().toISOString()}] Error updating dividend with market data:`, updateError)
      throw updateError
    }

    console.log(`[${new Date().toISOString()}] Successfully processed dividend submission`)
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