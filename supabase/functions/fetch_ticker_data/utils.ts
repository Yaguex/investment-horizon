export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function formatDateForPostgres(dateStr: string): string {
  const [day, month, year] = dateStr.split('-');
  return `${year}-${month}-${day}`;
}

export function generateOptionSymbol(ticker: string, expiration: string, type: 'C' | 'P', strike: number): string {
  const [day, month, year] = expiration.split('-').map(Number);
  const yearStr = year.toString().slice(-2);
  const monthStr = month.toString().padStart(2, '0');
  const dayStr = day.toString().padStart(2, '0');
  const strikeStr = (strike * 1000).toString().padStart(8, '0');
  
  const symbol = `${ticker.toUpperCase()}${yearStr}${monthStr}${dayStr}${type}${strikeStr}`;
  console.log(`[${new Date().toISOString()}] Generated symbol: ${symbol} for strike: ${strike}`);
  return symbol;
}