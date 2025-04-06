
import { corsHeaders } from './utils.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

console.log("Submit position size function initialized");

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { position, profile_id } = await req.json();
    console.log('[submit_position_size] Input data:', { position, profile_id });

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not found');
    }
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. First delete any existing data for this position if updating
    if (position.id) {
      console.log('[submit_position_size] Deleting existing position data for ID:', position.id);
      const { error: deleteError } = await supabase
        .from('position_size')
        .delete()
        .eq('id', position.id);

      if (deleteError) {
        console.error('[submit_position_size] Error deleting position:', deleteError);
        throw deleteError;
      }
    }

    // 2. Insert new position data
    console.log('[submit_position_size] Inserting new position data');
    const { error: insertError, data: insertedData } = await supabase
      .from('position_size')
      .insert([{
        id: position.id, // Will be null for new positions
        profile_id,
        ticker: position.ticker,
        nominal: position.nominal,
        expiration: position.expiration || null,
        bond_yield: position.bond_yield,
        strike_entry: position.strike_entry,
        strike_exit: position.strike_exit,
        action: position.action,
      }])
      .select();

    if (insertError) {
      console.error('[submit_position_size] Error inserting position:', insertError);
      throw insertError;
    }

    // Get the inserted position ID
    const positionId = insertedData?.[0]?.id;
    position.id = positionId;
    
    console.log('[submit_position_size] Successfully saved position with ID:', positionId);

    // 3. Prepare market data request
    if (!position.ticker || !position.expiration) {
      console.log('[submit_position_size] Missing required fields for market data');
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const strikes = [];
    const isCall = position.action.toLowerCase().includes('call');
    const type = isCall ? 'call' : 'put';

    // New safeguard logic for API calls
    console.log('[submit_position_size] Preparing strikes for market data fetch:', {
      strike_entry: position.strike_entry,
      strike_exit: position.strike_exit
    });

    if (position.strike_entry && position.strike_exit) {
      // Both strikes present - add them in a single array
      console.log('[submit_position_size] Both strikes present, preparing single API call');
      strikes.push(
        {
          ticker: position.ticker,
          expiration: position.expiration,
          type,
          strike: position.strike_entry
        },
        {
          ticker: position.ticker,
          expiration: position.expiration,
          type,
          strike: position.strike_exit
        }
      );
    } else if (position.strike_entry) {
      // Only entry strike present
      console.log('[submit_position_size] Only entry strike present');
      strikes.push({
        ticker: position.ticker,
        expiration: position.expiration,
        type,
        strike: position.strike_entry
      });
    } else if (position.strike_exit) {
      // Only exit strike present
      console.log('[submit_position_size] Only exit strike present');
      strikes.push({
        ticker: position.ticker,
        expiration: position.expiration,
        type,
        strike: position.strike_exit
      });
    }

    if (strikes.length === 0) {
      console.log('[submit_position_size] No valid strikes to process');
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Fetch market data with a single API call
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

    // 5. Update position with market data
    const updateData: any = {};
    
    // Handle entry strike data if present
    if (position.strike_entry && marketData.responses[0]) {
      updateData.premium_entry = marketData.responses[0]?.marketData?.mid || null;
      // Store absolute value of delta_entry
      updateData.delta_entry = marketData.responses[0]?.marketData?.delta ? Math.abs(marketData.responses[0].marketData.delta) : null;
      updateData.iv_entry = marketData.responses[0]?.marketData?.iv || null;
      updateData.underlying_price_entry = marketData.responses[0]?.marketData?.underlyingPrice || null;
    }

    // Handle exit strike data if present
    if (position.strike_exit && marketData.responses[position.strike_entry ? 1 : 0]) {
      const exitResponse = position.strike_entry ? marketData.responses[1] : marketData.responses[0];
      updateData.premium_exit = exitResponse?.marketData?.mid || null;
      // Store absolute value of delta_exit
      updateData.delta_exit = exitResponse?.marketData?.delta ? Math.abs(exitResponse.marketData.delta) : null;
      updateData.iv_exit = exitResponse?.marketData?.iv || null;
    }

    console.log('[submit_position_size] Updating position with market data:', updateData);
    
    // Update the database entry by ID
    const { error: marketDataUpdateError } = await supabase
      .from('position_size')
      .update(updateData)
      .eq('id', positionId);

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
