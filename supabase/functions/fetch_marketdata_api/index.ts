
import { corsHeaders } from './utils.ts';
import { fetchOptionData } from './marketData.ts';
import { generateOptionSymbol } from './utils.ts';
import { StrikeRequest, StrikeResponse } from './types.ts';

console.log(`[${new Date().toISOString()}] Fetch marketdata API function initialized`);

async function processStrike(strike: StrikeRequest): Promise<StrikeResponse | null> {
  console.log(`[${new Date().toISOString()}] [processStrike] Processing strike request:`, strike);
  
  try {
    // Validate strike request
    if (!strike.ticker || !strike.expiration || !strike.type || strike.strike === undefined) {
      console.error(`[${new Date().toISOString()}] [processStrike] Invalid strike request - missing required fields`, strike);
      throw new Error('Invalid strike request - missing required fields');
    }
    
    const symbol = generateOptionSymbol(
      strike.ticker,
      strike.expiration,
      strike.type === 'call' ? 'C' : 'P',
      strike.strike
    );
    console.log(`[${new Date().toISOString()}] [processStrike] Processing symbol ${symbol} for ${strike.ticker} ${strike.type} at strike ${strike.strike}`);

    const marketData = await fetchOptionData(symbol);
    
    if (!marketData) {
      console.warn(`[${new Date().toISOString()}] [processStrike] No market data returned for symbol ${symbol}`);
    } else {
      console.log(`[${new Date().toISOString()}] [processStrike] Successfully retrieved market data for ${symbol}`);
      // Log a sampling of key marketData values
      console.log(`[${new Date().toISOString()}] [processStrike] Market data highlights for ${symbol}: mid=${marketData.mid}, iv=${marketData.iv}, delta=${marketData.delta}, underlyingPrice=${marketData.underlyingPrice}`);
    }
    
    return { symbol, marketData };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [processStrike] Error processing strike:`, error);
    // Instead of returning null which hides the error, propagate it
    throw error;
  }
}

Deno.serve(async (req) => {
  console.log(`[${new Date().toISOString()}] [fetch_marketdata_api] Received request: ${req.method} ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`[${new Date().toISOString()}] [fetch_marketdata_api] Handling OPTIONS request for CORS`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();
    const requestBody = await req.json();
    console.log(`[${new Date().toISOString()}] [fetch_marketdata_api] Request body parsed in ${Date.now() - startTime}ms`);
    
    const { strikes } = requestBody as { strikes: StrikeRequest[] };
    console.log(`[${new Date().toISOString()}] [fetch_marketdata_api] Received request for ${strikes?.length || 0} strikes:`, strikes);

    if (!strikes || !Array.isArray(strikes) || strikes.length === 0) {
      console.error(`[${new Date().toISOString()}] [fetch_marketdata_api] Invalid request: strikes array is required`);
      throw new Error('Invalid request: strikes array is required');
    }

    // Log individual strike details
    strikes.forEach((strike, index) => {
      console.log(`[${new Date().toISOString()}] [fetch_marketdata_api] Strike #${index + 1}: ticker=${strike.ticker}, expiration=${strike.expiration}, type=${strike.type}, strike=${strike.strike}`);
    });

    // Process all strikes
    console.log(`[${new Date().toISOString()}] [fetch_marketdata_api] Starting to process ${strikes.length} strikes`);
    const responsePromises = strikes.map(strike => processStrike(strike));
    const responses = await Promise.all(
      responsePromises.map(promise => 
        promise.catch(error => {
          console.error(`[${new Date().toISOString()}] [fetch_marketdata_api] Strike processing error:`, error);
          return null;
        })
      )
    );
    console.log(`[${new Date().toISOString()}] [fetch_marketdata_api] Finished processing ${strikes.length} strikes`);

    // Check if any strike processing failed completely
    const failedResponses = responses.filter(response => response === null);
    if (failedResponses.length > 0) {
      console.error(`[${new Date().toISOString()}] [fetch_marketdata_api] API failure: ${failedResponses.length} out of ${responses.length} strikes could not be processed`);
      return new Response(
        JSON.stringify({ error: "API failure", failedCount: failedResponses.length, totalCount: responses.length }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check for null marketData in responses
    const nullMarketDataResponses = responses.filter(response => response !== null && response.marketData === null);
    if (nullMarketDataResponses.length > 0) {
      console.warn(`[${new Date().toISOString()}] [fetch_marketdata_api] Warning: ${nullMarketDataResponses.length} out of ${responses.length} strikes returned null marketData`);
      nullMarketDataResponses.forEach(response => {
        console.warn(`[${new Date().toISOString()}] [fetch_marketdata_api] Null marketData for symbol: ${response?.symbol}`);
      });
    }

    console.log(`[${new Date().toISOString()}] [fetch_marketdata_api] Successfully processed ${responses.length} strikes`);
    
    return new Response(
      JSON.stringify({ responses: responses.filter(Boolean) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error(`[${new Date().toISOString()}] [fetch_marketdata_api] Error:`, error);
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
