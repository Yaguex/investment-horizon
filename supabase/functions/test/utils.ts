import { format, parse } from "https://esm.sh/date-fns@3.3.1";

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function formatExpirationDate(dateStr: string | Date): string {
  try {
    let date: Date;
    
    if (dateStr instanceof Date) {
      // If it's already a Date object, format it directly
      date = dateStr;
      console.log('[Utils] Input date is Date object:', date);
    } else {
      // Parse the ISO string to get the local date components
      date = new Date(dateStr);
      console.log('[Utils] Parsed date from string:', date);
    }
    
    // Extract local date components
    const day = date.getDate();
    const month = date.getMonth() + 1; // getMonth() returns 0-11
    const year = date.getFullYear();
    
    // Format to YYMMDD with leading zeros
    const formattedYear = year.toString().slice(-2);
    const formattedMonth = month.toString().padStart(2, '0');
    const formattedDay = day.toString().padStart(2, '0');
    
    const result = `${formattedYear}${formattedMonth}${formattedDay}`;
    console.log('[Utils] Formatted expiration date:', result);
    return result;
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