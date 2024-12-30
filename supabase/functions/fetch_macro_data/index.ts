// Use relative import
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to sleep
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const logEvent = async (supabase: any, series_id: string, status: string, message: string) => {
  console.log(`[${new Date().toISOString()}] Logging event: ${status} - ${message}`);
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

// Helper function to fetch data for a single series with retries
async function fetchSeriesData(
  supabase: any,
  series_id: string,
  apiKey: string,
  retries = 3
): Promise<any> {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Starting fetch for series ${series_id}`);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${series_id}&api_key=${apiKey}&observation_start=2022-11-01&file_type=json`;
      console.log(`[${new Date().toISOString()}] Attempt ${attempt}/${retries} for ${series_id}`);
      console.log(`[${new Date().toISOString()}] Request URL: ${url.replace(apiKey, '[REDACTED]')}`);
      
      const response = await fetch(url);
      const responseTime = Date.now() - startTime;
      console.log(`[${new Date().toISOString()}] Response received for ${series_id} in ${responseTime}ms`);
      console.log(`[${new Date().toISOString()}] Response status: ${response.status}`);
      console.log(`[${new Date().toISOString()}] Response headers:`, Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[${new Date().toISOString()}] Error response for ${series_id}:`, errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`[${new Date().toISOString()}] Successfully fetched data for ${series_id}`);
      console.log(`[${new Date().toISOString()}] Data points received: ${data.observations?.length || 0}`);
      
      // Validate data structure
      if (!data.observations || !Array.isArray(data.observations)) {
        const errorMessage = `Invalid data structure received for ${series_id}`;
        console.error(`[${new Date().toISOString()}] ${errorMessage}`);
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error fetching ${series_id} (attempt ${attempt}):`, error);
      
      if (attempt === retries) {
        await logEvent(supabase, series_id, 'error', `Failed after ${retries} attempts: ${error.message}`);
        return null;
      }
      
      console.log(`[${new Date().toISOString()}] Waiting 20 seconds before retry...`);
      await sleep(20000); // 20 seconds between retries
    }
  }
}

Deno.serve(async (req) => {
  const requestStartTime = Date.now();
  console.log(`[${new Date().toISOString()}] Starting macro data fetch process`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
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
    
    console.log(`[${new Date().toISOString()}] Environment variables retrieved successfully`);
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Clean up existing data
    console.log(`[${new Date().toISOString()}] Starting data cleanup`);
    await supabase.from('macro_data').delete().neq('id', 0);
    await logEvent(supabase, 'ALL', 'info', 'Cleaned up existing data');
    console.log(`[${new Date().toISOString()}] Existing data cleaned up`);

    // Process series in smaller batches of 5
    for (let i = 0; i < SERIES_DATA.length; i += 5) {
      const batch = SERIES_DATA.slice(i, i + 5);
      const batchNumber = Math.floor(i/5) + 1;
      const totalBatches = Math.ceil(SERIES_DATA.length/5);
      console.log(`[${new Date().toISOString()}] Processing batch ${batchNumber}/${totalBatches}`);
      
      const batchPromises = batch.map(async (series) => {
        console.log(`[${new Date().toISOString()}] Starting to process ${series.id}`);
        const data = await fetchSeriesData(supabase, series.id, fredApiKey);
        
        if (data && data.observations) {
          const last25 = data.observations.slice(-25);
          console.log(`[${new Date().toISOString()}] Processing ${last25.length} observations for ${series.id}`);
          
          const insertData = last25.map((obs: any) => ({
            series_id: series.id,
            series_id_description: series.description,
            date: obs.date,
            value: obs.value,
            last_update: new Date().toISOString(),
          }));
          
          console.log(`[${new Date().toISOString()}] Inserting data for ${series.id}`);
          const { error: insertError } = await supabase.from('macro_data').insert(insertData);
          if (insertError) {
            console.error(`[${new Date().toISOString()}] Error inserting data for ${series.id}:`, insertError);
            await logEvent(supabase, series.id, 'error', `Insert failed: ${insertError.message}`);
          } else {
            console.log(`[${new Date().toISOString()}] Successfully inserted ${last25.length} records for ${series.id}`);
            await logEvent(supabase, series.id, 'success', `Successfully fetched and inserted ${last25.length} records`);
          }
        }
      });
      
      await Promise.all(batchPromises);
      console.log(`[${new Date().toISOString()}] Batch ${batchNumber} completed`);
      
      if (i + 5 < SERIES_DATA.length) {
        console.log(`[${new Date().toISOString()}] Waiting 5 seconds before next batch...`);
        await sleep(5000);
      }
    }

    const totalTime = Date.now() - requestStartTime;
    console.log(`[${new Date().toISOString()}] Macro data fetch process completed in ${totalTime}ms`);
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