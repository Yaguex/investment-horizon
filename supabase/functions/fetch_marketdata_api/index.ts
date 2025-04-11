
import { corsHeaders } from './utils.ts';
import { fetchOptionData } from './marketData.ts';
import { generateOptionSymbol } from './utils.ts';
import { StrikeRequest, StrikeResponse, ErrorType } from './types.ts';

console.log(`[${new Date().toISOString()}] Fetch marketdata API function initialized`);

// Generate a unique transaction ID for tracing requests
function generateTransactionId(): string {
  return `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Helper function to add delay between API calls
async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Calculate exponential backoff delay
function calculateBackoff(attempt: number, baseDelay: number = 2000, maxDelay: number = 30000): number {
  const exponentialDelay = Math.min(maxDelay, baseDelay * Math.pow(2, attempt));
  // Add some jitter to avoid thundering herd problem
  return exponentialDelay + (Math.random() * 1000);
}

async function processStrike(strike: StrikeRequest, transactionId: string, maxRetries: number = 2): Promise<StrikeResponse> {
  console.log(`[${new Date().toISOString()}] [processStrike] [TXN:${transactionId}] Processing strike request:`, strike);
  
  try {
    // Validate strike request
    if (!strike.ticker || !strike.expiration || !strike.type || strike.strike === undefined) {
      console.error(`[${new Date().toISOString()}] [processStrike] [TXN:${transactionId}] Invalid strike request - missing required fields`, strike);
      return {
        symbol: "INVALID",
        marketData: null,
        error: {
          type: ErrorType.VALIDATION_ERROR,
          message: 'Invalid strike request - missing required fields',
          retryable: false
        }
      };
    }
    
    console.log(`[${new Date().toISOString()}] [processStrike] [TXN:${transactionId}] Generating symbol for ${strike.ticker} ${strike.type} at strike ${strike.strike}`);
    const symbol = generateOptionSymbol(
      strike.ticker,
      strike.expiration,
      strike.type === 'call' ? 'C' : 'P',
      strike.strike
    );
    console.log(`[${new Date().toISOString()}] [processStrike] [TXN:${transactionId}] Generated symbol ${symbol} for ${strike.ticker} ${strike.type} at strike ${strike.strike}`);

    // Retry logic with exponential backoff
    let attempts = 0;
    let lastError = null;
    
    while (attempts <= maxRetries) {
      if (attempts > 0) {
        const backoffDelay = calculateBackoff(attempts);
        console.log(`[${new Date().toISOString()}] [processStrike] [TXN:${transactionId}] Retry attempt ${attempts}/${maxRetries} for ${symbol} after ${backoffDelay}ms delay`);
        await delay(backoffDelay);
      }
      
      console.log(`[${new Date().toISOString()}] [processStrike] [TXN:${transactionId}] Calling fetchOptionData for symbol ${symbol} (attempt ${attempts + 1}/${maxRetries + 1})`);
      const result = await fetchOptionData(symbol, transactionId);
      
      // If successful or non-retryable error, return immediately
      if (result.data || (result.error && !result.error.retryable)) {
        if (result.data) {
          console.log(`[${new Date().toISOString()}] [processStrike] [TXN:${transactionId}] Successfully retrieved market data for ${symbol}`);
          // Log a sampling of key marketData values
          console.log(`[${new Date().toISOString()}] [processStrike] [TXN:${transactionId}] Market data highlights for ${symbol}: mid=${result.data.mid}, iv=${result.data.iv}, delta=${result.data.delta}, underlyingPrice=${result.data.underlyingPrice}`);
          return { symbol, marketData: result.data };
        } else {
          console.warn(`[${new Date().toISOString()}] [processStrike] [TXN:${transactionId}] Non-retryable error for ${symbol}: ${result.error?.type} - ${result.error?.message}`);
          return { symbol, marketData: null, error: result.error };
        }
      }
      
      // Store the error for potential retry or final return
      lastError = result.error;
      console.warn(`[${new Date().toISOString()}] [processStrike] [TXN:${transactionId}] Retryable error for ${symbol}: ${lastError?.type} - ${lastError?.message}`);
      
      attempts++;
    }
    
    // If we've exhausted retries, return the last error
    console.error(`[${new Date().toISOString()}] [processStrike] [TXN:${transactionId}] Exhausted all ${maxRetries + 1} attempts for ${symbol}`);
    return { symbol, marketData: null, error: lastError };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [processStrike] [TXN:${transactionId}] Unhandled error processing strike:`, error);
    return { 
      symbol: strike.ticker || "ERROR", 
      marketData: null,
      error: {
        type: ErrorType.UNKNOWN_ERROR,
        message: error.message || 'Unhandled error in processStrike',
        retryable: false
      }
    };
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
      return new Response(
        JSON.stringify({ 
          error: "Invalid request: strikes array is required",
          transactionId 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Log individual strike details
    strikes.forEach((strike, index) => {
      console.log(`[${new Date().toISOString()}] [fetch_marketdata_api] [TXN:${transactionId}] Strike #${index + 1}: ticker=${strike.ticker}, expiration=${strike.expiration}, type=${strike.type}, strike=${strike.strike}`);
    });

    // Process strikes sequentially with a delay between requests
    // This helps prevent rate limiting by not making all requests simultaneously
    const DELAY_BETWEEN_REQUESTS = 2000; // Increased from 500ms to 2000ms
    console.log(`[${new Date().toISOString()}] [fetch_marketdata_api] [TXN:${transactionId}] Starting to process ${strikes.length} strikes with ${DELAY_BETWEEN_REQUESTS}ms delay between requests`);
    
    const responses: StrikeResponse[] = [];
    
    for (let i = 0; i < strikes.length; i++) {
      console.log(`[${new Date().toISOString()}] [fetch_marketdata_api] [TXN:${transactionId}] Processing strike ${i + 1}/${strikes.length}`);
      const response = await processStrike(strikes[i], transactionId);
      responses.push(response);
      
      // Add delay between requests (except after the last one)
      if (i < strikes.length - 1) {
        console.log(`[${new Date().toISOString()}] [fetch_marketdata_api] [TXN:${transactionId}] Adding delay of ${DELAY_BETWEEN_REQUESTS}ms before next request`);
        await delay(DELAY_BETWEEN_REQUESTS);
      }
    }
    
    console.log(`[${new Date().toISOString()}] [fetch_marketdata_api] [TXN:${transactionId}] Finished processing ${strikes.length} strikes`);

    // Check for critical errors (completely failed requests)
    const criticalErrors = responses.filter(response => 
      response.error && 
      (response.error.type === ErrorType.VALIDATION_ERROR || 
       response.error.type === ErrorType.UNKNOWN_ERROR)
    );
    
    if (criticalErrors.length > 0) {
      console.error(`[${new Date().toISOString()}] [fetch_marketdata_api] [TXN:${transactionId}] Critical errors: ${criticalErrors.length} out of ${responses.length} strikes had validation or unknown errors`);
      
      // If all responses had critical errors, return an error response
      if (criticalErrors.length === responses.length) {
        return new Response(
          JSON.stringify({ 
            error: "All requests failed with critical errors", 
            details: criticalErrors.map(r => ({ symbol: r.symbol, error: r.error })),
            transactionId 
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Check for API errors (retryable errors that still failed after retries)
    const apiErrors = responses.filter(response => 
      response.error && 
      response.error.type !== ErrorType.VALIDATION_ERROR && 
      response.error.type !== ErrorType.UNKNOWN_ERROR
    );
    
    if (apiErrors.length > 0) {
      console.warn(`[${new Date().toISOString()}] [fetch_marketdata_api] [TXN:${transactionId}] API errors: ${apiErrors.length} out of ${responses.length} strikes had API errors after retries`);
    }

    // Check for null marketData in responses that didn't have errors
    const nullMarketDataResponses = responses.filter(response => !response.error && response.marketData === null);
    if (nullMarketDataResponses.length > 0) {
      console.warn(`[${new Date().toISOString()}] [fetch_marketdata_api] [TXN:${transactionId}] Warning: ${nullMarketDataResponses.length} out of ${responses.length} strikes returned null marketData without errors`);
    }

    // Count successful responses (those with marketData)
    const successfulResponses = responses.filter(response => response.marketData !== null);
    console.log(`[${new Date().toISOString()}] [fetch_marketdata_api] [TXN:${transactionId}] Successfully processed ${successfulResponses.length}/${responses.length} strikes`);
    
    // Return all responses, including those with errors
    // This allows the client to handle partial failures
    return new Response(
      JSON.stringify({ 
        responses: responses,
        successCount: successfulResponses.length,
        errorCount: responses.length - successfulResponses.length,
        transactionId 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error(`[${new Date().toISOString()}] [fetch_marketdata_api] [TXN:${transactionId}] Unhandled error:`, error);
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
