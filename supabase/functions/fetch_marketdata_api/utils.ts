
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function generateOptionSymbol(ticker: string, expiration: string, type: 'C' | 'P', strike: number | string): string {
  // Get the current timestamp for logging
  const timestamp = new Date().toISOString();
  
  // Log input with types for debugging
  console.log(`[${timestamp}] [generateOptionSymbol] Generating symbol with inputs: ticker=${ticker}, expiration=${expiration}, type=${type}, strike=${strike} (${typeof strike})`);
  
  // Validate required inputs
  if (!ticker) {
    console.error(`[${timestamp}] [generateOptionSymbol] Invalid ticker: empty or undefined`);
    throw new Error('Invalid ticker parameter');
  }
  
  if (!expiration || !/^\d{4}-\d{2}-\d{2}$/.test(expiration)) {
    console.error(`[${timestamp}] [generateOptionSymbol] Invalid expiration format: ${expiration}`);
    throw new Error('Invalid expiration format, expected YYYY-MM-DD');
  }
  
  if (type !== 'C' && type !== 'P') {
    console.error(`[${timestamp}] [generateOptionSymbol] Invalid option type: ${type}`);
    throw new Error('Invalid option type, expected C or P');
  }
  
  // Enhanced strike validation and conversion
  let strikeNum: number;
  
  // Handle different input types for strike
  if (typeof strike === 'string') {
    // Try to extract a valid number from the string
    // First, remove any non-numeric characters except decimal point
    const cleanedString = strike.toString().replace(/[^\d.]/g, '');
    strikeNum = parseFloat(cleanedString);
    console.log(`[${timestamp}] [generateOptionSymbol] Converted string strike "${strike}" to number ${strikeNum}`);
  } else if (typeof strike === 'number') {
    strikeNum = strike;
  } else {
    console.error(`[${timestamp}] [generateOptionSymbol] Strike has unexpected type: ${typeof strike}`);
    throw new Error(`Invalid strike type: ${typeof strike}`);
  }
  
  // Final validation of the numeric value
  if (isNaN(strikeNum)) {
    console.error(`[${timestamp}] [generateOptionSymbol] Strike conversion resulted in NaN: ${strike} (${typeof strike})`);
    throw new Error(`Invalid strike value - cannot convert to number: ${strike}`);
  }
  
  if (strikeNum <= 0) {
    console.error(`[${timestamp}] [generateOptionSymbol] Strike value not positive: ${strikeNum}`);
    throw new Error(`Invalid strike value - must be positive: ${strikeNum}`);
  }
  
  // Generate the option symbol
  const [year, month, day] = expiration.split('-').map(Number);
  console.log(`[${timestamp}] [generateOptionSymbol] Parsed date: year=${year}, month=${month}, day=${day}`);
  
  const yearStr = year.toString().slice(-2);
  const monthStr = month.toString().padStart(2, '0');
  const dayStr = day.toString().padStart(2, '0');
  
  // Convert strike to required format (strike * 1000, padded to 8 digits)
  const strikeStr = (strikeNum * 1000).toString().padStart(8, '0');
  
  const symbol = `${ticker.toUpperCase()}${yearStr}${monthStr}${dayStr}${type}${strikeStr}`;
  console.log(`[${timestamp}] [generateOptionSymbol] Generated symbol: ${symbol} for ticker: ${ticker}, strike: ${strikeNum}, expiration: ${expiration}, type: ${type}`);
  return symbol;
}
