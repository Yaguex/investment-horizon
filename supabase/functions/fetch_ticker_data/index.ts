import { corsHeaders, generateOptionSymbol } from './utils.ts';
import { fetchOptionData } from './marketData.ts';
import { saveToDatabase } from './database.ts';
import { RequestBody } from './types.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

console.log("Fetch ticker data function initialized");

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ticker, expiration, strikes, profile_id } = await req.json() as RequestBody;
    console.log(`[${new Date().toISOString()}] Input data:`, { ticker, expiration, strikes, profile_id });

    const apiKey = Deno.env.get('MARKETDATA_API_KEY');
    if (!apiKey) {
      throw new Error('MARKETDATA_API_KEY not found');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not found');
    }
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Function to fetch data with retries
    const fetchDataWithRetries = async (symbol: string) => {
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`[${new Date().toISOString()}] Attempt ${attempt} for symbol: ${symbol}`);
          const marketData = await fetchOptionData(symbol, apiKey);
          if (marketData) {
            return { symbol, marketData };
          }
          
          if (attempt < 3) {
            console.log(`[${new Date().toISOString()}] Attempt ${attempt} failed, waiting 1 second before retry...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error(`[${new Date().toISOString()}] Error in attempt ${attempt}:`, error);
          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      return { symbol, marketData: null };
    };

    // Generate symbols and fetch data for all strikes with retries
    const entrySymbol = generateOptionSymbol(ticker, expiration, strikes.entry.type === 'call' ? 'C' : 'P', strikes.entry.strike);
    const targetSymbol = generateOptionSymbol(ticker, expiration, strikes.target.type === 'call' ? 'C' : 'P', strikes.target.strike);
    const protectionSymbol = generateOptionSymbol(ticker, expiration, strikes.protection.type === 'call' ? 'C' : 'P', strikes.protection.strike);

    const [entryData, targetData, protectionData] = await Promise.all([
      fetchDataWithRetries(entrySymbol),
      fetchDataWithRetries(targetSymbol),
      fetchDataWithRetries(protectionSymbol)
    ]);

    // Check if all API calls failed
    if (!entryData.marketData && !targetData.marketData && !protectionData.marketData) {
      console.error(`[${new Date().toISOString()}] All API queries failed after 3 attempts`);
      return new Response(
        JSON.stringify({ 
          error: "API query failed",
          timestamp: new Date().toISOString()
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const marketData = {
      entry: entryData,
      target: targetData,
      protection: protectionData
    };

    // Save to database
    const dbResult = await saveToDatabase(supabase, marketData, { 
      ticker, 
      expiration, 
      profile_id,
      strikes: {
        entry: strikes.entry.strike,
        target: strikes.target.strike,
        protection: strikes.protection.strike
      }
    });

    return new Response(
      JSON.stringify({
        marketData,
        dbOperation: dbResult,
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in fetch_ticker_data:`, error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack,
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});