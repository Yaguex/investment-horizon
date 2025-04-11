
import { corsHeaders } from './utils.ts';
import { fetchOptionData } from './marketData.ts';
import { generateOptionSymbol } from './utils.ts';
import { StrikeRequest, StrikeResponse } from './types.ts';

console.log(`[${new Date().toISOString()}] Fetch marketdata API function initialized`);

// Generate a unique transaction ID for tracing requests
function generateTransactionId(): string {
  return `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Helper function to add delay between API calls
async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function processStrike(strike: StrikeRequest, transactionId: string): Promise<StrikeResponse | null> {
  console.log(`[${new Date().toISOString()}] [processStrike] [TXN:${transactionId}] Processing strike request:`, strike);
  
  try {
    // Validate strike request
    if (!strike.ticker || !strike.expiration || !strike.type || strike.strike === undefined) {
      console.error(`[${new Date().toISOString()}] [processStrike] [TXN:${transactionId}] Invalid strike request - missing required fields`, strike);
      throw new Error('Invalid strike request - missing required fields');
    }
    
    console.log(`[${new Date().toISOString()}] [processStrike] [TXN:${transactionId}] Generating symbol for ${strike.ticker} ${strike.type} at strike ${strike.strike}`);
    const symbol = generateOptionSymbol(
      strike.ticker,
      strike.expiration,
      strike.type === 'call' ? 'C' : 'P',
      strike.strike
    );
    console.log(`[${new Date().toISOString()}] [processStrike] [TXN:${transactionId}] Generated symbol ${symbol} for ${strike.ticker} ${strike.type} at strike ${strike.strike}`);

    console.log(`[${new Date().toISOString()}] [processStrike] [TXN:${transactionId}] Calling fetchOptionData for symbol ${symbol}`);
    const marketData = await fetchOptionData(symbol, transactionId);
    
    if (!marketData) {
      console.warn(`[${new Date().toISOString()}] [processStrike] [TXN:${transactionId}] No market data returned for symbol ${symbol}`);
    } else {
      console.log(`[${new Date().toISOString()}] [processStrike] [TXN:${transactionId}] Successfully retrieved market data for ${symbol}`);
      // Log a sampling of key marketData values
      console.log(`[${new Date().toISOString()}] [processStrike] [TXN:${transactionId}] Market data highlights for ${symbol}: mid=${marketData.mid}, iv=${marketData.iv}, delta=${marketData.delta}, underlyingPrice=${marketData.underlyingPrice}`);
    }
    
    return { symbol, marketData };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [processStrike] [TXN:${transactionId}] Error processing strike:`, error);
    // Instead of returning null which hides the error, propagate it
    throw error;
  }
}

Deno.serve(async (req) => {
  const transactionId = generateTransactionId();
  console.log(`[${new Date().toISOString()}] [fetch_marketdata_api] [TXN:${transactionId}] Received request: ${req.method} ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`[${new Date().toISOString()}] [fetch_marketdata_api] [TXN:${transactionId}] Handling OPTIONS request for CORS`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();
    console.log(`[${new Date().toISOString()}] [fetch_marketdata_api] [TXN:${transactionId}] Starting to parse request body`);
    const requestBody = await req.json();
    console.log(`[${new Date().toISOString()}] [fetch_marketdata_api] [TXN:${transactionId}] Request body parsed in ${Date.now() - startTime}ms`);
    
    const { strikes } = requestBody as { strikes: StrikeRequest[] };
    console.log(`[${new Date().toISOString()}] [fetch_marketdata_api] [TXN:${transactionId}] Received request for ${strikes?.length || 0} strikes:`, strikes);

    if (!strikes || !Array.isArray(strikes) || strikes.length === 0) {
      console.error(`[${new Date().toISOString()}] [fetch_marketdata_api] [TXN:${transactionId}] Invalid request: strikes array is required`);
      throw new Error('Invalid request: strikes array is required');
    }

    // Log individual strike details
    strikes.forEach((strike, index) => {
      console.log(`[${new Date().toISOString()}] [fetch_marketdata_api] [TXN:${transactionId}] Strike #${index + 1}: ticker=${strike.ticker}, expiration=${strike.expiration}, type=${strike.type}, strike=${strike.strike}`);
    });

    // Process strikes sequentially with a delay between requests
    // This helps prevent rate limiting by not making all requests simultaneously
    const DELAY_BETWEEN_REQUESTS = 500; // 500ms delay between requests
    console.log(`[${new Date().toISOString()}] [fetch_marketdata_api] [TXN:${transactionId}] Starting to process ${strikes.length} strikes with ${DELAY_BETWEEN_REQUESTS}ms delay between requests`);
    
    const responses: (StrikeResponse | null)[] = [];
    
    for (let i = 0; i < strikes.length; i++) {
      try {
        console.log(`[${new Date().toISOString()}] [fetch_marketdata_api] [TXN:${transactionId}] Processing strike ${i + 1}/${strikes.length}`);
        const response = await processStrike(strikes[i], transactionId);
        responses.push(response);
        
        // Add delay between requests (except after the last one)
        if (i < strikes.length - 1) {
          console.log(`[${new Date().toISOString()}] [fetch_marketdata_api] [TXN:${transactionId}] Adding delay of ${DELAY_BETWEEN_REQUESTS}ms before next request`);
          await delay(DELAY_BETWEEN_REQUESTS);
        }
      } catch (error) {
        console.error(`[${new Date().toISOString()}] [fetch_marketdata_api] [TXN:${transactionId}] Error processing strike ${i + 1}:`, error);
        responses.push(null);
      }
    }
    
    console.log(`[${new Date().toISOString()}] [fetch_marketdata_api] [TXN:${transactionId}] Finished processing ${strikes.length} strikes`);

    // Check if any strike processing failed completely
    const failedResponses = responses.filter(response => response === null);
    if (failedResponses.length > 0) {
      console.error(`[${new Date().toISOString()}] [fetch_marketdata_api] [TXN:${transactionId}] API failure: ${failedResponses.length} out of ${responses.length} strikes could not be processed`);
      return new Response(
        JSON.stringify({ 
          error: "API failure", 
          failedCount: failedResponses.length, 
          totalCount: responses.length,
          transactionId 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check for null marketData in responses
    const nullMarketDataResponses = responses.filter(response => response !== null && response.marketData === null);
    if (nullMarketDataResponses.length > 0) {
      console.warn(`[${new Date().toISOString()}] [fetch_marketdata_api] [TXN:${transactionId}] Warning: ${nullMarketDataResponses.length} out of ${responses.length} strikes returned null marketData`);
      nullMarketDataResponses.forEach(response => {
        console.warn(`[${new Date().toISOString()}] [fetch_marketdata_api] [TXN:${transactionId}] Null marketData for symbol: ${response?.symbol}`);
      });
    }

    console.log(`[${new Date().toISOString()}] [fetch_marketdata_api] [TXN:${transactionId}] Successfully processed ${responses.length} strikes`);
    
    // Include transaction ID in the response for tracking
    return new Response(
      JSON.stringify({ 
        responses: responses.filter(Boolean),
        transactionId 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error(`[${new Date().toISOString()}] [fetch_marketdata_api] [TXN:${transactionId}] Error:`, error);
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        stack: error.stack,
        transactionId 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
