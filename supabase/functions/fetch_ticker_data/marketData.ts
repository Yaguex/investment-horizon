import { MarketData } from './types.ts';

export async function fetchOptionData(symbol: string, apiKey: string, retries = 3): Promise<MarketData | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
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
      
      if (data.s === 'ok' && data.mid && data.mid.length > 0) {
        return {
          mid: Number(data.mid[0]).toFixed(2),
          openInterest: data.openInterest[0],
          iv: Math.round(data.iv[0] * 100),
          delta: Number(data.delta[0]).toFixed(2),
          intrinsicValue: Number(data.intrinsicValue[0]).toFixed(2),
          extrinsicValue: Number(data.extrinsicValue[0]).toFixed(2),
          underlyingPrice: Number(data.underlyingPrice[0]).toFixed(2)
        };
      }
      
      return null;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in attempt ${attempt}:`, error);
      if (attempt === retries) return null;
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  return null;
}