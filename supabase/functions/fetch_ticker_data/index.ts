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

Deno.serve(async (req) => {
  console.log(`[${new Date().toISOString()}] Received request`);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ticker, expiration, type, strike } = await req.json();
    console.log(`[${new Date().toISOString()}] Input data:`, { ticker, expiration, type, strike });

    // Parse the date string (DD-MM-YYYY) into parts
    const [day, month, year] = expiration.split('-').map(Number);
    console.log(`[${new Date().toISOString()}] Parsed date parts:`, { day, month, year });

    // Format the date parts for the symbol
    const yearStr = year.toString().slice(-2);
    const monthStr = month.toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    
    // Generate option symbol (Format: SPY260116C00585000)
    const optionType = type.toUpperCase().charAt(0);
    const strikeStr = (strike * 1000).toString().padStart(8, '0');
    
    const symbol = `${ticker.toUpperCase()}${yearStr}${monthStr}${dayStr}${optionType}${strikeStr}`;
    console.log(`[${new Date().toISOString()}] Generated symbol: ${symbol}`);

    // Fetch market data
    const apiKey = Deno.env.get('MARKETDATA_API_KEY');
    if (!apiKey) {
      throw new Error('MARKETDATA_API_KEY not found');
    }
    console.log(`[${new Date().toISOString()}] API Key found, length:`, apiKey.length);

    const marketData = await fetchOptionData(symbol, apiKey);
    console.log(`[${new Date().toISOString()}] Market data:`, marketData);

    return new Response(
      JSON.stringify({ 
        success: true,
        symbol,
        marketData: marketData ? {
          mid: marketData.mid,
          openInterest: marketData.openInterest,
          iv: marketData.iv,
          delta: marketData.delta,
          intrinsicValue: marketData.intrinsicValue,
          extrinsicValue: marketData.extrinsicValue
        } : null,
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