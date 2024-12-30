import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { FredResponse, SERIES_IDS } from './types.ts';
import { RateLimiter } from './rateLimiter.ts';
import { logToDatabase, clearMacroData } from './database.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Attempting to fetch ${url} (attempt ${attempt}/${retries})`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (error) {
      console.error(`Attempt ${attempt} failed for ${url}:`, error);
      if (attempt === retries) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  throw new Error('All retry attempts failed');
}

async function processSeries(
  series: { id: string; description: string }, 
  fredApiKey: string,
  supabase: any,
  rateLimiter: RateLimiter
): Promise<void> {
  try {
    console.log(`Starting to process series ${series.id}`);
    
    await rateLimiter.checkLimit();
    
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${series.id}&api_key=${fredApiKey}&file_type=json&sort_order=desc&limit=25`;
    
    console.log(`Fetching data for series ${series.id}`);
    const response = await fetchWithRetry(url);
    rateLimiter.incrementCount();
    
    const data: FredResponse = await response.json();
    console.log(`Received response for ${series.id}:`, JSON.stringify(data).slice(0, 200) + '...');
    
    if (!data.observations || data.observations.length === 0) {
      const error = `No observations found for ${series.id}`;
      console.error(error);
      throw new Error(error);
    }

    const observations = data.observations.map(obs => ({
      series_id: series.id,
      series_id_description: series.description,
      date: obs.date,
      value: parseFloat(obs.value),
      last_update: new Date().toISOString()
    }));

    console.log(`Inserting ${observations.length} observations for ${series.id}`);
    const { error: insertError } = await supabase
      .from('macro_data')
      .insert(observations);

    if (insertError) {
      console.error(`Error inserting new data for ${series.id}:`, insertError);
      throw insertError;
    }

    await logToDatabase(supabase, series.id, 'success');
    console.log(`Successfully updated data for ${series.id}`);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error processing series ${series.id}:`, errorMessage);
    await logToDatabase(supabase, series.id, 'error', errorMessage);
    throw error;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Edge function started');
    
    const fredApiKey = Deno.env.get('FRED_API_KEY');
    if (!fredApiKey) {
      throw new Error('FRED_API_KEY is not set');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials are not set');
    }

    console.log('Initializing Supabase client');
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Clearing existing macro data');
    await clearMacroData(supabase);

    const rateLimiter = new RateLimiter();
    let successCount = 0;
    let errorCount = 0;
    
    for (const series of SERIES_IDS) {
      try {
        await processSeries(series, fredApiKey, supabase, rateLimiter);
        successCount++;
      } catch (error) {
        console.error(`Failed to process series ${series.id}:`, error);
        errorCount++;
        continue;
      }
    }

    const summary = `Completed with ${successCount} successes and ${errorCount} failures`;
    console.log(summary);

    return new Response(JSON.stringify({ 
      success: true,
      summary,
      successCount,
      errorCount
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in fetch-fred-data function:', errorMessage);
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});