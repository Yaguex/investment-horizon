
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

    // Step 1: If updating an existing dividend, first delete the record
    if (dividend.id) {
      console.log(`[${new Date().toISOString()}] Deleting existing dividend with ID ${dividend.id}`)
      const { error: deleteError } = await supabase
        .from('diy_dividend')
        .delete()
        .eq('id', dividend.id)
      
      if (deleteError) {
        console.error(`[${new Date().toISOString()}] Error deleting existing dividend:`, deleteError)
        throw deleteError
      }
    }

    // Step 2: Insert new dividend record
    console.log(`[${new Date().toISOString()}] Inserting new dividend record`)
    const { data: savedDividend, error: saveError } = await supabase
      .from('diy_dividend')
      .insert([{ 
        ...dividend, 
        profile_id,
        id: dividend.id // Keep the same ID if it was an update
      }])
      .select()
      .single()

    if (saveError) {
      console.error(`[${new Date().toISOString()}] Error saving dividend:`, saveError)
      throw saveError
    }

    // Step 3: Validate required fields and prepare market data request
    if (!dividend.ticker || !dividend.expiration) {
      console.log(`[${new Date().toISOString()}] Missing required fields for market data`)
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 4: Prepare strikes array
    console.log(`[${new Date().toISOString()}] Preparing strikes for market data fetch:`, {
      strike_call: dividend.strike_call,
      strike_put: dividend.strike_put
    })

    const strikes = []

    // Always add call strike if provided
    if (dividend.strike_call) {
      strikes.push({
        ticker: dividend.ticker,
        expiration: dividend.expiration,
        type: 'call',
        strike: dividend.strike_call
      })

      // Add put with the same strike as call if strike_put is null
      // This way we fetch put data but don't store strike_put value itself
      if (dividend.strike_put === null) {
        strikes.push({
          ticker: dividend.ticker,
          expiration: dividend.expiration,
          type: 'put',
          strike: dividend.strike_call  // Using call strike for put data
        })
      }
    }

    // If strike_put is provided, also add it normally
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

    // Step 5: Fetch market data
    console.log(`[${new Date().toISOString()}] Fetching market data for strikes:`, strikes)
    const { data: marketData, error: marketDataError } = await supabase.functions.invoke('fetch_marketdata_api', {
      body: { strikes }
    })

    if (marketDataError || marketData.error === "API failure") {
      console.error(`[${new Date().toISOString()}] Market data API error:`, marketDataError || "API failure")
      throw new Error("Function failure")
    }

    // Step 6: Update dividend with market data using Position Size's methodology
    console.log(`[${new Date().toISOString()}] Updating dividend with market data`)
    const updateData: any = {}

    // Handle call strike data if present
    if (dividend.strike_call && marketData.responses?.[0]) {
      updateData.underlying_price = marketData.responses[0]?.marketData?.underlyingPrice || null
      updateData.strike_call_mid = marketData.responses[0]?.marketData?.mid || null
      updateData.strike_call_open_interest = marketData.responses[0]?.marketData?.openInterest || null
      updateData.strike_call_iv = marketData.responses[0]?.marketData?.iv || null
      updateData.strike_call_delta = marketData.responses[0]?.marketData?.delta || null
      updateData.strike_call_intrinsic_value = marketData.responses[0]?.marketData?.intrinsicValue || null
      updateData.strike_call_extrinsic_value = marketData.responses[0]?.marketData?.extrinsicValue || null
    }

    // Handle put strike data
    // The response index depends on whether we have one or two strikes
    const putResponseIndex = dividend.strike_call ? (dividend.strike_put ? 1 : 1) : 0;
    
    // Now we always process put data if it exists in the response,
    // regardless of whether strike_put was provided in the original dividend
    if (marketData.responses?.[putResponseIndex]) {
      // Don't update the strike_put field itself if it was null
      if (dividend.strike_put !== null) {
        updateData.strike_put = dividend.strike_put;
      }
      
      updateData.underlying_price = updateData.underlying_price || marketData.responses[putResponseIndex]?.marketData?.underlyingPrice || null
      updateData.strike_put_mid = marketData.responses[putResponseIndex]?.marketData?.mid || null
      updateData.strike_put_open_interest = marketData.responses[putResponseIndex]?.marketData?.openInterest || null
      updateData.strike_put_iv = marketData.responses[putResponseIndex]?.marketData?.iv || null
      updateData.strike_put_delta = marketData.responses[putResponseIndex]?.marketData?.delta || null
      updateData.strike_put_intrinsic_value = marketData.responses[putResponseIndex]?.marketData?.intrinsicValue || null
      updateData.strike_put_extrinsic_value = marketData.responses[putResponseIndex]?.marketData?.extrinsicValue || null
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
