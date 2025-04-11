
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from './utils.ts'

console.log("Submit DIY notes function initialized")

// Generate a unique transaction ID for tracing requests
function generateTransactionId(): string {
  return `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Function to log detailed information about steps in the process
async function logError(supabase: any, message: string, transactionId: string, details?: any) {
  try {
    console.error(`[${new Date().toISOString()}] [TXN:${transactionId}] ${message}`, details || '');
    
    // Insert error log into database for persistent tracking
    const { error } = await supabase
      .from('log_error')
      .insert([{
        function_id: 'submit_diy_notes',
        event_type: 'error',
        event_message: message,
        id_1: transactionId,
        timestamp: new Date().toISOString(),
        level: 'error'
      }]);

    if (error) {
      console.error(`[${new Date().toISOString()}] [TXN:${transactionId}] Failed to log error to database: ${error.message}`);
    }
  } catch (e) {
    console.error(`[${new Date().toISOString()}] [TXN:${transactionId}] Error while logging: ${e}`);
  }
}

Deno.serve(async (req) => {
  const transactionId = generateTransactionId();
  console.log(`[${new Date().toISOString()}] [submit_diy_notes] [TXN:${transactionId}] Received request: ${req.method} ${req.url}`);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const requestStartTime = Date.now();
    console.log(`[${new Date().toISOString()}] [submit_diy_notes] [TXN:${transactionId}] Starting to parse request body`);
    
    // Clone request to log raw body if needed
    const clonedReq = req.clone();
    let rawBody;
    try {
      rawBody = await clonedReq.text();
      console.log(`[${new Date().toISOString()}] [submit_diy_notes] [TXN:${transactionId}] Raw request body: ${rawBody}`);
    } catch (e) {
      console.error(`[${new Date().toISOString()}] [submit_diy_notes] [TXN:${transactionId}] Failed to read raw request body: ${e}`);
    }
    
    const { note, profile_id } = await req.json();
    console.log(`[${new Date().toISOString()}] [submit_diy_notes] [TXN:${transactionId}] Request parsing took ${Date.now() - requestStartTime}ms`);
    console.log(`[${new Date().toISOString()}] [submit_diy_notes] [TXN:${transactionId}] Processing note submission for profile ${profile_id}:`, note);
    
    // Log data types for critical fields
    console.log(`[${new Date().toISOString()}] [submit_diy_notes] [TXN:${transactionId}] Data types check: 
      - note type: ${typeof note}
      - note.strike_entry: ${note.strike_entry} (${typeof note.strike_entry})
      - note.strike_target: ${note.strike_target} (${typeof note.strike_target})
      - note.strike_protection: ${note.strike_protection} (${typeof note.strike_protection})
    `);

    // Initialize Supabase client
    const initStartTime = Date.now();
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    if (!supabaseUrl || !supabaseKey) {
      const errorMsg = 'Missing Supabase credentials';
      await logError(null, errorMsg, transactionId);
      throw new Error(errorMsg);
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    console.log(`[${new Date().toISOString()}] [submit_diy_notes] [TXN:${transactionId}] Supabase client initialization took ${Date.now() - initStartTime}ms`);

    // Step 1: If updating an existing note, first delete the record
    if (note.id) {
      console.log(`[${new Date().toISOString()}] [submit_diy_notes] [TXN:${transactionId}] Deleting existing note with ID ${note.id}`)
      const deleteStartTime = Date.now();
      const { error: deleteError } = await supabase
        .from('diy_notes')
        .delete()
        .eq('id', note.id)
      
      if (deleteError) {
        await logError(supabase, `Error deleting existing note: ${deleteError.message}`, transactionId, deleteError);
        throw deleteError
      }
      console.log(`[${new Date().toISOString()}] [submit_diy_notes] [TXN:${transactionId}] Delete operation took ${Date.now() - deleteStartTime}ms`);
    }

    // Step 2: Insert new note record
    console.log(`[${new Date().toISOString()}] [submit_diy_notes] [TXN:${transactionId}] Inserting new note record`)
    const insertStartTime = Date.now();
    const { data: savedNote, error: saveError } = await supabase
      .from('diy_notes')
      .insert([{ 
        ...note, 
        profile_id,
        id: note.id // Keep the same ID if it was an update
      }])
      .select()
      .single()

    if (saveError) {
      await logError(supabase, `Error saving note: ${saveError.message}`, transactionId, saveError);
      throw saveError
    }
    console.log(`[${new Date().toISOString()}] [submit_diy_notes] [TXN:${transactionId}] Insert operation took ${Date.now() - insertStartTime}ms`);
    console.log(`[${new Date().toISOString()}] [submit_diy_notes] [TXN:${transactionId}] Saved note ID: ${savedNote?.id}`);

    // Step 3: Validate required fields and prepare market data request
    if (!note.ticker || !note.expiration) {
      console.log(`[${new Date().toISOString()}] [submit_diy_notes] [TXN:${transactionId}] Missing required fields for market data`)
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 4: Prepare strikes array
    console.log(`[${new Date().toISOString()}] [submit_diy_notes] [TXN:${transactionId}] Preparing strikes for market data fetch:`, {
      strike_entry: note.strike_entry,
      strike_target: note.strike_target,
      strike_protection: note.strike_protection
    });

    const strikes = []

    // Apply explicit Number conversion and validation for strike_entry
    if (note.strike_entry !== null && note.strike_entry !== undefined) {
      const numericStrikeEntry = Number(note.strike_entry);
      if (isNaN(numericStrikeEntry) || numericStrikeEntry <= 0) {
        await logError(supabase, `Invalid strike_entry value: ${note.strike_entry}`, transactionId);
        console.error(`[${new Date().toISOString()}] [submit_diy_notes] [TXN:${transactionId}] Invalid strike_entry value: ${note.strike_entry}, converted to: ${numericStrikeEntry}`);
      } else {
        console.log(`[${new Date().toISOString()}] [submit_diy_notes] [TXN:${transactionId}] Adding entry strike: ${numericStrikeEntry} (original: ${note.strike_entry}, type: ${typeof note.strike_entry})`);
        strikes.push({
          ticker: note.ticker,
          expiration: note.expiration,
          type: 'call',
          strike: numericStrikeEntry
        });
      }
    }

    // Apply explicit Number conversion and validation for strike_target
    if (note.strike_target !== null && note.strike_target !== undefined) {
      const numericStrikeTarget = Number(note.strike_target);
      if (isNaN(numericStrikeTarget) || numericStrikeTarget <= 0) {
        await logError(supabase, `Invalid strike_target value: ${note.strike_target}`, transactionId);
        console.error(`[${new Date().toISOString()}] [submit_diy_notes] [TXN:${transactionId}] Invalid strike_target value: ${note.strike_target}, converted to: ${numericStrikeTarget}`);
      } else {
        console.log(`[${new Date().toISOString()}] [submit_diy_notes] [TXN:${transactionId}] Adding target strike: ${numericStrikeTarget} (original: ${note.strike_target}, type: ${typeof note.strike_target})`);
        strikes.push({
          ticker: note.ticker,
          expiration: note.expiration,
          type: 'call',
          strike: numericStrikeTarget
        });
      }
    }

    // Apply explicit Number conversion and validation for strike_protection
    if (note.strike_protection !== null && note.strike_protection !== undefined) {
      const numericStrikeProtection = Number(note.strike_protection);
      if (isNaN(numericStrikeProtection) || numericStrikeProtection <= 0) {
        await logError(supabase, `Invalid strike_protection value: ${note.strike_protection}`, transactionId);
        console.error(`[${new Date().toISOString()}] [submit_diy_notes] [TXN:${transactionId}] Invalid strike_protection value: ${note.strike_protection}, converted to: ${numericStrikeProtection}`);
      } else {
        console.log(`[${new Date().toISOString()}] [submit_diy_notes] [TXN:${transactionId}] Adding protection strike: ${numericStrikeProtection} (original: ${note.strike_protection}, type: ${typeof note.strike_protection})`);
        strikes.push({
          ticker: note.ticker,
          expiration: note.expiration,
          type: 'put',
          strike: numericStrikeProtection
        });
      }
    }

    if (strikes.length === 0) {
      console.log(`[${new Date().toISOString()}] [submit_diy_notes] [TXN:${transactionId}] No valid strikes to process`)
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log the final strikes array that will be sent
    console.log(`[${new Date().toISOString()}] [submit_diy_notes] [TXN:${transactionId}] Final strikes array:`, JSON.stringify(strikes));

    // Step 5: Fetch market data
    console.log(`[${new Date().toISOString()}] [submit_diy_notes] [TXN:${transactionId}] Fetching market data for strikes:`, strikes)
    const apiStartTime = Date.now();
    const requestBody = { 
      strikes,
      callerTransactionId: transactionId // Pass the transaction ID to the fetch_marketdata_api function
    };
    
    console.log(`[${new Date().toISOString()}] [submit_diy_notes] [TXN:${transactionId}] Request body for fetch_marketdata_api:`, JSON.stringify(requestBody));
    
    const { data: marketData, error: marketDataError } = await supabase.functions.invoke('fetch_marketdata_api', {
      body: requestBody
    });
    
    console.log(`[${new Date().toISOString()}] [submit_diy_notes] [TXN:${transactionId}] Market data API call took ${Date.now() - apiStartTime}ms`);

    if (marketDataError) {
      await logError(supabase, `Market data API error: ${marketDataError.message}`, transactionId, marketDataError);
      throw new Error(`Market data API error: ${marketDataError.message}`);
    }

    if (marketData && marketData.error === "API failure") {
      await logError(supabase, `Market data API failure`, transactionId, marketData);
      throw new Error("Function failure");
    }

    if (!marketData || !marketData.responses) {
      await logError(supabase, `Market data API returned null or invalid response`, transactionId, { marketData });
      throw new Error("Invalid market data response");
    }

    console.log(`[${new Date().toISOString()}] [submit_diy_notes] [TXN:${transactionId}] Received market data:`, marketData);
    console.log(`[${new Date().toISOString()}] [submit_diy_notes] [TXN:${transactionId}] Number of responses received: ${marketData.responses?.length || 0}`);

    // Step 6: Update note with market data using Position Size's methodology
    console.log(`[${new Date().toISOString()}] [submit_diy_notes] [TXN:${transactionId}] Updating note with market data`)
    const updateData: any = {}

    // Handle entry strike data if present
    if (note.strike_entry && marketData.responses?.[0]) {
      updateData.underlying_price = marketData.responses[0]?.marketData?.underlyingPrice || null
      updateData.strike_entry_mid = marketData.responses[0]?.marketData?.mid || null
      updateData.strike_entry_open_interest = marketData.responses[0]?.marketData?.openInterest || null
      updateData.strike_entry_iv = marketData.responses[0]?.marketData?.iv || null
      updateData.strike_entry_delta = marketData.responses[0]?.marketData?.delta || null
      updateData.strike_entry_intrinsic_value = marketData.responses[0]?.marketData?.intrinsicValue || null
      updateData.strike_entry_extrinsic_value = marketData.responses[0]?.marketData?.extrinsicValue || null
    }

    // Handle target strike data if present
    if (note.strike_target && marketData.responses?.[1]) {
      updateData.strike_target_mid = marketData.responses[1]?.marketData?.mid || null
      updateData.strike_target_open_interest = marketData.responses[1]?.marketData?.openInterest || null
      updateData.strike_target_iv = marketData.responses[1]?.marketData?.iv || null
      updateData.strike_target_delta = marketData.responses[1]?.marketData?.delta || null
      updateData.strike_target_intrinsic_value = marketData.responses[1]?.marketData?.intrinsicValue || null
      updateData.strike_target_extrinsic_value = marketData.responses[1]?.marketData?.extrinsicValue || null
    }

    // Handle protection strike data if present
    if (note.strike_protection && marketData.responses?.[2]) {
      updateData.strike_protection_mid = marketData.responses[2]?.marketData?.mid || null
      updateData.strike_protection_open_interest = marketData.responses[2]?.marketData?.openInterest || null
      updateData.strike_protection_iv = marketData.responses[2]?.marketData?.iv || null
      updateData.strike_protection_delta = marketData.responses[2]?.marketData?.delta || null
      updateData.strike_protection_intrinsic_value = marketData.responses[2]?.marketData?.intrinsicValue || null
      updateData.strike_protection_extrinsic_value = marketData.responses[2]?.marketData?.extrinsicValue || null
    }

    // Log the update data before attempting to update the database
    console.log(`[${new Date().toISOString()}] [submit_diy_notes] [TXN:${transactionId}] Update data to be written to database:`, updateData);
    const hasNullValues = Object.values(updateData).every(value => value === null);
    if (hasNullValues) {
      await logError(supabase, `All market data values are null`, transactionId, { updateData });
    }

    const updateStartTime = Date.now();
    const { error: updateError } = await supabase
      .from('diy_notes')
      .update(updateData)
      .eq('id', savedNote.id)

    if (updateError) {
      await logError(supabase, `Error updating note with market data: ${updateError.message}`, transactionId, updateError);
      throw updateError
    }
    console.log(`[${new Date().toISOString()}] [submit_diy_notes] [TXN:${transactionId}] Update operation took ${Date.now() - updateStartTime}ms`);

    // Verify the update by fetching the updated record
    const { data: verifiedNote, error: verifyError } = await supabase
      .from('diy_notes')
      .select('*')
      .eq('id', savedNote.id)
      .single();

    if (verifyError) {
      await logError(supabase, `Error verifying updated note: ${verifyError.message}`, transactionId, verifyError);
    } else {
      console.log(`[${new Date().toISOString()}] [submit_diy_notes] [TXN:${transactionId}] Verified updated note:`, verifiedNote);
      
      // Check if any expected fields are null or missing
      const criticalFields = [
        'underlying_price', 
        'strike_entry_mid', 
        'strike_target_mid', 
        'strike_protection_mid'
      ];
      
      const missingFields = criticalFields.filter(field => 
        updateData[field] !== undefined && updateData[field] !== null && 
        (verifiedNote[field] === null || verifiedNote[field] === undefined)
      );
      
      if (missingFields.length > 0) {
        await logError(supabase, `Market data update verification failed - missing fields in saved record`, transactionId, {
          missingFields,
          expected: missingFields.reduce((acc, field) => ({...acc, [field]: updateData[field]}), {}),
          actual: missingFields.reduce((acc, field) => ({...acc, [field]: verifiedNote[field]}), {})
        });
      }
    }

    console.log(`[${new Date().toISOString()}] [submit_diy_notes] [TXN:${transactionId}] Successfully processed note submission`);
    return new Response(
      JSON.stringify({ 
        success: true,
        transactionId 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error(`[${new Date().toISOString()}] [submit_diy_notes] [TXN:${transactionId}] Error:`, error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        transactionId 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
