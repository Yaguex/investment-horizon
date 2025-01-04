import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders, formatExpirationDate, findOptionByStrike, processOptionData } from './utils.ts';
import { fetchStockQuote, fetchOptionsChain } from './api.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.1'

console.log("Test function initialized");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ticker, expiration, strike, type, strike_position } = await req.json();
    console.log("Received parameters:", { ticker, expiration, strike, type, strike_position });

    const apiKey = Deno.env.get('MARKETDATA_API_KEY');
    if (!apiKey) {
      throw new Error('MARKETDATA_API_KEY not found');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not found');
    }
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch stock quote
    const stockQuote = await fetchStockQuote(ticker, apiKey);
    console.log("Stock quote:", stockQuote);

    // Fetch options data
    const options = await fetchOptionsChain(
      ticker,
      expiration,
      type,
      strike.toString(),
      apiKey
    );
    console.log("Options data:", options);

    // Process the option data
    const optionData = processOptionData(
      findOptionByStrike(options, parseFloat(strike)),
      parseFloat(strike)
    );

    // Get user ID from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      throw new Error('Failed to get user');
    }

    // Prepare the update data based on strike_position
    const updateData: Record<string, any> = {
      ticker,
      expiration,
      profile_id: user.id
    };

    // Add the market data to the appropriate columns based on strike_position
    const prefix = `strike_${strike_position}_`;
    updateData[`${prefix}mid`] = optionData.mid;
    updateData[`${prefix}open_interest`] = options?.[0]?.openInterest || null;
    updateData[`${prefix}iv`] = optionData.iv;
    updateData[`${prefix}delta`] = options?.[0]?.delta || null;
    updateData[`${prefix}intrinsic_value`] = options?.[0]?.intrinsicValue || null;
    updateData[`${prefix}extrinsic_value`] = options?.[0]?.extrinsicValue || null;

    // Update or insert the data
    const { error: upsertError } = await supabase
      .from('diy_notes')
      .upsert(updateData, {
        onConflict: 'ticker,expiration,profile_id'
      });

    if (upsertError) {
      console.error("Error upserting data:", upsertError);
      throw upsertError;
    }

    return new Response(
      JSON.stringify({
        symbol: optionData.optionSymbol,
        marketData: {
          mid: optionData.mid,
          openInterest: options?.[0]?.openInterest || null,
          iv: optionData.iv,
          delta: options?.[0]?.delta || null,
          intrinsicValue: options?.[0]?.intrinsicValue || null,
          extrinsicValue: options?.[0]?.extrinsicValue || null
        }
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error in test function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});