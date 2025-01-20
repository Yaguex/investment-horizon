import { corsHeaders } from './utils.ts';
import { fetchOptionData } from './marketData.ts';
import { generateOptionSymbol } from './utils.ts';
import { StrikeRequest, StrikeResponse } from './types.ts';

console.log("Fetch marketdata API function initialized");

async function processStrike(strike: StrikeRequest): Promise<StrikeResponse | null> {
  const symbol = generateOptionSymbol(
    strike.ticker,
    strike.expiration,
    strike.type === 'call' ? 'C' : 'P',
    strike.strike
  );
  console.log(`Processing symbol ${symbol}`);

  const marketData = await fetchOptionData(symbol);
  return { symbol, marketData };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { strikes } = await req.json() as { strikes: StrikeRequest[] };
    console.log(`Received request for ${strikes.length} strikes:`, strikes);

    if (!strikes || !Array.isArray(strikes) || strikes.length === 0) {
      throw new Error('Invalid request: strikes array is required');
    }

    // Process all strikes
    const responses = await Promise.all(
      strikes.map(strike => processStrike(strike))
    );

    // Check if any strike processing failed completely
    if (responses.some(response => response === null)) {
      console.error('API failure: Some strikes could not be processed');
      return new Response(
        JSON.stringify({ error: "API failure" }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Successfully processed ${responses.length} strikes`);
    
    return new Response(
      JSON.stringify({ responses: responses.filter(Boolean) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});