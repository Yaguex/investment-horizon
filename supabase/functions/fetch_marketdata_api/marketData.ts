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
    throw new Error('MARKETDATA_API_KEY not found in environment variables');
  }

  const url = `https://api.marketdata.app/v1/options/quotes/${symbol}/`;
  console.log(`Making request to MarketData API for symbol: ${symbol}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Token ${apiKey}`,
      }
    });

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return null;
    }

    const data = await response.json();
    console.log(`API Response for ${symbol}:`, data);
    
    if (data.s !== 'ok') {
      console.error(`API returned non-OK status:`, data.s);
      return null;
    }

    // Apply safeGetArrayValue to all fields and return whatever we get
    return {
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
  } catch (error: any) {
    console.error(`Error fetching option data for ${symbol}:`, error);
    return null;
  }
}