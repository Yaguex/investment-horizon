import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function isThirdFriday(dateStr: string): boolean {
  const date = new Date(dateStr);
  
  // Count Fridays from the start of the month
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  let fridayCount = 0;
  
  // Find first Friday
  while (firstDay.getDay() !== 5) {
    firstDay.setDate(firstDay.getDate() + 1);
  }
  
  // Get third Friday
  const thirdFriday = new Date(firstDay);
  thirdFriday.setDate(firstDay.getDate() + 14); // Add two weeks
  
  // Compare with input date
  return date.getTime() === thirdFriday.getTime();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ticker } = await req.json();
    console.log(`Processing request for ticker: ${ticker}`);

    if (!ticker) {
      throw new Error('Ticker is required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if we have fresh data
    const { data: existingData } = await supabase
      .from('option_expirations')
      .select('*')
      .eq('ticker', ticker)
      .single();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (existingData?.last_updated && new Date(existingData.last_updated) >= today) {
      console.log(`Using cached data for ${ticker}`);
      return new Response(
        JSON.stringify({ expirations: existingData.expirations }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch new data from API
    console.log(`Fetching fresh data for ${ticker}`);
    const apiKey = Deno.env.get('MARKETDATA_API_KEY');
    if (!apiKey) {
      throw new Error('MARKETDATA_API_KEY not found');
    }

    const response = await fetch(
      `https://api.marketdata.app/v1/options/expirations/${ticker}/`,
      {
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const apiData = await response.json();
    console.log(`Received API response for ${ticker}:`, apiData);

    if (!apiData.expirations || !Array.isArray(apiData.expirations)) {
      throw new Error('Invalid API response format');
    }

    // Filter for third Fridays
    const thirdFridays = apiData.expirations.filter(isThirdFriday);
    console.log(`Filtered third Fridays for ${ticker}:`, thirdFridays);

    // Update database
    const { error: upsertError } = await supabase
      .from('option_expirations')
      .upsert({
        ticker,
        expirations: thirdFridays,
        last_updated: new Date().toISOString().split('T')[0]
      }, {
        onConflict: 'ticker'
      });

    if (upsertError) {
      console.error('Error upserting data:', upsertError);
      throw upsertError;
    }

    console.log(`Successfully processed ${ticker}`);
    return new Response(
      JSON.stringify({ expirations: thirdFridays }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
