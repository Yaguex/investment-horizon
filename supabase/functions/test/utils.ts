export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function formatExpirationDate(dateStr: string): string {
  try {
    // Input format: "YYYY-MM-DD"
    // Required output format: "YYMMDD"
    const [year, month, day] = dateStr.split('-');
    
    // Take last 2 digits of year
    const shortYear = year.slice(2);
    
    // Combine in required format: YYMMDD
    const formattedDate = `${shortYear}${month}${day}`;
    
    console.log(`[Utils] Formatted date ${dateStr} to ${formattedDate}`);
    return formattedDate;
  } catch (error) {
    console.error('[Utils] Error formatting date:', error);
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
    console.warn(`[Utils] No option found for strike ${targetStrike} in:`, options);
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