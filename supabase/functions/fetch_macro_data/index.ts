import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { SERIES_DATA } from './seriesData.ts';
import { corsHeaders, sleep, logEvent, processObservations } from './utils.ts';
import { FredResponse } from './types.ts';

async function fetchSeriesData(
  supabase: any,
  series_id: string,
  apiKey: string,
  retries = 3
): Promise<FredResponse | null> {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Starting fetch for series ${series_id}`);

  // Determine observation start date based on series_id
  let observationStart = '2022-11-01'; // default
  
  switch(series_id) {
    case 'FYFSGDA188S':
      observationStart = '2012-01-01';
      break;
    case 'GFDEGDQ188S':
      observationStart = '2021-01-01';
      break;
    case 'GDPC1':
    case 'CP':
      observationStart = '2019-01-01';
      break;
    case 'MSPUS':
      observationStart = '2020-01-01';
      break;
  }
  
  console.log(`[${new Date().toISOString()}] Using observation_start=${observationStart} for series ${series_id}`);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Define special series that need different endpoint configuration
      const specialSeries = ['T10Y2Y', 'T10Y3M', 'BAMLH0A0HYM2', 'BAMLC0A0CM', 'T10YIE', 'TOTRESNS'];
      
      // Construct URL based on series type
      const url = specialSeries.includes(series_id)
        ? `https://api.stlouisfed.org/fred/series/observations?series_id=${series_id}&api_key=${apiKey}&limit=25&frequency=m&file_type=json`
        : `https://api.stlouisfed.org/fred/series/observations?series_id=${series_id}&api_key=${apiKey}&observation_start=${observationStart}&file_type=json`;

      console.log(`[${new Date().toISOString()}] Attempt ${attempt}/${retries} for ${series_id}`);
      
      const response = await fetch(url);
      const responseTime = Date.now() - startTime;
      console.log(`[${new Date().toISOString()}] Response received for ${series_id} in ${responseTime}ms`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
      
      const data = await response.json();
      if (!data.observations || !Array.isArray(data.observations)) {
        throw new Error(`Invalid data structure received for ${series_id}`);
      }

      return data;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error fetching ${series_id} (attempt ${attempt}):`, error);
      
      if (attempt === retries) {
        await logEvent(supabase, series_id, 'error', `Failed after ${retries} attempts: ${error.message}`);
        return null;
      }
      
      await sleep(2000); // Reduced retry delay to 2 seconds
    }
  }
  return null;
}

Deno.serve(async (req) => {
  const requestStartTime = Date.now();
  console.log(`[${new Date().toISOString()}] Starting macro data fetch process`);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const fredApiKey = Deno.env.get('FRED_API_KEY')!;
    
    if (!supabaseUrl || !supabaseKey || !fredApiKey) {
      const missingVars = [
        !supabaseUrl && 'SUPABASE_URL',
        !supabaseKey && 'SUPABASE_SERVICE_ROLE_KEY',
        !fredApiKey && 'FRED_API_KEY'
      ].filter(Boolean).join(', ');
      throw new Error(`Missing required environment variables: ${missingVars}`);
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.from('macro_data').delete().neq('id', 0);
    await logEvent(supabase, 'ALL', 'info', 'Cleaned up existing data');

    const maxExecutionTime = 25 * 1000; // 25 seconds max execution time
    const batchSize = 5; // Process 5 series at a time

    for (let i = 0; i < SERIES_DATA.length; i += batchSize) {
      const currentTime = Date.now();
      const elapsedTime = currentTime - requestStartTime;
      
      if (elapsedTime > maxExecutionTime) {
        console.log(`[${new Date().toISOString()}] Approaching timeout limit. Processed ${i} series out of ${SERIES_DATA.length}`);
        throw new Error(`Execution time limit reached after processing ${i} series`);
      }

      const batch = SERIES_DATA.slice(i, i + batchSize);
      console.log(`[${new Date().toISOString()}] Processing batch ${Math.floor(i/batchSize) + 1}, series ${i + 1}-${Math.min(i + batchSize, SERIES_DATA.length)}`);

      const batchPromises = batch.map(series => fetchSeriesData(supabase, series.id, fredApiKey));
      const batchResults = await Promise.all(batchPromises);

      for (let j = 0; j < batch.length; j++) {
        const series = batch[j];
        const data = batchResults[j];
        
        if (data) {
          const validRecords = processObservations(data, series.id, series.description);
          
          if (validRecords.length > 0) {
            const { error: insertError } = await supabase.from('macro_data').insert(validRecords);
            if (insertError) {
              console.error(`[${new Date().toISOString()}] Error inserting data for ${series.id}:`, insertError);
              await logEvent(supabase, series.id, 'error', `Insert failed: ${insertError.message}`);
            } else {
              console.log(`[${new Date().toISOString()}] Successfully inserted ${validRecords.length} records for ${series.id}`);
              await logEvent(supabase, series.id, 'success', `Successfully fetched and inserted ${validRecords.length} records`);
            }
          } else {
            await logEvent(supabase, series.id, 'warning', 'No valid data points found (all values were ".")');
          }
        }
      }
      
      await sleep(2000); // Reduced delay between batches to 2 seconds
    }

    const totalTime = Date.now() - requestStartTime;
    return new Response(JSON.stringify({ 
      success: true,
      executionTime: totalTime,
      message: 'Macro data fetch completed successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Fatal error in macro data fetch process:`, error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack,
        timestamp: new Date().toISOString()
      }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});