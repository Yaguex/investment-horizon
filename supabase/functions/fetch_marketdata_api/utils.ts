export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function generateOptionSymbol(ticker: string, expiration: string, type: 'C' | 'P', strike: number): string {
  const [year, month, day] = expiration.split('-').map(Number);
  const yearStr = year.toString().slice(-2);
  const monthStr = month.toString().padStart(2, '0');
  const dayStr = day.toString().padStart(2, '0');
  const strikeStr = (strike * 1000).toString().padStart(8, '0');
  
  const symbol = `${ticker.toUpperCase()}${yearStr}${monthStr}${dayStr}${type}${strikeStr}`;
  console.log(`[${new Date().toISOString()}] Generated symbol: ${symbol} for strike: ${strike}`);
  return symbol;
}