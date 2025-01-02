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
    const { ticker } = await req.json();
    console.log(`[${new Date().toISOString()}] Input ticker: ${ticker}`);

    // Generate symbol (placeholder implementation)
    const symbol = ticker.toUpperCase();
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
