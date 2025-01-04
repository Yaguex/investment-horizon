import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function formatDateForPostgres(dateStr: string): string {
  // Convert from DD-MM-YYYY to YYYY-MM-DD
  const [day, month, year] = dateStr.split('-');
  return `${year}-${month}-${day}`;
}

async function fetchOptionData(symbol: string, apiKey: string, retries = 3): Promise<any> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const url = `https://api.marketdata.app/v1/options/quotes/${symbol}/`;
      console.log(`[${new Date().toISOString()}] Making request to MarketData API for symbol: ${symbol}`);
      console.log(`[${new Date().toISOString()}] Attempting to fetch data from: ${url} (attempt ${attempt})`);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Token ${apiKey}`,
        }
      });

      console.log(`[${new Date().toISOString()}] Response status:`, response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`[${new Date().toISOString()}] Raw API response data:`, JSON.stringify(data, null, 2));
      
      if (data.s === 'ok' && data.mid && data.mid.length > 0) {
        console.log(`[${new Date().toISOString()}] Processing data:`, {
          status: data.s,
          hasMid: !!data.mid,
          midLength: data.mid?.length,
          midValue: data.mid?.[0],
          openInterest: data.openInterest?.[0],
          iv: data.iv?.[0],
          delta: data.delta?.[0]
        });

        return {
          mid: Number(data.mid[0]).toFixed(2),
          openInterest: data.openInterest[0],
          iv: Math.round(data.iv[0] * 100),
          delta: Number(data.delta[0]).toFixed(2),
          intrinsicValue: Number(data.intrinsicValue[0]).toFixed(2),
          extrinsicValue: Number(data.extrinsicValue[0]).toFixed(2)
        };
      }
      
      console.log(`[${new Date().toISOString()}] No valid data found for symbol: ${symbol}. Data validation failed:`, {
        status: data.s,
        hasMid: !!data.mid,
        midLength: data.mid?.length
      });
      return null;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in attempt ${attempt}:`, error);
      if (attempt === retries) {
        console.error(`[${new Date().toISOString()}] Failed to fetch data after ${retries} attempts:`, error);
        return null;
      }
      console.log(`[${new Date().toISOString()}] Waiting 5 seconds before retry...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  return null;
}

function generateOptionSymbol(ticker: string, expiration: string, type: string, strike: number): string {
  // Parse the date string (DD-MM-YYYY) into parts
  const [day, month, year] = expiration.split('-').map(Number);
  
  // Format the date parts for the symbol
  const yearStr = year.toString().slice(-2);
  const monthStr = month.toString().padStart(2, '0');
  const dayStr = day.toString().padStart(2, '0');
  
  // Generate option symbol (Format: SPY260116C00585000)
  const optionType = type.toUpperCase().charAt(0);
  const strikeStr = (strike * 1000).toString().padStart(8, '0');
  
  const symbol = `${ticker.toUpperCase()}${yearStr}${monthStr}${dayStr}${optionType}${strikeStr}`;
  console.log(`[${new Date().toISOString()}] Generated symbol: ${symbol} for strike: ${strike}`);
  return symbol;
}

async function saveToDatabase(supabase: any, marketData: any, userData: any) {
  const { ticker, expiration, profile_id } = userData;
  const formattedExpiration = formatDateForPostgres(expiration);
  
  try {
    console.log(`[${new Date().toISOString()}] Attempting database operation with formatted date: ${formattedExpiration}`);
    
    // Check if record exists
    const { data: existingRecord } = await supabase
      .from('diy_notes')
      .select('id')
      .eq('ticker', ticker)
      .eq('expiration', formattedExpiration)
      .eq('profile_id', profile_id)
      .single();

    const dbOperation = existingRecord ? 
      // Update existing record
      supabase
        .from('diy_notes')
        .update({
          strike_entry: userData.strikes.entry,
          strike_target: userData.strikes.target,
          strike_protection: userData.strikes.protection,
          strike_entry_mid: marketData.entry.marketData?.mid,
          strike_entry_open_interest: marketData.entry.marketData?.openInterest,
          strike_entry_iv: marketData.entry.marketData?.iv,
          strike_entry_delta: marketData.entry.marketData?.delta,
          strike_entry_intrinsic_value: marketData.entry.marketData?.intrinsicValue,
          strike_entry_extrinsic_value: marketData.entry.marketData?.extrinsicValue,
          strike_target_mid: marketData.target.marketData?.mid,
          strike_target_open_interest: marketData.target.marketData?.openInterest,
          strike_target_iv: marketData.target.marketData?.iv,
          strike_target_delta: marketData.target.marketData?.delta,
          strike_target_intrinsic_value: marketData.target.marketData?.intrinsicValue,
          strike_target_extrinsic_value: marketData.target.marketData?.extrinsicValue,
          strike_protection_mid: marketData.protection.marketData?.mid,
          strike_protection_open_interest: marketData.protection.marketData?.openInterest,
          strike_protection_iv: marketData.protection.marketData?.iv,
          strike_protection_delta: marketData.protection.marketData?.delta,
          strike_protection_intrinsic_value: marketData.protection.marketData?.intrinsicValue,
          strike_protection_extrinsic_value: marketData.protection.marketData?.extrinsicValue,
        })
        .eq('id', existingRecord.id) :
      // Insert new record
      supabase
        .from('diy_notes')
        .insert([{
          profile_id,
          ticker,
          expiration: formattedExpiration,
          strike_entry: userData.strikes.entry,
          strike_target: userData.strikes.target,
          strike_protection: userData.strikes.protection,
          strike_entry_mid: marketData.entry.marketData?.mid,
          strike_entry_open_interest: marketData.entry.marketData?.openInterest,
          strike_entry_iv: marketData.entry.marketData?.iv,
          strike_entry_delta: marketData.entry.marketData?.delta,
          strike_entry_intrinsic_value: marketData.entry.marketData?.intrinsicValue,
          strike_entry_extrinsic_value: marketData.entry.marketData?.extrinsicValue,
          strike_target_mid: marketData.target.marketData?.mid,
          strike_target_open_interest: marketData.target.marketData?.openInterest,
          strike_target_iv: marketData.target.marketData?.iv,
          strike_target_delta: marketData.target.marketData?.delta,
          strike_target_intrinsic_value: marketData.target.marketData?.intrinsicValue,
          strike_target_extrinsic_value: marketData.target.marketData?.extrinsicValue,
          strike_protection_mid: marketData.protection.marketData?.mid,
          strike_protection_open_interest: marketData.protection.marketData?.openInterest,
          strike_protection_iv: marketData.protection.marketData?.iv,
          strike_protection_delta: marketData.protection.marketData?.delta,
          strike_protection_intrinsic_value: marketData.protection.marketData?.intrinsicValue,
          strike_protection_extrinsic_value: marketData.protection.marketData?.extrinsicValue,
        }]);

    const { error } = await dbOperation;
    console.log(`[${new Date().toISOString()}] Database operation completed:`, error ? 'Error' : 'Success');
    if (error) console.error(`[${new Date().toISOString()}] Database error:`, error);
    
    return { success: !error, error };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Database operation failed:`, error);
    return { success: false, error };
  }
}

Deno.serve(async (req) => {
  console.log(`[${new Date().toISOString()}] Received request`);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ticker, expiration, type, strikes, profile_id } = await req.json();
    console.log(`[${new Date().toISOString()}] Input data:`, { ticker, expiration, type, strikes, profile_id });

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

    // Generate symbols and fetch data for all strikes in parallel
    const [entryData, targetData, protectionData] = await Promise.all([
      (async () => {
        const symbol = generateOptionSymbol(ticker, expiration, type, strikes.entry);
        const marketData = await fetchOptionData(symbol, apiKey);
        return { symbol, marketData };
      })(),
      (async () => {
        const symbol = generateOptionSymbol(ticker, expiration, type, strikes.target);
        const marketData = await fetchOptionData(symbol, apiKey);
        return { symbol, marketData };
      })(),
      (async () => {
        const symbol = generateOptionSymbol(ticker, expiration, type, strikes.protection);
        const marketData = await fetchOptionData(symbol, apiKey);
        return { symbol, marketData };
      })()
    ]);

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
      strikes 
    });

    console.log(`[${new Date().toISOString()}] Database operation result:`, dbResult);

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
