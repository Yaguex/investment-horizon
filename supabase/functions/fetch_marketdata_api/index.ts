
import { corsHeaders } from './utils.ts';
import { fetchOptionData } from './marketData.ts';
import { generateOptionSymbol } from './utils.ts';
import { StrikeRequest, StrikeResponse } from './types.ts';

console.log(`[${new Date().toISOString()}] Fetch marketdata API function initialized`);

// Function to log events with transaction ID and save to database if needed
async function logWithTransaction(supabase: any, txId: string, message: string, data?: any, level: string = 'info') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [TxID: ${txId}] ${message}`);
  if (data) {
    console.log(`[${timestamp}] [TxID: ${txId}] Data:`, data);
  }
  
  // If supabase client is available, save to log_error table
  if (supabase) {
    try {
      const { error } = await supabase
        .from('log_error')
        .insert([{ 
          level,
          id_1: txId,
          function_id: 'fetch_marketdata_api',
          event_message: message,
          event_type: 'api_request',
          timestamp: timestamp
        }]);
      
      if (error) {
        console.error(`[${timestamp}] Error saving log to database:`, error);
      }
    } catch (e) {
      console.error(`[${timestamp}] Exception saving log to database:`, e);
    }
  }
  
  return { timestamp, message, data };
}

async function processStrike(strike: StrikeRequest, txId: string, supabase: any): Promise<StrikeResponse | null> {
  await logWithTransaction(supabase, txId, `[processStrike] Processing strike request`, strike);
  
  try {
    // Validate strike request
    if (!strike.ticker || !strike.expiration || !strike.type || strike.strike === undefined) {
      const errorMsg = `Invalid strike request - missing required fields`;
      await logWithTransaction(supabase, txId, `[processStrike] ${errorMsg}`, strike, 'error');
      throw new Error(errorMsg);
    }
    
    const symbol = generateOptionSymbol(
      strike.ticker,
      strike.expiration,
      strike.type === 'call' ? 'C' : 'P',
      strike.strike
    );
    await logWithTransaction(supabase, txId, `[processStrike] Processing symbol ${symbol} for ${strike.ticker} ${strike.type} at strike ${strike.strike}`);

    const startTime = Date.now();
    const marketData = await fetchOptionData(symbol, txId, supabase);
    const duration = Date.now() - startTime;
    
    if (!marketData) {
      await logWithTransaction(supabase, txId, `[processStrike] No market data returned for symbol ${symbol} after ${duration}ms`, null, 'warn');
    } else {
      await logWithTransaction(supabase, txId, `[processStrike] Successfully retrieved market data for ${symbol} in ${duration}ms`, { 
        mid: marketData.mid,
        iv: marketData.iv,
        delta: marketData.delta,
        underlyingPrice: marketData.underlyingPrice
      });
    }
    
    return { symbol, marketData };
  } catch (error) {
    await logWithTransaction(supabase, txId, `[processStrike] Error processing strike: ${error.message}`, error, 'error');
    // Instead of returning null which hides the error, propagate it
    throw error;
  }
}

Deno.serve(async (req) => {
  // Default transaction ID if none provided
  let txId = `fx-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  let supabaseClient = null;
  
  console.log(`[${new Date().toISOString()}] [fetch_marketdata_api] Received request: ${req.method} ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`[${new Date().toISOString()}] [fetch_marketdata_api] Handling OPTIONS request for CORS`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client for logging to database
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (supabaseUrl && supabaseKey) {
      // Using dynamic import to avoid TypeScript errors
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.39.3');
      supabaseClient = createClient(supabaseUrl, supabaseKey);
    }
    
    const startTime = Date.now();
    const requestBody = await req.json();
    
    // Extract transaction ID if provided from parent function
    if (requestBody.txId) {
      txId = requestBody.txId;
      await logWithTransaction(supabaseClient, txId, `[fetch_marketdata_api] Using transaction ID from parent function: ${txId}`);
    } else {
      await logWithTransaction(supabaseClient, txId, `[fetch_marketdata_api] Generated new transaction ID: ${txId}`);
    }
    
    await logWithTransaction(supabaseClient, txId, `[fetch_marketdata_api] Request body parsed in ${Date.now() - startTime}ms`);
    
    const { strikes } = requestBody as { strikes: StrikeRequest[] };
    await logWithTransaction(supabaseClient, txId, `[fetch_marketdata_api] Received request for ${strikes?.length || 0} strikes`, 
      strikes?.map(s => ({ticker: s.ticker, type: s.type, strike: s.strike})));

    if (!strikes || !Array.isArray(strikes) || strikes.length === 0) {
      const errorMsg = `Invalid request: strikes array is required`;
      await logWithTransaction(supabaseClient, txId, errorMsg, null, 'error');
      throw new Error(errorMsg);
    }

    // Log individual strike details
    for (const [index, strike] of strikes.entries()) {
      await logWithTransaction(supabaseClient, txId, `[fetch_marketdata_api] Strike #${index + 1}: ticker=${strike.ticker}, expiration=${strike.expiration}, type=${strike.type}, strike=${strike.strike}`);
    }

    // Process all strikes
    await logWithTransaction(supabaseClient, txId, `[fetch_marketdata_api] Starting to process ${strikes.length} strikes`);
    const responsePromises = strikes.map(strike => processStrike(strike, txId, supabaseClient));
    const responses = await Promise.all(
      responsePromises.map(promise => 
        promise.catch(error => {
          console.error(`[${new Date().toISOString()}] [TxID: ${txId}] [fetch_marketdata_api] Strike processing error: ${error.message}`);
          return null;
        })
      )
    );
    await logWithTransaction(supabaseClient, txId, `[fetch_marketdata_api] Finished processing ${strikes.length} strikes in ${Date.now() - startTime}ms`);

    // Check if any strike processing failed completely
    const failedResponses = responses.filter(response => response === null);
    if (failedResponses.length > 0) {
      const errorMsg = `API failure: ${failedResponses.length} out of ${responses.length} strikes could not be processed`;
      await logWithTransaction(supabaseClient, txId, errorMsg, { failedCount: failedResponses.length, totalCount: responses.length }, 'error');
      return new Response(
        JSON.stringify({ error: "API failure", failedCount: failedResponses.length, totalCount: responses.length, txId }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check for null marketData in responses
    const nullMarketDataResponses = responses.filter(response => response !== null && response.marketData === null);
    if (nullMarketDataResponses.length > 0) {
      await logWithTransaction(supabaseClient, txId, `[fetch_marketdata_api] Warning: ${nullMarketDataResponses.length} out of ${responses.length} strikes returned null marketData`, 
        { symbols: nullMarketDataResponses.map(r => r?.symbol) }, 'warn');
    }

    await logWithTransaction(supabaseClient, txId, `[fetch_marketdata_api] Successfully processed ${responses.length} strikes in ${Date.now() - startTime}ms`);
    
    return new Response(
      JSON.stringify({ 
        responses: responses.filter(Boolean),
        txId,
        processingTime: Date.now() - startTime 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    await logWithTransaction(supabaseClient, txId, `[fetch_marketdata_api] Error: ${error.message}`, error, 'error');
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack, txId }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
