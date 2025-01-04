import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchOptionData(symbol: string, apiKey: string, retries = 3): Promise<any> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const url = `https://api.marketdata.app/v1/options/quotes/${symbol}/`;
      console.log(`[${new Date().toISOString()}] Making request to MarketData API for symbol: ${symbol}`);
      console.log(`[${new Date().toISOString()}] Attempting to fetch data from: ${url} (attempt ${attempt})`);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Token ${apiKey}`,
        }
      });

      console.log(`[${new Date().toISOString()}] Response status:`, response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`[${new Date().toISOString()}] Raw API response data:`, JSON.stringify(data, null, 2));
      
      if (data.s === 'ok' && data.mid && data.mid.length > 0) {
        console.log(`[${new Date().toISOString()}] Processing data:`, {
          status: data.s,
          hasMid: !!data.mid,
          midLength: data.mid?.length,
          midValue: data.mid?.[0],
          openInterest: data.openInterest?.[0],
          iv: data.iv?.[0],
          delta: data.delta?.[0]
        });

        return {
          mid: Number(data.mid[0]).toFixed(2),
          openInterest: data.openInterest[0],
          iv: Math.round(data.iv[0] * 100),
          delta: Number(data.delta[0]).toFixed(2),
          intrinsicValue: Number(data.intrinsicValue[0]).toFixed(2),
          extrinsicValue: Number(data.extrinsicValue[0]).toFixed(2)
        };
      }
      
      console.log(`[${new Date().toISOString()}] No valid data found for symbol: ${symbol}. Data validation failed:`, {
        status: data.s,
        hasMid: !!data.mid,
        midLength: data.mid?.length
      });
      return null;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in attempt ${attempt}:`, error);
      if (attempt === retries) {
        console.error(`[${new Date().toISOString()}] Failed to fetch data after ${retries} attempts:`, error);
        return null;
      }
      console.log(`[${new Date().toISOString()}] Waiting 5 seconds before retry...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  return null;
}

function generateOptionSymbol(ticker: string, expiration: string, type: string, strike: number): string {
  // Parse the date string (DD-MM-YYYY) into parts
  const [day, month, year] = expiration.split('-').map(Number);
  
  // Format the date parts for the symbol
  const yearStr = year.toString().slice(-2);
  const monthStr = month.toString().padStart(2, '0');
  const dayStr = day.toString().padStart(2, '0');
  
  // Generate option symbol (Format: SPY260116C00585000)
  const optionType = type.toUpperCase().charAt(0);
  const strikeStr = (strike * 1000).toString().padStart(8, '0');
  
  const symbol = `${ticker.toUpperCase()}${yearStr}${monthStr}${dayStr}${optionType}${strikeStr}`;
  console.log(`[${new Date().toISOString()}] Generated symbol: ${symbol} for strike: ${strike}`);
  return symbol;
}

Deno.serve(async (req) => {
  console.log(`[${new Date().toISOString()}] Received request`);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user profile_id from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      throw new Error('Invalid auth token');
    }

    const { ticker, expiration, type, strikes } = await req.json();
    console.log(`[${new Date().toISOString()}] Input data:`, { ticker, expiration, type, strikes });

    const apiKey = Deno.env.get('MARKETDATA_API_KEY');
    if (!apiKey) {
      throw new Error('MARKETDATA_API_KEY not found');
    }

    // Generate symbols and fetch data for all strikes in parallel
    const [entryData, targetData, protectionData] = await Promise.all([
      (async () => {
        const symbol = generateOptionSymbol(ticker, expiration, type, strikes.entry);
        const marketData = await fetchOptionData(symbol, apiKey);
        return { symbol, marketData };
      })(),
      (async () => {
        const symbol = generateOptionSymbol(ticker, expiration, type, strikes.target);
        const marketData = await fetchOptionData(symbol, apiKey);
        return { symbol, marketData };
      })(),
      (async () => {
        const symbol = generateOptionSymbol(ticker, expiration, type, strikes.protection);
        const marketData = await fetchOptionData(symbol, apiKey);
        return { symbol, marketData };
      })()
    ]);

    // Prepare data for database
    const dbData = {
      profile_id: user.id,
      ticker,
      expiration,
      strike_entry: strikes.entry,
      strike_target: strikes.target,
      strike_protection: strikes.protection,
      // Entry strike data
      ...(entryData.marketData && {
        strike_entry_mid: parseFloat(entryData.marketData.mid),
        strike_entry_open_interest: entryData.marketData.openInterest,
        strike_entry_iv: entryData.marketData.iv,
        strike_entry_delta: parseFloat(entryData.marketData.delta),
        strike_entry_intrinsic_value: parseFloat(entryData.marketData.intrinsicValue),
        strike_entry_extrinsic_value: parseFloat(entryData.marketData.extrinsicValue),
      }),
      // Target strike data
      ...(targetData.marketData && {
        strike_target_mid: parseFloat(targetData.marketData.mid),
        strike_target_open_interest: targetData.marketData.openInterest,
        strike_target_iv: targetData.marketData.iv,
        strike_target_delta: parseFloat(targetData.marketData.delta),
        strike_target_intrinsic_value: parseFloat(targetData.marketData.intrinsicValue),
        strike_target_extrinsic_value: parseFloat(targetData.marketData.extrinsicValue),
      }),
      // Protection strike data
      ...(protectionData.marketData && {
        strike_protection_mid: parseFloat(protectionData.marketData.mid),
        strike_protection_open_interest: protectionData.marketData.openInterest,
        strike_protection_iv: protectionData.marketData.iv,
        strike_protection_delta: parseFloat(protectionData.marketData.delta),
        strike_protection_intrinsic_value: parseFloat(protectionData.marketData.intrinsicValue),
        strike_protection_extrinsic_value: parseFloat(protectionData.marketData.extrinsicValue),
      }),
    };

    console.log(`[${new Date().toISOString()}] Attempting to upsert data:`, dbData);

    // Upsert data into diy_notes table
    const { error: dbError } = await supabase
      .from('diy_notes')
      .upsert(dbData, {
        onConflict: 'profile_id,ticker,expiration',
      });

    if (dbError) {
      console.error(`[${new Date().toISOString()}] Database error:`, dbError);
      throw dbError;
    }

    console.log(`[${new Date().toISOString()}] Data successfully stored in database`);

    return new Response(
      JSON.stringify({
        entry: entryData,
        target: targetData,
        protection: protectionData,
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in fetch_ticker_data:`, error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack,
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});