import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchOptionData(symbol: string, apiKey: string, retries = 3): Promise<any> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`https://api.marketdata.app/v1/options/quotes/${symbol}/`, {
        headers: {
          'Authorization': `Token ${apiKey}`,
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.data && data.data.length > 0) {
        return data.data[0];
      }
      return null;
    } catch (error) {
      if (attempt === retries) {
        console.error(`Failed to fetch data after ${retries} attempts:`, error);
        return null;
      }
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

    // Generate option symbol (placeholder implementation)
    // Format: SPY260116C00585000
    const expirationDate = new Date(expiration);
    const year = expirationDate.getFullYear().toString().slice(-2);
    const month = (expirationDate.getMonth() + 1).toString().padStart(2, '0');
    const day = expirationDate.getDate().toString().padStart(2, '0');
    const optionType = type.toUpperCase().charAt(0);
    const strikeStr = (strike * 1000).toString().padStart(8, '0');
    
    const symbol = `${ticker.toUpperCase()}${year}${month}${day}${optionType}${strikeStr}`;
    console.log(`[${new Date().toISOString()}] Generated symbol: ${symbol}`);

    // Fetch market data
    const apiKey = Deno.env.get('MARKETDATA_API_KEY');
    if (!apiKey) {
      throw new Error('MARKETDATA_API_KEY not found');
    }

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