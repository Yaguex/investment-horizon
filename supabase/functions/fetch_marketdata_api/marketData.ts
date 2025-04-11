
import { MarketData } from './types.ts';

const safeGetArrayValue = (data: any, field: string): number | null => {
  if (!data[field]) {
    return null;
  }
  
  if (!Array.isArray(data[field])) {
    return null;
  }
  
  if (data[field].length === 0) {
    return null;
  }
  
  return Number(data[field][0]);
};

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
}

export async function fetchOptionData(symbol: string, txId: string = 'unknown', supabase: any = null): Promise<MarketData | null> {
  const apiKey = Deno.env.get('MARKETDATA_API_KEY');
  if (!apiKey) {
    await logWithTransaction(supabase, txId, `[fetchOptionData] CRITICAL ERROR: MARKETDATA_API_KEY not found in environment variables`, null, 'error');
    throw new Error('MARKETDATA_API_KEY not found in environment variables');
  } else {
    await logWithTransaction(supabase, txId, `[fetchOptionData] API key is configured (length: ${apiKey.length})`);
  }

  const url = `https://api.marketdata.app/v1/options/quotes/${symbol}/`;
  await logWithTransaction(supabase, txId, `[fetchOptionData] Making request to MarketData API for symbol: ${symbol}`);
  await logWithTransaction(supabase, txId, `[fetchOptionData] Request URL: ${url}`);
  
  const startTime = Date.now();
  let requestSuccess = false;
  let requestStatus = '';
  let responseBody = '';
  
  try {
    await logWithTransaction(supabase, txId, `[fetchOptionData] Starting API fetch for ${symbol}`);
    const response = await fetch(url, {
      headers: {
        'Authorization': `Token ${apiKey}`,
      }
    });
    requestSuccess = true;
    requestStatus = `${response.status} ${response.statusText}`;
    
    const endTime = Date.now();
    await logWithTransaction(supabase, txId, `[fetchOptionData] API Response received: ${requestStatus} in ${endTime - startTime}ms for symbol: ${symbol}`);
    
    // Log rate limit information from headers if available
    const rateLimitLimit = response.headers.get('X-RateLimit-Limit');
    const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
    const rateLimitReset = response.headers.get('X-RateLimit-Reset');
    
    if (rateLimitLimit && rateLimitRemaining && rateLimitReset) {
      await logWithTransaction(supabase, txId, `[fetchOptionData] Rate limit info - Limit: ${rateLimitLimit}, Remaining: ${rateLimitRemaining}, Reset: ${rateLimitReset}`);
    }
    
    if (!response.ok) {
      await logWithTransaction(supabase, txId, `[fetchOptionData] HTTP error! status: ${response.status}, statusText: ${response.statusText}`, null, 'error');
      
      // Try to get more information about the error
      try {
        responseBody = await response.text();
        await logWithTransaction(supabase, txId, `[fetchOptionData] Error response body: ${responseBody}`, null, 'error');
      } catch (e) {
        await logWithTransaction(supabase, txId, `[fetchOptionData] Could not read error response body: ${e}`, null, 'error');
      }
      
      // Classify error type based on status code
      if (response.status === 429) {
        await logWithTransaction(supabase, txId, `[fetchOptionData] Rate limit exceeded for MarketData API`, null, 'error');
      } else if (response.status >= 500) {
        await logWithTransaction(supabase, txId, `[fetchOptionData] MarketData API server error`, null, 'error');
      } else if (response.status === 401 || response.status === 403) {
        await logWithTransaction(supabase, txId, `[fetchOptionData] Authentication error with MarketData API - check API key`, null, 'error');
      } else if (response.status === 404) {
        await logWithTransaction(supabase, txId, `[fetchOptionData] Symbol not found in MarketData API: ${symbol}`, null, 'warn');
      }
      
      return null;
    }

    // Try to parse the response body
    let data;
    try {
      responseBody = await response.text();
      await logWithTransaction(supabase, txId, `[fetchOptionData] Received raw response for ${symbol} (${responseBody.length} chars)`);
      data = JSON.parse(responseBody);
    } catch (parseError) {
      await logWithTransaction(supabase, txId, `[fetchOptionData] Error parsing response JSON: ${parseError.message}`, { responseBody: responseBody.substring(0, 500) }, 'error');
      return null;
    }
    
    await logWithTransaction(supabase, txId, `[fetchOptionData] API Response parsed for ${symbol}`, { 
      status: data?.s,
      hasData: !!data,
      hasMid: Array.isArray(data?.mid) && data.mid.length > 0
    });
    
    // Validate response structure
    if (!data) {
      await logWithTransaction(supabase, txId, `[fetchOptionData] API returned empty or null response`, null, 'error');
      return null;
    }
    
    if (data.s !== 'ok') {
      await logWithTransaction(supabase, txId, `[fetchOptionData] API returned non-OK status: ${data.s}`, data, 'error');
      return null;
    }
    
    // Check if required fields exist
    const requiredFields = ['mid', 'ask', 'openInterest', 'bid', 'iv', 'delta', 'intrinsicValue', 'extrinsicValue', 'underlyingPrice'];
    const missingFields = requiredFields.filter(field => !data[field] || data[field].length === 0);
    
    if (missingFields.length > 0) {
      await logWithTransaction(supabase, txId, `[fetchOptionData] Missing expected fields in API response: ${missingFields.join(', ')}`, null, 'warn');
    }

    // Apply safeGetArrayValue to all fields and return whatever we get
    const marketData = {
      mid: safeGetArrayValue(data, 'mid'),
      ask: safeGetArrayValue(data, 'ask'),
      openInterest: safeGetArrayValue(data, 'openInterest'),
      bid: safeGetArrayValue(data, 'bid'),
      iv: safeGetArrayValue(data, 'iv'),
      delta: safeGetArrayValue(data, 'delta'),
      last: safeGetArrayValue(data, 'last'),
      intrinsicValue: safeGetArrayValue(data, 'intrinsicValue'),
      volume: safeGetArrayValue(data, 'volume'),
      extrinsicValue: safeGetArrayValue(data, 'extrinsicValue'),
      underlyingPrice: safeGetArrayValue(data, 'underlyingPrice'),
      gamma: safeGetArrayValue(data, 'gamma'),
      theta: safeGetArrayValue(data, 'theta'),
      vega: safeGetArrayValue(data, 'vega'),
      rho: safeGetArrayValue(data, 'rho')
    };
    
    // Log nulls to help identify data issues
    const nullFields = Object.entries(marketData)
      .filter(([_, value]) => value === null)
      .map(([key]) => key);
    
    if (nullFields.length > 0) {
      await logWithTransaction(supabase, txId, `[fetchOptionData] Null values detected in fields: ${nullFields.join(', ')}`, null, 'warn');
    } else {
      await logWithTransaction(supabase, txId, `[fetchOptionData] Successfully parsed all relevant fields for ${symbol}`);
    }
    
    return marketData;
  } catch (error: any) {
    const errorDetails = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      requestSuccess,
      requestStatus,
      responseBodyLength: responseBody ? responseBody.length : 0,
      responseBodySample: responseBody ? responseBody.substring(0, 200) : ''
    };
    
    await logWithTransaction(supabase, txId, `[fetchOptionData] Error fetching option data for ${symbol}: ${error.message}`, errorDetails, 'error');
    
    // Try to determine the type of error
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      await logWithTransaction(supabase, txId, `[fetchOptionData] Network error - unable to reach MarketData API`, null, 'error');
    }
    
    return null;
  }
}
