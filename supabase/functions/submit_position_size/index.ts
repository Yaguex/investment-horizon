import { corsHeaders } from '../fetch_marketdata_api/utils.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

console.log("Submit position size function initialized");

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { note, profile_id } = await req.json();
    console.log('[submit_position_size] Input data:', { note, profile_id });

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not found');
    }
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. First save/update position size data
    console.log('[submit_position_size] Saving position size data');
    if (note.id) {
      const { error: updateError } = await supabase
        .from('position_size')
        .update({
          ticker: note.ticker,
          exposure: note.exposure,
          expiration: note.expiration || null,
          risk_free_yield: note.risk_free_yield,
          strike_entry: note.strike_entry,
          strike_exit: note.strike_exit,
          action: note.action,
        })
        .eq('id', note.id);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('position_size')
        .insert([{
          profile_id,
          ticker: note.ticker,
          exposure: note.exposure,
          expiration: note.expiration || null,
          risk_free_yield: note.risk_free_yield,
          strike_entry: note.strike_entry,
          strike_exit: note.strike_exit,
          action: note.action,
        }]);

      if (insertError) throw insertError;
    }

    // 2. Prepare market data request
    if (!note.ticker || !note.expiration) {
      console.log('[submit_position_size] Missing required fields for market data');
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const strikes = [];
    const isCall = note.action.toLowerCase().includes('call');
    const type = isCall ? 'call' : 'put';

    // New safeguard logic for API calls
    console.log('[submit_position_size] Preparing strikes for market data fetch:', {
      strike_entry: note.strike_entry,
      strike_exit: note.strike_exit
    });

    if (note.strike_entry && note.strike_exit) {
      // Both strikes present - add them in a single array
      console.log('[submit_position_size] Both strikes present, preparing single API call');
      strikes.push(
        {
          ticker: note.ticker,
          expiration: note.expiration,
          type,
          strike: note.strike_entry
        },
        {
          ticker: note.ticker,
          expiration: note.expiration,
          type,
          strike: note.strike_exit
        }
      );
    } else if (note.strike_entry) {
      // Only entry strike present
      console.log('[submit_position_size] Only entry strike present');
      strikes.push({
        ticker: note.ticker,
        expiration: note.expiration,
        type,
        strike: note.strike_entry
      });
    } else if (note.strike_exit) {
      // Only exit strike present
      console.log('[submit_position_size] Only exit strike present');
      strikes.push({
        ticker: note.ticker,
        expiration: note.expiration,
        type,
        strike: note.strike_exit
      });
    }

    if (strikes.length === 0) {
      console.log('[submit_position_size] No valid strikes to process');
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Fetch market data with a single API call
    console.log('[submit_position_size] Fetching market data for strikes:', strikes);
    const marketDataResponse = await fetch(
      `${supabaseUrl}/functions/v1/fetch_marketdata_api`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ strikes })
      }
    );

    const marketData = await marketDataResponse.json();
    console.log('[submit_position_size] Market data response:', marketData);

    if (marketData.error === 'API failure') {
      throw new Error('Function failure');
    }

    // 4. Update position with market data
    const updateData: any = {};
    
    // Handle entry strike data if present
    if (note.strike_entry && marketData.responses[0]) {
      updateData.premium_entry = marketData.responses[0]?.marketData?.mid || null;
      // Store absolute value of delta_entry
      updateData.delta_entry = marketData.responses[0]?.marketData?.delta ? Math.abs(marketData.responses[0].marketData.delta) : null;
      updateData.iv_entry = marketData.responses[0]?.marketData?.iv || null;
      updateData.underlying_price_entry = marketData.responses[0]?.marketData?.underlyingPrice || null;
    }

    // Handle exit strike data if present
    if (note.strike_exit && marketData.responses[note.strike_entry ? 1 : 0]) {
      const exitResponse = note.strike_entry ? marketData.responses[1] : marketData.responses[0];
      updateData.premium_exit = exitResponse?.marketData?.mid || null;
      // Store absolute value of delta_exit
      updateData.delta_exit = exitResponse?.marketData?.delta ? Math.abs(exitResponse.marketData.delta) : null;
      updateData.iv_exit = exitResponse?.marketData?.iv || null;
    }

    console.log('[submit_position_size] Updating position with market data:', updateData);
    const { error: marketDataUpdateError } = await supabase
      .from('position_size')
      .update(updateData)
      .eq('profile_id', profile_id)
      .eq('ticker', note.ticker)
      .eq('expiration', note.expiration)
      .eq('strike_entry', note.strike_entry);

    if (marketDataUpdateError) throw marketDataUpdateError;

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[submit_position_size] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});