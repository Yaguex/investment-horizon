
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function generateOptionSymbol(ticker: string, expiration: string, type: 'C' | 'P', strike: number): string {
  console.log(`[${new Date().toISOString()}] [generateOptionSymbol] Generating symbol with inputs: ticker=${ticker}, expiration=${expiration}, type=${type}, strike=${strike} (${typeof strike})`);
  
  // Validate inputs
  if (!ticker) {
    console.error(`[${new Date().toISOString()}] [generateOptionSymbol] Invalid ticker: empty or undefined`);
    throw new Error('Invalid ticker parameter');
  }
  
  if (!expiration || !/^\d{4}-\d{2}-\d{2}$/.test(expiration)) {
    console.error(`[${new Date().toISOString()}] [generateOptionSymbol] Invalid expiration format: ${expiration}`);
    throw new Error('Invalid expiration format, expected YYYY-MM-DD');
  }
  
  if (type !== 'C' && type !== 'P') {
    console.error(`[${new Date().toISOString()}] [generateOptionSymbol] Invalid option type: ${type}`);
    throw new Error('Invalid option type, expected C or P');
  }
  
  // Explicitly convert strike to Number and verify it's valid
  const strikeNum = Number(strike);
  if (isNaN(strikeNum)) {
    console.error(`[${new Date().toISOString()}] [generateOptionSymbol] Invalid strike price - NaN: ${strike} (${typeof strike})`);
    throw new Error(`Invalid strike price - NaN: ${strike} (${typeof strike})`);
  }
  
  if (strikeNum <= 0) {
    console.error(`[${new Date().toISOString()}] [generateOptionSymbol] Invalid strike price - not positive: ${strikeNum}`);
    throw new Error(`Invalid strike price - not positive: ${strikeNum}`);
  }
  
  const [year, month, day] = expiration.split('-').map(Number);
  console.log(`[${new Date().toISOString()}] [generateOptionSymbol] Parsed date: year=${year}, month=${month}, day=${day}`);
  
  const yearStr = year.toString().slice(-2);
  const monthStr = month.toString().padStart(2, '0');
  const dayStr = day.toString().padStart(2, '0');
  
  // Use strikeNum which is guaranteed to be a valid number
  const strikeStr = (strikeNum * 1000).toString().padStart(8, '0');
  
  const symbol = `${ticker.toUpperCase()}${yearStr}${monthStr}${dayStr}${type}${strikeStr}`;
  console.log(`[${new Date().toISOString()}] [generateOptionSymbol] Generated symbol: ${symbol} for ticker: ${ticker}, strike: ${strikeNum}, expiration: ${expiration}, type: ${type}`);
  return symbol;
}
