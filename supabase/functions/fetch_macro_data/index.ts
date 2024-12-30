// Use relative import
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Series IDs and their descriptions
const SERIES_DATA = [
  { id: 'FEDFUNDS', description: 'Fed Funds' },
  { id: 'GFDEGDQ188S', description: 'Debt to GDP' },
  { id: 'FYFSGDA188S', description: 'Deficit to GDP' },
  { id: 'WALCL', description: "Fed's balance sheet" },
  { id: 'TOTRESNS', description: 'Reserves at Fed' },
  { id: 'RRPONTSYD', description: 'Fed at Repo' },
  { id: 'WTREGEN', description: 'TGA' },
  { id: 'CPIAUCSL', description: 'CPI' },
  { id: 'CPILFESL', description: 'CPI core' },
  { id: 'PCEPI', description: 'PCE' },
  { id: 'PCEPILFE', description: 'PCE core' },
  { id: 'PPIFIS', description: 'PPI' },
  { id: 'PAYEMS', description: 'Non-Farm Payrolls' },
  { id: 'UNRATE', description: 'Unemployment' },
  { id: 'CES0500000003', description: 'Hourly earnings' },
  { id: 'GDPC1', description: 'GDP' },
  { id: 'INDPRO', description: 'Industrial Production' },
  { id: 'CP', description: 'Corporate profits' },
  { id: 'DGORDER', description: 'Durable goods' },
  { id: 'MRTSSM44000USS', description: 'Retail sales' },
  { id: 'UMCSENT', description: 'Consumer sentiment' },
  { id: 'PCE', description: 'Personal consumption' },
  { id: 'HSN1F', description: 'New home sales' },
  { id: 'EXSFHSUSM495S', description: 'Existing home sales' },
  { id: 'PERMIT', description: 'Building permits' },
  { id: 'HOUST', description: 'Housing starts' },
  { id: 'BAMLH0A0HYM2', description: 'High Yield spread' },
  { id: 'BAMLC0A0CM', description: 'Investment Grade spread' },
  { id: 'T10YIE', description: '10yr breakeven inflation' },
  { id: 'MORTGAGE30US', description: 'Mortgage rate' },
  { id: 'VIXCLS', description: 'VIX' },
  { id: 'T10Y2Y', description: '10yr - 2yr' },
  { id: 'T10Y3M', description: '10yr - 3mo' },
  { id: 'MSPUS', description: 'Median home price' },
];

// Helper function to sleep
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to log events
const logEvent = async (supabase: any, series_id: string, status: string, message: string) => {
  console.log(`Logging event: ${status} - ${message}`);
  await supabase
    .from('macro_data_logs')
    .insert([
      {
        series_id,
        status,
        message,
        timestamp: new Date().toISOString(),
      },
    ]);
};

// Helper function to fetch data for a single series with retries
async function fetchSeriesData(
  supabase: any,
  series_id: string,
  apiKey: string,
  retries = 3
): Promise<any> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${series_id}&api_key=${apiKey}&file_type=json`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Attempt ${attempt} failed for series ${series_id}:`, error);
      
      if (attempt === retries) {
        await logEvent(supabase, series_id, 'error', `Failed to fetch ${series_id} after ${retries} attempts`);
        return null;
      }
      
      await sleep(60000); // Wait 60 seconds before retry
    }
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const fredApiKey = Deno.env.get('FRED_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Clean up existing data
    await supabase.from('macro_data').delete().neq('id', 0);
    await logEvent(supabase, 'ALL', 'info', 'Cleaned up existing data');

    // Process series in batches of 10
    for (let i = 0; i < SERIES_DATA.length; i += 10) {
      const batch = SERIES_DATA.slice(i, i + 10);
      
      // Process each series in the current batch
      const batchPromises = batch.map(async (series) => {
        const data = await fetchSeriesData(supabase, series.id, fredApiKey);
        
        if (data && data.observations) {
          // Get last 25 observations
          const last25 = data.observations.slice(-25);
          
          // Insert the data
          const insertData = last25.map((obs: any) => ({
            series_id: series.id,
            series_id_description: series.description,
            date: obs.date,
            value: obs.value,
            last_update: new Date().toISOString(),
          }));
          
          await supabase.from('macro_data').insert(insertData);
          await logEvent(supabase, series.id, 'success', `Successfully fetched ${series.id}`);
        }
      });
      
      // Wait for all promises in the current batch to resolve
      await Promise.all(batchPromises);
      
      // If this isn't the last batch, wait 60 seconds before the next batch
      if (i + 10 < SERIES_DATA.length) {
        console.log('Waiting 60 seconds before next batch...');
        await sleep(60000);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});