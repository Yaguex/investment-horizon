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
  // Add more series IDs here as needed
];

async function logToDatabase(supabase: any, series_id: string, status: string, message?: string) {
  try {
    await supabase
      .from('macro_data_logs')
      .insert([
        { 
          series_id,
          status,
          message: message || null
        }
      ]);
  } catch (error) {
    console.error('Error logging to database:', error);
  }
}

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
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
      // Wait 61 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 61000));
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
    console.log(`Fetching data for series ${series.id}`);
    
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${series.id}&api_key=${fredApiKey}&file_type=json&limit=25&sort_order=desc`;
    
    const response = await fetchWithRetry(url);
    const data: FredResponse = await response.json();
    
    if (!data.observations || data.observations.length === 0) {
      throw new Error('No observations found');
    }

    // Delete existing entries for this series
    await supabase
      .from('macro_data')
      .delete()
      .eq('series_id', series.id);

    // Insert new data
    const observations = data.observations.map(obs => ({
      series_id: series.id,
      series_id_description: series.description,
      realtime_end: obs.realtime_end,
      value: parseFloat(obs.value),
      last_update: new Date().toISOString()
    }));

    await supabase
      .from('macro_data')
      .insert(observations);

    await logToDatabase(supabase, series.id, 'success');
    console.log(`Successfully updated data for ${series.id}`);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error processing series ${series.id}:`, errorMessage);
    await logToDatabase(supabase, series.id, 'error', errorMessage);
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Process series with throttling
    const delay = 600; // 600ms delay = 100 requests per minute
    for (const series of SERIES_IDS) {
      await processSeries(series, fredApiKey, supabase);
      await new Promise(resolve => setTimeout(resolve, delay));
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