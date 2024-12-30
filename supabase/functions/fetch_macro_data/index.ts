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
      console.log(`Attempting to fetch ${series_id} (attempt ${attempt}/${retries})`);
      console.log(`URL being called: ${url}`);
      
      const response = await fetch(url);
      console.log(`Response status for ${series_id}: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error response for ${series_id}:`, errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`Successfully fetched data for ${series_id}`);
      return data;
    } catch (error) {
      console.error(`Detailed error for ${series_id} (attempt ${attempt}):`, error);
      console.error(`Error stack trace:`, error.stack);
      
      if (attempt === retries) {
        const errorMessage = `Failed to fetch ${series_id} after ${retries} attempts. Last error: ${error.message}`;
        console.error(errorMessage);
        await logEvent(supabase, series_id, 'error', errorMessage);
        return null;
      }
      
      console.log(`Waiting 60 seconds before retry ${attempt + 1}...`);
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
    console.log('Starting macro data fetch process');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const fredApiKey = Deno.env.get('FRED_API_KEY')!;
    
    console.log('Environment variables retrieved successfully');
    console.log('FRED API Key length:', fredApiKey.length);
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Clean up existing data
    await supabase.from('macro_data').delete().neq('id', 0);
    await logEvent(supabase, 'ALL', 'info', 'Cleaned up existing data');
    console.log('Existing data cleaned up');

    // Process series in batches of 10
    for (let i = 0; i < SERIES_DATA.length; i += 10) {
      const batch = SERIES_DATA.slice(i, i + 10);
      console.log(`Processing batch ${Math.floor(i/10) + 1}/${Math.ceil(SERIES_DATA.length/10)}`);
      
      // Process each series in the current batch
      const batchPromises = batch.map(async (series) => {
        console.log(`Starting to process ${series.id}`);
        const data = await fetchSeriesData(supabase, series.id, fredApiKey);
        
        if (data && data.observations) {
          console.log(`Got ${data.observations.length} observations for ${series.id}`);
          
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
          
          const { error: insertError } = await supabase.from('macro_data').insert(insertData);
          if (insertError) {
            console.error(`Error inserting data for ${series.id}:`, insertError);
            await logEvent(supabase, series.id, 'error', `Insert failed: ${insertError.message}`);
          } else {
            console.log(`Successfully inserted ${last25.length} records for ${series.id}`);
            await logEvent(supabase, series.id, 'success', `Successfully fetched ${series.id}`);
          }
        }
      });
      
      // Wait for all promises in the current batch to resolve
      try {
        await Promise.all(batchPromises);
        console.log(`Batch ${Math.floor(i/10) + 1} completed successfully`);
      } catch (batchError) {
        console.error('Error processing batch:', batchError);
      }
      
      // If this isn't the last batch, wait 60 seconds before the next batch
      if (i + 10 < SERIES_DATA.length) {
        console.log('Waiting 60 seconds before next batch...');
        await sleep(60000);
      }
    }

    console.log('Macro data fetch process completed');
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Fatal error in macro data fetch process:', error);
    console.error('Error stack trace:', error.stack);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});