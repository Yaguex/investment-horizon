
import { corsHeaders } from './utils.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

console.log('[VERY FIRST LOG] Submit position size function INITIALIZED - FIRST ENTRY POINT');

Deno.serve(async (req) => {
  console.log(`[${new Date().toISOString()}] [submit_position_size] FIRST CONSOLE LOG: Received request: ${req.method} ${req.url}`);
  
  if (req.method === 'OPTIONS') {
    console.log(`[${new Date().toISOString()}] [submit_position_size] Handling OPTIONS request for CORS`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestStartTime = Date.now();
    const requestBody = await req.json();
    console.log(`[${new Date().toISOString()}] [submit_position_size] Request body parsed in ${Date.now() - requestStartTime}ms`);
    
    const { position, profile_id } = requestBody;
    console.log('[submit_position_size] Input data:', { 
      position: {
        id: position?.id,
        ticker: position?.ticker,
        nominal: position?.nominal,
        expiration: position?.expiration,
        bond_yield: position?.bond_yield,
        strike_entry: position?.strike_entry,
        strike_exit: position?.strike_exit,
        action: position?.action
      }, 
      profile_id 
    });

    // Validate essential input data
    if (!position) {
      console.error('[submit_position_size] Error: Missing position data in request');
      throw new Error('Position data is required');
    }
    
    if (!profile_id) {
      console.error('[submit_position_size] Error: Missing profile_id in request');
      throw new Error('Profile ID is required');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      console.error('[submit_position_size] Error: Supabase credentials not found');
      throw new Error('Supabase credentials not found');
    }
    console.log(`[${new Date().toISOString()}] [submit_position_size] Supabase client initialized with URL: ${supabaseUrl}`);
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
      console.log(`[${new Date().toISOString()}] [submit_position_size] Successfully deleted existing position with ID: ${position.id}`);
    }

    // 2. For new positions, get the next available ID
    let nextId;
    if (!position.id) {
      const { data: maxIdResult, error: maxIdError } = await supabase
        .from('position_size')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .single();
      
      if (maxIdError && maxIdError.code !== 'PGRST116') { // PGRST116 is "No rows returned"
        console.error('[submit_position_size] Error getting max ID:', maxIdError);
        throw maxIdError;
      }
      
      nextId = maxIdResult ? maxIdResult.id + 1 : 1;
      console.log(`[${new Date().toISOString()}] [submit_position_size] Generated new ID for position: ${nextId}`);
    }

    // 3. Insert new position data
    console.log('[submit_position_size] Inserting new position data');
    const { error: insertError, data: insertedData } = await supabase
      .from('position_size')
      .insert([{
        id: position.id || nextId, // Use existing ID or next available ID
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
      strike_exit: position.strike_exit,
      ticker: position.ticker,
      expiration: position.expiration,
      type: type
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
    console.log('[submit_position_size] Fetching market data for strikes:', JSON.stringify(strikes));
    const fetchStartTime = Date.now();
    try {
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
      console.log(`[${new Date().toISOString()}] [submit_position_size] Market data API call completed in ${Date.now() - fetchStartTime}ms`);
      console.log(`[${new Date().toISOString()}] [submit_position_size] Market data API response status: ${marketDataResponse.status}`);

      if (!marketDataResponse.ok) {
        console.error(`[${new Date().toISOString()}] [submit_position_size] Market data API returned error status: ${marketDataResponse.status}`);
        // Try to get response body for more detail
        try {
          const errorText = await marketDataResponse.text();
          console.error(`[${new Date().toISOString()}] [submit_position_size] Market data API error response: ${errorText}`);
        } catch (e) {
          console.error(`[${new Date().toISOString()}] [submit_position_size] Could not read error response: ${e}`);
        }
        throw new Error(`Market data API error: ${marketDataResponse.status}`);
      }

      const marketData = await marketDataResponse.json();
      console.log('[submit_position_size] Market data response:', JSON.stringify(marketData));

      // Validate the market data response structure
      if (!marketData) {
        console.error('[submit_position_size] Market data API returned empty response');
        throw new Error('Empty response from market data API');
      }

      if (marketData.error === 'API failure') {
        console.error('[submit_position_size] Market data API reported internal failure:', marketData);
        throw new Error('Function failure');
      }

      // Validate that responses array exists and has expected structure
      if (!marketData.responses || !Array.isArray(marketData.responses)) {
        console.error('[submit_position_size] Invalid market data response structure - missing or invalid responses array');
        throw new Error('Invalid market data response structure');
      }

      console.log(`[${new Date().toISOString()}] [submit_position_size] Received ${marketData.responses.length} responses from market data API`);

      // 5. Update position with market data
      const updateData: any = {};
      
      // Handle entry strike data if present
      if (position.strike_entry && marketData.responses[0]) {
        console.log('[submit_position_size] Processing entry strike data:', marketData.responses[0]);
        updateData.premium_entry = marketData.responses[0]?.marketData?.mid || null;
        // Store absolute value of delta_entry
        updateData.delta_entry = marketData.responses[0]?.marketData?.delta ? Math.abs(marketData.responses[0].marketData.delta) : null;
        updateData.iv_entry = marketData.responses[0]?.marketData?.iv || null;
        updateData.underlying_price_entry = marketData.responses[0]?.marketData?.underlyingPrice || null;
        
        // Log null values for debugging
        const nullFields = Object.entries(updateData)
          .filter(([_, value]) => value === null)
          .map(([key]) => key);
        
        if (nullFields.length > 0) {
          console.warn(`[${new Date().toISOString()}] [submit_position_size] Null values detected in entry strike fields: ${nullFields.join(', ')}`);
        }
      } else if (position.strike_entry) {
        console.warn(`[${new Date().toISOString()}] [submit_position_size] Missing market data for entry strike ${position.strike_entry}`);
      }

      // Handle exit strike data if present
      if (position.strike_exit && marketData.responses[position.strike_entry ? 1 : 0]) {
        const exitResponse = position.strike_entry ? marketData.responses[1] : marketData.responses[0];
        console.log('[submit_position_size] Processing exit strike data:', exitResponse);
        updateData.premium_exit = exitResponse?.marketData?.mid || null;
        // Store absolute value of delta_exit
        updateData.delta_exit = exitResponse?.marketData?.delta ? Math.abs(exitResponse.marketData.delta) : null;
        updateData.iv_exit = exitResponse?.marketData?.iv || null;
        
        // Log null values for debugging
        const nullFields = Object.entries({
          premium_exit: updateData.premium_exit,
          delta_exit: updateData.delta_exit,
          iv_exit: updateData.iv_exit
        })
          .filter(([_, value]) => value === null)
          .map(([key]) => key);
        
        if (nullFields.length > 0) {
          console.warn(`[${new Date().toISOString()}] [submit_position_size] Null values detected in exit strike fields: ${nullFields.join(', ')}`);
        }
      } else if (position.strike_exit) {
        console.warn(`[${new Date().toISOString()}] [submit_position_size] Missing market data for exit strike ${position.strike_exit}`);
      }

      console.log('[submit_position_size] Updating position with market data:', updateData);
      
      // Update the database entry by ID
      const { error: marketDataUpdateError } = await supabase
        .from('position_size')
        .update(updateData)
        .eq('id', positionId);

      if (marketDataUpdateError) {
        console.error('[submit_position_size] Error updating position with market data:', marketDataUpdateError);
        throw marketDataUpdateError;
      }
      
      console.log(`[${new Date().toISOString()}] [submit_position_size] Successfully updated position ${positionId} with market data`);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (fetchError) {
      console.error(`[${new Date().toISOString()}] [submit_position_size] Error during market data fetch:`, fetchError);
      throw fetchError;
    }
  } catch (error) {
    console.error('[submit_position_size] Error:', error);
    if (error.stack) {
      console.error('[submit_position_size] Error stack:', error.stack);
    }
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
