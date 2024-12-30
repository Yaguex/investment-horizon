import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FredResponse {
  realtime_start: string;
  realtime_end: string;
  observation_start: string;
  observation_end: string;
  units: string;
  output_type: number;
  file_type: string;
  order_by: string;
  sort_order: string;
  count: number;
  offset: number;
  limit: number;
  observations: Array<{
    realtime_start: string;
    realtime_end: string;
    date: string;
    value: string;
  }>;
}

// List of FRED series IDs to fetch
const SERIES_IDS = [
  { id: 'GDP', description: 'Gross Domestic Product' },
  { id: 'UNRATE', description: 'Unemployment Rate' },
  { id: 'CPIAUCSL', description: 'Consumer Price Index for All Urban Consumers: All Items in U.S. City Average' },
  { id: 'FEDFUNDS', description: 'Federal Funds Effective Rate' },
];

async function logToDatabase(supabase: any, series_id: string, status: string, message?: string) {
  try {
    const { error } = await supabase
      .from('macro_data_logs')
      .insert([
        { 
          series_id,
          status,
          message: message || null,
          timestamp: new Date().toISOString()
        }
      ]);
    
    if (error) {
      console.error('Error logging to database:', error);
    }
  } catch (error) {
    console.error('Error logging to database:', error);
  }
}

async function fetchWithRetry(url: string, retries = 3, delayMs = 6000): Promise<Response> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Attempting to fetch ${url} (attempt ${attempt}/${retries})`);
      // Add delay between requests to respect the 10 requests per minute limit
      if (attempt > 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
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
      // Wait before retrying to respect rate limit
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  throw new Error('All retry attempts failed');
}

async function processSeries(
  series: { id: string; description: string }, 
  fredApiKey: string,
  supabase: any
): Promise<void> {
  try {
    console.log(`Starting to process series ${series.id}`);
    
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${series.id}&api_key=${fredApiKey}&file_type=json&limit=25&sort_order=desc`;
    
    console.log(`Fetching data for series ${series.id}`);
    const response = await fetchWithRetry(url);
    const data: FredResponse = await response.json();
    
    if (!data.observations || data.observations.length === 0) {
      throw new Error('No observations found');
    }

    console.log(`Got ${data.observations.length} observations for ${series.id}`);

    // Delete existing entries for this series
    const { error: deleteError } = await supabase
      .from('macro_data')
      .delete()
      .eq('series_id', series.id);

    if (deleteError) {
      console.error(`Error deleting existing data for ${series.id}:`, deleteError);
      throw deleteError;
    }

    // Insert new data
    const observations = data.observations.map(obs => ({
      series_id: series.id,
      series_id_description: series.description,
      realtime_end: obs.realtime_end,
      value: parseFloat(obs.value),
      last_update: new Date().toISOString()
    }));

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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Edge function started');
    
    const fredApiKey = Deno.env.get('FRED_API_KEY');
    if (!fredApiKey) {
      throw new Error('FRED_API_KEY is not set');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials are not set');
    }

    console.log('Initializing Supabase client');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Process series with a delay to respect the 10 requests per minute limit
    // 6000ms = 6 seconds between requests = 10 requests per minute
    const delay = 6000;
    for (const series of SERIES_IDS) {
      try {
        await processSeries(series, fredApiKey, supabase);
        if (series !== SERIES_IDS[SERIES_IDS.length - 1]) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        console.error(`Failed to process series ${series.id}:`, error);
        // Continue with next series even if one fails
        continue;
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in fetch-fred-data function:', errorMessage);
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});