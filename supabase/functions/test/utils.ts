import { format, parse } from "https://esm.sh/date-fns@3.3.1";

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function formatExpirationDate(dateStr: string): string {
  try {
    // Parse the input date string (dd-MM-yyyy) into a Date object
    const parsedDate = parse(dateStr, 'dd-MM-yyyy', new Date());
    
    // Format it to exactly match the API's expected format (YYMMDD)
    // Using date-fns format with explicit formatting to ensure leading zeros
    return format(parsedDate, 'yyMMdd');
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