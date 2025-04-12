
import { MarketData, ErrorType, APIError } from './types.ts';

const REQUEST_TIMEOUT = 10000; // 10 seconds timeout

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

// Implement fetch with timeout
async function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// Function to classify errors and create structured error objects
function classifyError(error: any, status?: number): APIError {
  // Network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return {
      type: ErrorType.NETWORK_ERROR,
      message: 'Network error - unable to reach MarketData API',
      retryable: true
    };
  }
  
  // Timeout errors
  if (error.name === 'AbortError') {
    return {
      type: ErrorType.TIMEOUT_ERROR,
      message: 'Request timed out after ' + REQUEST_TIMEOUT + 'ms',
      retryable: true
    };
  }
  
  // Handle HTTP status based errors
  if (status) {
    if (status === 429) {
      return {
        type: ErrorType.RATE_LIMIT_ERROR,
        status,
        message: 'Rate limit exceeded for MarketData API',
        retryable: true
      };
    }
    
    if (status === 404) {
      return {
        type: ErrorType.NOT_FOUND_ERROR,
        status,
        message: 'Symbol not found in MarketData API',
        retryable: false
      };
    }
    
    if (status === 401 || status === 403) {
      return {
        type: ErrorType.API_ERROR,
        status,
        message: 'Authentication error with MarketData API - check API key',
        retryable: false
      };
    }
    
    if (status >= 500) {
      return {
        type: ErrorType.API_ERROR,
        status,
        message: 'MarketData API server error',
        retryable: true
      };
    }
    
    return {
      type: ErrorType.API_ERROR,
      status,
      message: `HTTP error ${status}`,
      retryable: status >= 500 // Only server errors are retryable
    };
  }
  
  // Default case - unknown error
  return {
    type: ErrorType.UNKNOWN_ERROR,
    message: error.message || 'Unknown error occurred',
    retryable: true
  };
}

