export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function generateOptionSymbol(ticker: string, expirationDate: string, strike: number, optionType: string): string {
  try {
    // Format date from YYYY-MM-DD to YYMMDD
    const [year, month, day] = expirationDate.split('-');
    const formattedDate = `${year.slice(2)}${month}${day}`;
    
    // Format strike price to 8 digits with leading zeros
    const formattedStrike = (strike * 1000).toFixed(0).padStart(8, '0');
    
    // Combine all parts
    const optionSymbol = `${ticker}${formattedDate}${optionType}${formattedStrike}`;
    
    console.log(`[Utils] Generated option symbol: ${optionSymbol} from:`, {
      ticker,
      expirationDate,
      formattedDate,
      strike,
      formattedStrike,
      optionType
    });
    
    return optionSymbol;
  } catch (error) {
    console.error('[Utils] Error generating option symbol:', error);
    throw error;
  }
}

export function findOptionByStrike(options: any[], targetStrike: number): any {
  if (!Array.isArray(options)) {
    console.warn('[Utils] Options data is not an array:', options);
    return null;
  }

  const option = options.find(opt => Math.abs(parseFloat(opt.strike) - targetStrike) < 0.01);
  if (!option) {
    console.warn(`[Utils] No option found for strike ${targetStrike}`);
  }
  return option || null;
}

export function processOptionData(option: any, strike: number) {
  if (!option) {
    console.log(`[Utils] No option data for strike ${strike}`);
    return {
      strike,
      optionSymbol: null,
      mid: null,
      iv: null
    };
  }

  return {
    strike,
    optionSymbol: option.optionSymbol,
    mid: option.mid,
    iv: option.iv
  };
}