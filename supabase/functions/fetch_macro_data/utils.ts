import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { FredResponse, MacroDataRecord } from './types.ts';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const logEvent = async (supabase: any, series_id: string, status: string, message: string) => {
  console.log(`[${new Date().toISOString()}] Logging event: ${status} - ${message}`);
  await supabase
    .from('macro_data_logs')
    .insert([{
      series_id,
      status,
      message,
      timestamp: new Date().toISOString(),
    }]);
};

export const calculateAdjustedValue = (
  currentRow: { series_id: string; date: string; value: number },
  historicalData: { date: string; value: number }[]
): number => {
  try {
    const { series_id, value } = currentRow;
    
    // Find historical data points
    const sortedData = [...historicalData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const currentIndex = sortedData.findIndex(row => row.date === currentRow.date);
    
    if (currentIndex === -1) return 0;

    // Helper function to find historical value
    const getHistoricalValue = (monthsAgo: number): number | null => {
      const targetIndex = currentIndex - monthsAgo;
      return targetIndex >= 0 ? sortedData[targetIndex].value : null;
    };

    // Helper function to find year ago value
    const getYearAgoValue = (): number | null => {
      const yearAgoDate = new Date(currentRow.date);
      yearAgoDate.setFullYear(yearAgoDate.getFullYear() - 1);
      const yearAgoRow = sortedData.find(row => {
        const rowDate = new Date(row.date);
        return rowDate.getMonth() === yearAgoDate.getMonth() && 
               rowDate.getFullYear() === yearAgoDate.getFullYear();
      });
      return yearAgoRow ? yearAgoRow.value : null;
    };

    // Simple rounding functions
    const round0 = (num: number) => Math.round(num);
    const round1 = (num: number) => Number(num.toFixed(1));
    const round2 = (num: number) => Number(num.toFixed(2));

    // Calculate adjusted value based on series_id
    switch (series_id) {
      // Direct value with 2 decimals
      case 'FEDFUNDS':
      case 'GFDEGDQ188S':
      case 'FYFSGDA188S':
      case 'BAMLH0A0HYM2':
      case 'BAMLC0A0CM':
      case 'T10YIE':
      case 'MORTGAGE30US':
      case 'VIXCLS':
      case 'T10Y2Y':
      case 'T10Y3M':
        return round2(value);

      // Direct value with 0 decimals
      case 'RRPONTSYD':
      case 'WTREGEN':
        return round0(value);

      // Division by 1,000,000 with 2 decimals
      case 'WALCL':
        return round2(value / 1000000);

      // Division by 1,000 with 2 decimals
      case 'TOTRESNS':
      case 'PERMIT':
      case 'HOUST':
        return round2(value / 1000);

      // Division by 1,000 with 0 decimals
      case 'MSPUS':
        return round0(value / 1000);

      // Direct value with 1 decimal
      case 'UNRATE':
      case 'UMCSENT':
        return round1(value);

      // Month-over-month change
      case 'PAYEMS':
        const lastMonthValue = getHistoricalValue(1);
        return lastMonthValue !== null ? round0(value - lastMonthValue) : 0;

      // Year-over-year percentage change with 1 decimal
      case 'CPIAUCSL':
      case 'CPILFESL':
      case 'PCEPI':
      case 'PCEPILFE':
      case 'PPIFIS':
      case 'GDPC1': {
        const yearAgoValue = getYearAgoValue();
        return yearAgoValue && yearAgoValue !== 0 
          ? round1(((value - yearAgoValue) / yearAgoValue) * 100)
          : 0;
      }

      // Month-over-month percentage change with 1 decimal
      case 'INDPRO':
      case 'DGORDER':
      case 'MRTSSM44000USS':
      case 'PCE': {
        const lastMonthValue = getHistoricalValue(1);
        return lastMonthValue && lastMonthValue !== 0
          ? round1(((value - lastMonthValue) / lastMonthValue) * 100)
          : 0;
      }

      // Three-month percentage change with 1 decimal
      case 'CP': {
        const threeMonthsAgoValue = getHistoricalValue(3);
        return threeMonthsAgoValue && threeMonthsAgoValue !== 0
          ? round1(((value - threeMonthsAgoValue) / threeMonthsAgoValue) * 100)
          : 0;
      }

      default:
        console.warn(`Unknown series_id: ${series_id}, defaulting to 0`);
        return 0;
    }
  } catch (error) {
    console.error(`Error calculating adjusted value for ${currentRow.series_id}:`, error);
    return 0;
  }
};

export const processObservations = (
  data: FredResponse,
  series_id: string,
  description: string
): MacroDataRecord[] => {
  const validObservations = data.observations
    .slice(-25)
    .filter(obs => obs.value !== '.') // Skip observations with '.' value
    .map(obs => ({
      date: obs.date,
      value: parseFloat(obs.value)
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  console.log(`[${new Date().toISOString()}] Processing ${validObservations.length} valid observations for ${series_id}`);

  const processedObservations = validObservations.map(obs => ({
    series_id,
    series_id_description: description,
    date: obs.date,
    value: obs.value,
    value_adjusted: calculateAdjustedValue(
      { series_id, ...obs },
      validObservations
    ),
    last_update: new Date().toISOString(),
  }));

  console.log(`[${new Date().toISOString()}] Calculated adjusted values for ${series_id}:`, 
    processedObservations.map(obs => ({
      date: obs.date,
      original: obs.value,
      adjusted: obs.value_adjusted
    }))
  );

  return processedObservations;
};