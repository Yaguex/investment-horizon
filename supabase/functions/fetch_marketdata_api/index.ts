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
  console.log(`[${new Date().toISOString()}] Processing symbol ${symbol}`);

  const marketData = await fetchOptionData(symbol);
  return { symbol, marketData };
}

async function processStrikeWithRetry(strike: StrikeRequest, retryAttempts = 3): Promise<StrikeResponse | null> {
  for (let attempt = 1; attempt <= retryAttempts; attempt++) {
    try {
      console.log(`[${new Date().toISOString()}] Attempt ${attempt} for strike:`, strike);
      const result = await processStrike(strike);
      
      if (result && result.marketData) {
        console.log(`[${new Date().toISOString()}] Successfully processed strike on attempt ${attempt}`);
        return result;
      }
      
      console.log(`[${new Date().toISOString()}] No market data returned on attempt ${attempt}`);
      
      if (attempt === retryAttempts) {
        console.error(`[${new Date().toISOString()}] All retry attempts exhausted for strike:`, strike);
        return null;
      }
      
      // Wait 1 second before next attempt
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error on attempt ${attempt}:`, error);
      
      if (attempt === retryAttempts) {
        console.error(`[${new Date().toISOString()}] All retry attempts failed for strike:`, strike);
        return null;
      }
      
      // Wait 1 second before next attempt
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return null;
}

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

    // Process all strikes with retry logic
    const responses = await Promise.all(
      strikes.map(strike => processStrikeWithRetry(strike))
    );

    // Check if any strike processing failed completely
    if (responses.some(response => response === null)) {
      console.error(`[${new Date().toISOString()}] API failure: Some strikes could not be processed after all retries`);
      return new Response(
        JSON.stringify({ error: "API failure" }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`[${new Date().toISOString()}] Successfully processed ${responses.length} strikes`);
    
    return new Response(
      JSON.stringify({ responses: responses.filter(Boolean) }),
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