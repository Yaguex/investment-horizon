import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting one-time update of yearly ROI values')

    // Fetch all rows from trade_log
    const { data: trades, error: fetchError } = await supabaseClient
      .from('trade_log')
      .select('*')

    if (fetchError) {
      throw fetchError
    }

    console.log(`Found ${trades.length} trades to process`)

    // Process each trade
    for (const trade of trades) {
      const { roi, days_in_trade } = trade
      
      // Calculate yearly ROI
      let yearlyRoi = null
      if (roi !== null && days_in_trade !== null) {
        const effectiveDays = Math.max(1, days_in_trade) // Treat 0 days as 1 day
        yearlyRoi = Number((roi * (365 / effectiveDays)).toFixed(2))
      }

      // Update the trade
      const { error: updateError } = await supabaseClient
        .from('trade_log')
        .update({ roi_yearly: yearlyRoi })
        .eq('id', trade.id)

      if (updateError) {
        console.error(`Error updating trade ${trade.id}:`, updateError)
        continue
      }

      console.log(`Updated trade ${trade.id} with yearly ROI: ${yearlyRoi}`)
    }

    return new Response(
      JSON.stringify({ message: 'Yearly ROI update completed successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in update_yearly_roi function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})