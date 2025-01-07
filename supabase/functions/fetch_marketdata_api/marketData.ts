import { MarketData } from './types.ts';

export async function fetchOptionData(symbol: string): Promise<MarketData | null> {
  const apiKey = Deno.env.get('MARKETDATA_API_KEY');
  if (!apiKey) {
    throw new Error('MARKETDATA_API_KEY not found in environment variables');
  }

  const url = `https://api.marketdata.app/v1/options/quotes/${symbol}/`;
  console.log(`[${new Date().toISOString()}] Making request to MarketData API for symbol: ${symbol}`);
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Token ${apiKey}`,
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  console.log(`[${new Date().toISOString()}] API Response for ${symbol}:`, data);
  
  if (data.s === 'ok' && data.ask && data.ask.length > 0) {
    return {
      ask: Number(data.ask[0]),
      bid: Number(data.bid[0]),
      mid: Number(data.mid[0]),
      last: Number(data.last[0]),
      volume: Number(data.volume[0]),
      openInterest: data.openInterest[0],
      iv: Number(data.iv[0]),
      delta: Number(data.delta[0]),
      gamma: Number(data.gamma[0]),
      theta: Number(data.theta[0]),
      vega: Number(data.vega[0]),
      rho: Number(data.rho[0]),
      intrinsicValue: Number(data.intrinsicValue[0]),
      extrinsicValue: Number(data.extrinsicValue[0]),
      underlyingPrice: Number(data.underlyingPrice[0])
    };
  }
  
  return null;
}