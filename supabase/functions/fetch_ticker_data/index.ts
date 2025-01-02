import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  console.log(`[${new Date().toISOString()}] Received request`);

  // Handle CORS preflight requests
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

    return new Response(
      JSON.stringify({ 
        success: true,
        symbol,
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