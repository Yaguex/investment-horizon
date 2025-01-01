import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders, formatExpirationDate, findOptionByStrike, processOptionData } from './utils.ts';
import { fetchOptionsChain } from './api.ts';

console.log("Test function initialized");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ticker, expiration, strike_entry, strike_target, strike_protection } = await req.json();
    console.log("Received parameters:", { ticker, expiration, strike_entry, strike_target, strike_protection });

    const apiKey = Deno.env.get('MARKETDATA_API_KEY');
    if (!apiKey) {
      throw new Error('MARKETDATA_API_KEY not found');
    }

    // Format the expiration date
    const formattedExpiration = formatExpirationDate(expiration);
    console.log("Formatted expiration:", formattedExpiration);

    // Fetch call options
    const callOptions = await fetchOptionsChain(
      ticker,
      formattedExpiration,
      'call',
      `${strike_entry},${strike_target}`,
      apiKey
    );
    console.log("Call options:", callOptions);

    // Fetch put options
    const putOptions = await fetchOptionsChain(
      ticker,
      formattedExpiration,
      'put',
      strike_protection,
      apiKey
    );
    console.log("Put options:", putOptions);

    // Process the data
    const responseData = {
      callOptions: {
        entry: processOptionData(
          findOptionByStrike(callOptions, parseFloat(strike_entry)),
          parseFloat(strike_entry)
        ),
        target: processOptionData(
          findOptionByStrike(callOptions, parseFloat(strike_target)),
          parseFloat(strike_target)
        )
      },
      putOptions: {
        protection: processOptionData(
          findOptionByStrike(putOptions, parseFloat(strike_protection)),
          parseFloat(strike_protection)
        )
      }
    };

    console.log("Final response data:", JSON.stringify(responseData, null, 2));
    
    return new Response(
      JSON.stringify(responseData),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error in test function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});