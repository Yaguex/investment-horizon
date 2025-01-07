import { corsHeaders } from '../fetch_ticker_data/utils.ts';

interface RequestBody {
  ticker: string;
  expiration: string;
  type: 'call' | 'put';
  strike: number;
}

function generateOptionSymbol(ticker: string, expiration: string, type: 'call' | 'put', strike: number): string {
  const [year, month, day] = expiration.split('-').map(Number);
  const yearStr = year.toString().slice(-2);
  const monthStr = month.toString().padStart(2, '0');
  const dayStr = day.toString().padStart(2, '0');
  const strikeStr = (strike * 1000).toString().padStart(8, '0');
  const optionType = type === 'call' ? 'C' : 'P';
  
  const symbol = `${ticker.toUpperCase()}${yearStr}${monthStr}${dayStr}${optionType}${strikeStr}`;
  console.log(`[${new Date().toISOString()}] Generated symbol: ${symbol} for strike: ${strike}`);
  return symbol;
}

async function fetchOptionData(symbol: string, apiKey: string, retries = 3): Promise<any> {
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

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ticker, expiration, type, strike } = await req.json() as RequestBody;
    console.log(`[${new Date().toISOString()}] Input data:`, { ticker, expiration, type, strike });

    const apiKey = Deno.env.get('MARKETDATA_API_KEY');
    if (!apiKey) {
      throw new Error('MARKETDATA_API_KEY not found');
    }

    // Generate symbol and fetch data
    const symbol = generateOptionSymbol(ticker, expiration, type, strike);
    const marketData = await fetchOptionData(symbol, apiKey);

    if (!marketData) {
      throw new Error('Failed to fetch market data');
    }

    return new Response(
      JSON.stringify({
        marketData,
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in fetch_marketdata_api:`, error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack,
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});