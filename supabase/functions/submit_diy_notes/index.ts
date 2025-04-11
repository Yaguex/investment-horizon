
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from './utils.ts'

console.log("Submit DIY notes function initialized")

// Generate a unique transaction ID for request tracking
function generateTransactionId() {
  return `tx-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

// Log detailed messages with transaction ID for tracing
function logWithTransaction(txId: string, message: string, data?: any) {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] [TxID: ${txId}] ${message}`
  
  console.log(logMessage)
  if (data) {
    console.log(`[${timestamp}] [TxID: ${txId}] Data:`, data)
  }
  
  return { timestamp, txId, message, data }
}

// Save log entry to database for persistent tracking
async function saveLogToDB(supabase: any, level: string, txId: string, message: string, data?: any) {
  try {
    const { error } = await supabase
      .from('log_error')
      .insert([{ 
        level,
        id_1: txId,
        function_id: 'submit_diy_notes',
        event_message: message,
        event_type: 'api_request',
        timestamp: new Date().toISOString()
      }])
    
    if (error) {
      console.error(`[${new Date().toISOString()}] Error saving log to database:`, error)
    }
  } catch (e) {
    console.error(`[${new Date().toISOString()}] Exception saving log to database:`, e)
  }
}

Deno.serve(async (req) => {
  // Generate unique transaction ID for request tracing
  const txId = generateTransactionId()
  logWithTransaction(txId, "New request received")
  
  if (req.method === 'OPTIONS') {
    logWithTransaction(txId, "Handling OPTIONS request")
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const startTime = Date.now()
    const requestBody = await req.json()
    logWithTransaction(txId, "Request body parsed", { 
      profile_id: requestBody.profile_id,
      note_id: requestBody.note?.id || 'new',
      ticker: requestBody.note?.ticker,
      hasStrikeEntry: !!requestBody.note?.strike_entry,
      hasStrikeTarget: !!requestBody.note?.strike_target,
      hasStrikeProtection: !!requestBody.note?.strike_protection
    })

    const { note, profile_id } = requestBody
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    await saveLogToDB(supabase, 'info', txId, 'Processing note submission', {
      ticker: note.ticker,
      expiration: note.expiration
    })

    // Step 1: If updating an existing note, first delete the record
    if (note.id) {
      logWithTransaction(txId, `Deleting existing note with ID ${note.id}`)
      const { error: deleteError } = await supabase
        .from('diy_notes')
        .delete()
        .eq('id', note.id)
      
      if (deleteError) {
        const errorMsg = `Error deleting existing note: ${deleteError.message}`
        logWithTransaction(txId, errorMsg, deleteError)
        await saveLogToDB(supabase, 'error', txId, errorMsg, deleteError)
        throw deleteError
      }
      
      logWithTransaction(txId, `Successfully deleted note with ID ${note.id}`)
    }

    // Step 2: Insert new note record
    logWithTransaction(txId, "Inserting new note record")
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
      const errorMsg = `Error saving note: ${saveError.message}`
      logWithTransaction(txId, errorMsg, saveError)
      await saveLogToDB(supabase, 'error', txId, errorMsg, saveError)
      throw saveError
    }

    logWithTransaction(txId, `Successfully saved note with ID ${savedNote.id}`)

    // Step 3: Validate required fields and prepare market data request
    if (!note.ticker || !note.expiration) {
      const skipMsg = "Missing required fields for market data, skipping market data fetch"
      logWithTransaction(txId, skipMsg)
      await saveLogToDB(supabase, 'warn', txId, skipMsg)
      
      return new Response(
        JSON.stringify({ success: true, txId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 4: Prepare strikes array
    logWithTransaction(txId, "Preparing strikes for market data fetch", {
      strike_entry: note.strike_entry,
      strike_target: note.strike_target,
      strike_protection: note.strike_protection
    })

    const strikes = []

    if (note.strike_entry) {
      strikes.push({
        ticker: note.ticker,
        expiration: note.expiration,
        type: 'call',
        strike: note.strike_entry
      })
    }

    if (note.strike_target) {
      strikes.push({
        ticker: note.ticker,
        expiration: note.expiration,
        type: 'call',
        strike: note.strike_target
      })
    }

    if (note.strike_protection) {
      strikes.push({
        ticker: note.ticker,
        expiration: note.expiration,
        type: 'put',
        strike: note.strike_protection
      })
    }

    if (strikes.length === 0) {
      const skipMsg = "No valid strikes to process, skipping market data fetch"
      logWithTransaction(txId, skipMsg)
      await saveLogToDB(supabase, 'warn', txId, skipMsg)
      
      return new Response(
        JSON.stringify({ success: true, txId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 5: Fetch market data
    logWithTransaction(txId, "Invoking fetch_marketdata_api function", { strikes })
    await saveLogToDB(supabase, 'info', txId, 'Invoking market data API', { strikeCount: strikes.length })
    
    const marketDataStartTime = Date.now()
    const { data: marketData, error: marketDataError } = await supabase.functions.invoke('fetch_marketdata_api', {
      body: { 
        strikes,
        txId // Pass transaction ID to connect logs
      }
    })
    const marketDataDuration = Date.now() - marketDataStartTime
    
    logWithTransaction(txId, `Market data API response received in ${marketDataDuration}ms`)
    
    if (marketDataError) {
      const errorMsg = `Market data API error: ${marketDataError}`
      logWithTransaction(txId, errorMsg, marketDataError)
      await saveLogToDB(supabase, 'error', txId, errorMsg, marketDataError)
      throw new Error(errorMsg)
    }
    
    if (marketData.error === "API failure") {
      const errorMsg = "Market data API failure reported"
      logWithTransaction(txId, errorMsg, marketData)
      await saveLogToDB(supabase, 'error', txId, errorMsg, marketData)
      throw new Error("Function failure")
    }

    logWithTransaction(txId, "Market data API response processed successfully", { 
      responseCount: marketData.responses?.length || 0,
      hasNullResponses: marketData.responses?.some(r => r === null) || false
    })

    // Step 6: Update note with market data using Position Size's methodology
    logWithTransaction(txId, "Updating note with market data")
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

    logWithTransaction(txId, "Prepared update data for database", { 
      updateFields: Object.keys(updateData),
      hasUnderlyingPrice: !!updateData.underlying_price,
      entryDataPresent: !!updateData.strike_entry_mid,
      targetDataPresent: !!updateData.strike_target_mid,
      protectionDataPresent: !!updateData.strike_protection_mid
    })

    if (Object.keys(updateData).length === 0) {
      const warnMsg = "No market data fields to update"
      logWithTransaction(txId, warnMsg)
      await saveLogToDB(supabase, 'warn', txId, warnMsg)
    } else {
      const { error: updateError } = await supabase
        .from('diy_notes')
        .update(updateData)
        .eq('id', savedNote.id)

      if (updateError) {
        const errorMsg = `Error updating note with market data: ${updateError.message}`
        logWithTransaction(txId, errorMsg, updateError)
        await saveLogToDB(supabase, 'error', txId, errorMsg, updateError)
        throw updateError
      }

      logWithTransaction(txId, `Successfully updated note ${savedNote.id} with market data`)
      await saveLogToDB(supabase, 'info', txId, 'Successfully updated note with market data', {
        noteId: savedNote.id,
        fieldCount: Object.keys(updateData).length
      })
    }

    const totalDuration = Date.now() - startTime
    logWithTransaction(txId, `Successfully processed note submission in ${totalDuration}ms`)
    return new Response(
      JSON.stringify({ success: true, txId, duration: totalDuration }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    const errorMsg = `Error processing request: ${error.message}`
    logWithTransaction(txId, errorMsg, error)
    
    return new Response(
      JSON.stringify({ error: error.message, txId }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
