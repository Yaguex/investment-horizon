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

    // Apply safeGetArrayValue to all fields
    const mid = safeGetArrayValue(data, 'mid');
    const ask = safeGetArrayValue(data, 'ask');
    const openInterest = safeGetArrayValue(data, 'openInterest');
    const bid = safeGetArrayValue(data, 'bid');
    const iv = safeGetArrayValue(data, 'iv');
    const delta = safeGetArrayValue(data, 'delta');
    const last = safeGetArrayValue(data, 'last');
    const intrinsicValue = safeGetArrayValue(data, 'intrinsicValue');
    const volume = safeGetArrayValue(data, 'volume');
    const extrinsicValue = safeGetArrayValue(data, 'extrinsicValue');
    const underlyingPrice = safeGetArrayValue(data, 'underlyingPrice');
    const gamma = safeGetArrayValue(data, 'gamma');
    const theta = safeGetArrayValue(data, 'theta');
    const vega = safeGetArrayValue(data, 'vega');
    const rho = safeGetArrayValue(data, 'rho');

    // If any required field is missing, return null
    if (!mid || !openInterest || !iv || !delta || !intrinsicValue || 
        !extrinsicValue || !underlyingPrice) {
      console.error(`Missing required fields in response for ${symbol}`);
      return null;
    }

    return {
      mid: Number(mid.toFixed(2)),
      ask,
      openInterest: Math.round(openInterest),
      bid,
      iv: Math.round(iv * 100),
      delta: Number(delta.toFixed(2)),
      last,
      intrinsicValue: Number(intrinsicValue.toFixed(2)),
      volume,
      extrinsicValue: Number(extrinsicValue.toFixed(2)),
      underlyingPrice: Number(underlyingPrice.toFixed(2)),
      gamma,
      theta,
      vega,
      rho
    };
  } catch (error) {
    console.error(`Error fetching option data for ${symbol}:`, error);
    return null;
  }
}