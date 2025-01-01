import { corsHeaders } from './utils.ts';

interface ApiResponse {
  data: any;
  error: any;
}

export async function fetchWithRetry(url: string, apiKey: string, retries = 3): Promise<ApiResponse> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[API] Attempt ${attempt}/${retries} - Fetching ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[API] HTTP error! status: ${response.status}, body: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`[API] Success! Response:`, data);
      
      if (data.error) {
        console.error(`[API] API error:`, data.error);
        return { data: null, error: data.error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error(`[API] Attempt ${attempt} failed:`, error);
      if (attempt === retries) {
        return { data: null, error };
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return { data: null, error: new Error('All retry attempts failed') };
}

export async function fetchStockQuote(ticker: string, apiKey: string): Promise<any> {
  const url = `https://api.marketdata.app/v1/stocks/quotes/${ticker}/`;
  
  const { data, error } = await fetchWithRetry(url, apiKey);
  
  if (error) {
    console.error(`[Stock] Error fetching stock quote:`, error);
    return null;
  }
  
  return data?.data?.[0];
}

export async function fetchOptionsChain(
  ticker: string,
  expiration: string,
  side: 'call' | 'put',
  strikes: string,
  apiKey: string
): Promise<any> {
  const encodedStrikes = encodeURIComponent(strikes);
  
  // Remove the date formatting logic and use the expiration date as-is
  console.log(`[Options] Using expiration date: ${expiration}`);
  
  const url = `https://api.marketdata.app/v1/options/chain/${ticker}/?expiration=${expiration}&side=${side}&strikeLimit=${encodedStrikes}`;
  console.log(`[Options] Request URL: ${url}`);
  
  const { data, error } = await fetchWithRetry(url, apiKey);
  
  if (error) {
    console.error(`[Options] Error fetching options chain:`, error);
    return null;
  }
  
  return data?.data || null;
}