export async function fetchOptionData(symbol: string, transactionId?: string): Promise<{ data: MarketData | null, error: APIError | null }> {
  const apiKey = Deno.env.get('MARKETDATA_API_KEY');
  if (!apiKey) {
    console.error(`[${new Date().toISOString()}] [fetchOptionData] [TXN:${transactionId || 'NOTX'}] CRITICAL ERROR: MARKETDATA_API_KEY not found in environment variables`);
    return {
      data: null,
      error: {
        type: ErrorType.VALIDATION_ERROR,
        message: 'MARKETDATA_API_KEY not found in environment variables',
        retryable: false
      }
    };
  } else {
    console.log(`[${new Date().toISOString()}] [fetchOptionData] [TXN:${transactionId || 'NOTX'}] API key is configured (length: ${apiKey.length})`);
  }

  const url = `https://api.marketdata.app/v1/options/quotes/${symbol}/`;
  console.log(`[${new Date().toISOString()}] [fetchOptionData] [TXN:${transactionId || 'NOTX'}] Making request to MarketData API for symbol: ${symbol}`);
  console.log(`[${new Date().toISOString()}] [fetchOptionData] [TXN:${transactionId || 'NOTX'}] Request URL: ${url}`);
  
  const startTime = Date.now();
  try {
    console.log(`[${new Date().toISOString()}] [fetchOptionData] [TXN:${transactionId || 'NOTX'}] Initiating API request with ${REQUEST_TIMEOUT}ms timeout`);
    
    const response = await fetchWithTimeout(url, {
      headers: {
        'Authorization': `Token ${apiKey}`,
      }
    }, REQUEST_TIMEOUT);
    
    const endTime = Date.now();
    console.log(`[${new Date().toISOString()}] [fetchOptionData] [TXN:${transactionId || 'NOTX'}] API Response time: ${endTime - startTime}ms for symbol: ${symbol}`);
    console.log(`[${new Date().toISOString()}] [fetchOptionData] [TXN:${transactionId || 'NOTX'}] API Response status: ${response.status}`);
    
    // Log rate limit information from headers if available
    const rateLimitLimit = response.headers.get('X-RateLimit-Limit');
    const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
    const rateLimitReset = response.headers.get('X-RateLimit-Reset');
    
    if (rateLimitLimit && rateLimitRemaining && rateLimitReset) {
      console.log(`[${new Date().toISOString()}] [fetchOptionData] [TXN:${transactionId || 'NOTX'}] Rate limit info - Limit: ${rateLimitLimit}, Remaining: ${rateLimitRemaining}, Reset: ${rateLimitReset}`);
    }
    
    if (!response.ok) {
      console.error(`[${new Date().toISOString()}] [fetchOptionData] [TXN:${transactionId || 'NOTX'}] HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
      
      // Try to get more information about the error
      try {
        const errorBody = await response.text();
        console.error(`[${new Date().toISOString()}] [fetchOptionData] [TXN:${transactionId || 'NOTX'}] Error response body: ${errorBody}`);
      } catch (e) {
        console.error(`[${new Date().toISOString()}] [fetchOptionData] [TXN:${transactionId || 'NOTX'}] Could not read error response body: ${e}`);
      }
      
      // Classify the error based on status code
      const apiError = classifyError(new Error(`HTTP error ${response.status}`), response.status);
      
      console.error(`[${new Date().toISOString()}] [fetchOptionData] [TXN:${transactionId || 'NOTX'}] Classified as ${apiError.type}: ${apiError.message}`);
      
      return { data: null, error: apiError };
    }

    console.log(`[${new Date().toISOString()}] [fetchOptionData] [TXN:${transactionId || 'NOTX'}] Successfully received response from API, parsing JSON`);
    const parseStartTime = Date.now();
    const data = await response.json();
    const parseEndTime = Date.now();
    console.log(`[${new Date().toISOString()}] [fetchOptionData] [TXN:${transactionId || 'NOTX'}] JSON parsing time: ${parseEndTime - parseStartTime}ms`);
    console.log(`[${new Date().toISOString()}] [fetchOptionData] [TXN:${transactionId || 'NOTX'}] API Response for ${symbol} has keys: ${Object.keys(data).join(', ')}`);
    
    // Validate response structure
    if (!data) {
      console.error(`[${new Date().toISOString()}] [fetchOptionData] [TXN:${transactionId || 'NOTX'}] API returned empty or null response`);
      return { 
        data: null, 
        error: {
          type: ErrorType.API_ERROR,
          message: 'API returned empty or null response',
          retryable: true
        }
      };
    }
    
    if (data.s !== 'ok') {
      console.error(`[${new Date().toISOString()}] [fetchOptionData] [TXN:${transactionId || 'NOTX'}] API returned non-OK status: ${data.s}`);
      console.error(`[${new Date().toISOString()}] [fetchOptionData] [TXN:${transactionId || 'NOTX'}] Complete response: ${JSON.stringify(data)}`);
      return { 
        data: null, 
        error: {
          type: ErrorType.API_ERROR,
          message: `API returned non-OK status: ${data.s}`,
          retryable: true
        }
      };
    }
    
    // Check if required fields exist
    const requiredFields = ['mid', 'ask', 'openInterest', 'bid', 'iv', 'delta', 'intrinsicValue', 'extrinsicValue', 'underlyingPrice'];
    const missingFields = requiredFields.filter(field => !data[field] || data[field].length === 0);
    
    if (missingFields.length > 0) {
      console.warn(`[${new Date().toISOString()}] [fetchOptionData] [TXN:${transactionId || 'NOTX'}] Missing expected fields in API response: ${missingFields.join(', ')}`);
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
      console.warn(`[${new Date().toISOString()}] [fetchOptionData] [TXN:${transactionId || 'NOTX'}] Null values detected in fields: ${nullFields.join(', ')}`);
    } else {
      console.log(`[${new Date().toISOString()}] [fetchOptionData] [TXN:${transactionId || 'NOTX'}] Successfully parsed all relevant fields for ${symbol}`);
    }

    // Log the actual data values for debugging
    console.log(`[${new Date().toISOString()}] [fetchOptionData] [TXN:${transactionId || 'NOTX'}] Extracted data values - mid: ${marketData.mid}, iv: ${marketData.iv}, delta: ${marketData.delta}, underlyingPrice: ${marketData.underlyingPrice}`);
    
    return { data: marketData, error: null };
  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] [fetchOptionData] [TXN:${transactionId || 'NOTX'}] Error fetching option data for ${symbol}:`, error);
    console.error(`[${new Date().toISOString()}] [fetchOptionData] [TXN:${transactionId || 'NOTX'}] Error name: ${error.name}, message: ${error.message}`);
    
    if (error.stack) {
      console.error(`[${new Date().toISOString()}] [fetchOptionData] [TXN:${transactionId || 'NOTX'}] Error stack: ${error.stack}`);
    }
    
    // Classify the error
    const apiError = classifyError(error);
    console.error(`[${new Date().toISOString()}] [fetchOptionData] [TXN:${transactionId || 'NOTX'}] Classified as ${apiError.type}: ${apiError.message}`);
    
    return { data: null, error: apiError };
  }
}
