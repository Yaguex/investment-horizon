
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

export async function fetchOptionData(symbol: string): Promise<MarketData | null> {
  const apiKey = Deno.env.get('MARKETDATA_API_KEY');
  if (!apiKey) {
    console.error(`[${new Date().toISOString()}] [fetchOptionData] CRITICAL ERROR: MARKETDATA_API_KEY not found in environment variables`);
    throw new Error('MARKETDATA_API_KEY not found in environment variables');
  } else {
    console.log(`[${new Date().toISOString()}] [fetchOptionData] API key is configured (length: ${apiKey.length})`);
  }

  const url = `https://api.marketdata.app/v1/options/quotes/${symbol}/`;
  console.log(`[${new Date().toISOString()}] [fetchOptionData] Making request to MarketData API for symbol: ${symbol}`);
  console.log(`[${new Date().toISOString()}] [fetchOptionData] Request URL: ${url}`);
  
  const startTime = Date.now();
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Token ${apiKey}`,
      }
    });
    const endTime = Date.now();
    console.log(`[${new Date().toISOString()}] [fetchOptionData] API Response time: ${endTime - startTime}ms for symbol: ${symbol}`);
    
    // Log rate limit information from headers if available
    const rateLimitLimit = response.headers.get('X-RateLimit-Limit');
    const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
    const rateLimitReset = response.headers.get('X-RateLimit-Reset');
    
    if (rateLimitLimit && rateLimitRemaining && rateLimitReset) {
      console.log(`[${new Date().toISOString()}] [fetchOptionData] Rate limit info - Limit: ${rateLimitLimit}, Remaining: ${rateLimitRemaining}, Reset: ${rateLimitReset}`);
    }
    
    if (!response.ok) {
      console.error(`[${new Date().toISOString()}] [fetchOptionData] HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
      
      // Try to get more information about the error
      try {
        const errorBody = await response.text();
        console.error(`[${new Date().toISOString()}] [fetchOptionData] Error response body: ${errorBody}`);
      } catch (e) {
        console.error(`[${new Date().toISOString()}] [fetchOptionData] Could not read error response body: ${e}`);
      }
      
      // Classify error type based on status code
      if (response.status === 429) {
        console.error(`[${new Date().toISOString()}] [fetchOptionData] Rate limit exceeded for MarketData API`);
      } else if (response.status >= 500) {
        console.error(`[${new Date().toISOString()}] [fetchOptionData] MarketData API server error`);
      } else if (response.status === 401 || response.status === 403) {
        console.error(`[${new Date().toISOString()}] [fetchOptionData] Authentication error with MarketData API - check API key`);
      } else if (response.status === 404) {
        console.error(`[${new Date().toISOString()}] [fetchOptionData] Symbol not found in MarketData API: ${symbol}`);
      }
      
      return null;
    }

    const data = await response.json();
    console.log(`[${new Date().toISOString()}] [fetchOptionData] API Response for ${symbol}:`, data);
    
    // Validate response structure
    if (!data) {
      console.error(`[${new Date().toISOString()}] [fetchOptionData] API returned empty or null response`);
      return null;
    }
    
    if (data.s !== 'ok') {
      console.error(`[${new Date().toISOString()}] [fetchOptionData] API returned non-OK status:`, data.s);
      console.error(`[${new Date().toISOString()}] [fetchOptionData] Complete response:`, data);
      return null;
    }
    
    // Check if required fields exist
    const requiredFields = ['mid', 'ask', 'openInterest', 'bid', 'iv', 'delta', 'intrinsicValue', 'extrinsicValue', 'underlyingPrice'];
    const missingFields = requiredFields.filter(field => !data[field] || data[field].length === 0);
    
    if (missingFields.length > 0) {
      console.warn(`[${new Date().toISOString()}] [fetchOptionData] Missing expected fields in API response: ${missingFields.join(', ')}`);
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
      console.warn(`[${new Date().toISOString()}] [fetchOptionData] Null values detected in fields: ${nullFields.join(', ')}`);
    } else {
      console.log(`[${new Date().toISOString()}] [fetchOptionData] Successfully parsed all relevant fields for ${symbol}`);
    }
    
    return marketData;
  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] [fetchOptionData] Error fetching option data for ${symbol}:`, error);
    console.error(`[${new Date().toISOString()}] [fetchOptionData] Error name: ${error.name}, message: ${error.message}`);
    
    if (error.stack) {
      console.error(`[${new Date().toISOString()}] [fetchOptionData] Error stack: ${error.stack}`);
    }
    
    // Try to determine the type of error
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error(`[${new Date().toISOString()}] [fetchOptionData] Network error - unable to reach MarketData API`);
    }
    
    return null;
  }
}
