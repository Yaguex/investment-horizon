import { corsHeaders } from './utils.ts';

interface ApiResponse {
  data: any;
  error: any;
}

export async function fetchWithRetry(url: string, apiKey: string, retries = 3): Promise<ApiResponse> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[API] Attempt ${attempt}/${retries} - Fetching ${url}`);
      console.log(`[API] Using API key: ${apiKey.substring(0, 5)}...`); // Log first 5 chars of API key
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`[API] Response status:`, response.status);
      console.log(`[API] Response headers:`, Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        console.error(`[API] HTTP error! status: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`[API] Raw response for ${url}:`, JSON.stringify(data, null, 2));
      
      // Check if the API returned an error message
      if (data.error) {
        console.error(`[API] API error:`, data.error);
        return { data: null, error: data.error };
      }
      
      // Log the structure of the data
      console.log(`[API] Data structure:`, {
        hasData: !!data,
        dataType: typeof data,
        isArray: Array.isArray(data?.data),
        dataLength: data?.data?.length,
        keys: Object.keys(data || {})
      });
      
      return { data, error: null };
    } catch (error) {
      console.error(`[API] Attempt ${attempt} failed:`, error);
      if (attempt === retries) {
        console.error(`[API] All ${retries} attempts failed`);
        return { data: null, error };
      }
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second pause between retries
    }
  }
  return { data: null, error: new Error('All retry attempts failed') };
}

export async function fetchStockQuote(ticker: string, apiKey: string): Promise<any> {
  console.log(`[Stock] Fetching quote for ${ticker}`);
  const url = `https://api.marketdata.app/v1/stocks/quotes/${ticker}/`;
  console.log(`[Stock] Request URL:`, url);
  
  const { data, error } = await fetchWithRetry(url, apiKey);
  
  if (error) {
    console.error(`[Stock] Error fetching stock quote:`, error);
    return null;
  }
  
  // Extract the first quote from the array
  const quote = data?.data?.[0];
  console.log(`[Stock] Processed quote:`, quote);
  return quote;
}

export async function fetchOptionsChain(
  ticker: string,
  expiration: string,
  side: 'call' | 'put',
  strikes: string,
  apiKey: string
): Promise<any> {
  console.log(`[Options] Fetching ${side} options for ${ticker}, exp: ${expiration}, strikes: ${strikes}`);
  const url = `https://api.marketdata.app/v1/options/chain/${ticker}/?expiration=${expiration}&side=${side}&strikeLimit=${strikes}`;
  console.log(`[Options] Request URL:`, url);
  
  const { data, error } = await fetchWithRetry(url, apiKey);
  
  if (error) {
    console.error(`[Options] Error fetching options chain:`, error);
    return null;
  }
  
  console.log(`[Options] Raw options data:`, JSON.stringify(data, null, 2));
  console.log(`[Options] Data structure:`, {
    hasData: !!data,
    dataType: typeof data,
    isArray: Array.isArray(data?.data),
    dataLength: data?.data?.length,
    dataKeys: Object.keys(data || {}),
    firstItem: data?.data?.[0]
  });
  
  // Add validation before returning
  if (!data?.data || !Array.isArray(data.data)) {
    console.error(`[Options] Invalid data structure received:`, data);
    return null;
  }
  
  return data?.data || null;
}