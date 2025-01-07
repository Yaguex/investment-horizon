import { corsHeaders } from './utils.ts';
import { fetchOptionData } from './marketData.ts';
import { generateOptionSymbol } from './utils.ts';
import { StrikeRequest, StrikeResponse } from './types.ts';

console.log("Fetch marketdata API function initialized");

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { strikes } = await req.json() as { strikes: StrikeRequest[] };
    console.log(`[${new Date().toISOString()}] Received request for ${strikes.length} strikes:`, strikes);

    if (!strikes || !Array.isArray(strikes) || strikes.length === 0) {
      throw new Error('Invalid request: strikes array is required');
    }

    // Process all strikes in parallel
    const responses: StrikeResponse[] = await Promise.all(
      strikes.map(async (strike): Promise<StrikeResponse> => {
        const symbol = generateOptionSymbol(
          strike.ticker,
          strike.expiration,
          strike.type === 'call' ? 'C' : 'P',
          strike.strike
        );
        console.log(`[${new Date().toISOString()}] Generated symbol: ${symbol} for strike:`, strike);

        const marketData = await fetchOptionData(symbol);
        return { symbol, marketData };
      })
    );

    console.log(`[${new Date().toISOString()}] Processed ${responses.length} strikes successfully`);
    
    return new Response(
      JSON.stringify({ responses }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error:`, error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});