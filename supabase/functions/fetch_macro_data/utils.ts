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

export const processObservations = (
  data: FredResponse,
  series_id: string,
  description: string
): MacroDataRecord[] => {
  const validObservations = data.observations
    .slice(-25)
    .filter(obs => obs.value !== '.') // Skip observations with '.' value
    .map(obs => ({
      series_id,
      series_id_description: description,
      date: obs.date,
      value: parseFloat(obs.value),
      last_update: new Date().toISOString(),
    }));

  console.log(`[${new Date().toISOString()}] Processed ${validObservations.length} valid observations for ${series_id}`);
  return validObservations;
};