import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { format, parse } from "https://esm.sh/date-fns@3.3.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log("Test function initialized")

async function fetchWithRetry(url: string, apiKey: string, retries = 3): Promise<any> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Attempting to fetch ${url} (attempt ${attempt}/${retries})`)
      const response = await fetch(url, {
        headers: {
          'Authorization': `Token ${apiKey}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error)
      if (attempt === retries) {
        console.log(`All ${retries} attempts failed for ${url}`)
        return null
      }
      await new Promise(resolve => setTimeout(resolve, 5000)) // 5 second pause
    }
  }
}

serve(async (req) => {
  console.log("Test function received request:", req.method)
  
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request")
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { ticker, expiration, strike_entry, strike_target, strike_protection } = await req.json()
    const apiKey = Deno.env.get('MARKETDATA_API_KEY')

    if (!apiKey) {
      throw new Error('MARKETDATA_API_KEY not found')
    }

    console.log(`Processing request for ticker: ${ticker}, expiration: ${expiration}`)

    // Convert date format from YYYY-MM-DD to MM/DD/YY
    const formattedExpiration = format(
      parse(expiration, 'yyyy-MM-dd', new Date()),
      'MM/dd/yy'
    )

    // Fetch stock quote
    const stockQuote = await fetchWithRetry(
      `https://api.marketdata.app/v1/stocks/quotes/${ticker}/`,
      apiKey
    )

    // Fetch call options chain
    const callOptions = await fetchWithRetry(
      `https://api.marketdata.app/v1/options/chain/${ticker}/?expiration=${formattedExpiration}&side=call&strikeLimit=${strike_entry},${strike_target}`,
      apiKey
    )

    // Fetch put options chain
    const putOptions = await fetchWithRetry(
      `https://api.marketdata.app/v1/options/chain/${ticker}/?expiration=${formattedExpiration}&side=put&strikeLimit=${strike_protection}`,
      apiKey
    )

    const responseData = {
      stock: {
        mid: stockQuote?.mid || null
      },
      callOptions: {
        entry: {
          strike: strike_entry,
          optionSymbol: null,
          mid: null,
          iv: null
        },
        target: {
          strike: strike_target,
          optionSymbol: null,
          mid: null,
          iv: null
        }
      },
      putOptions: {
        protection: {
          strike: strike_protection,
          optionSymbol: null,
          mid: null,
          iv: null
        }
      }
    }

    // Process call options data
    if (callOptions?.data) {
      const entryOption = callOptions.data.find((opt: any) => opt.strike === strike_entry)
      const targetOption = callOptions.data.find((opt: any) => opt.strike === strike_target)

      if (entryOption) {
        responseData.callOptions.entry = {
          strike: strike_entry,
          optionSymbol: entryOption.optionSymbol,
          mid: entryOption.mid,
          iv: entryOption.iv
        }
      }

      if (targetOption) {
        responseData.callOptions.target = {
          strike: strike_target,
          optionSymbol: targetOption.optionSymbol,
          mid: targetOption.mid,
          iv: targetOption.iv
        }
      }
    }

    // Process put options data
    if (putOptions?.data) {
      const protectionOption = putOptions.data.find((opt: any) => opt.strike === strike_protection)

      if (protectionOption) {
        responseData.putOptions.protection = {
          strike: strike_protection,
          optionSymbol: protectionOption.optionSymbol,
          mid: protectionOption.mid,
          iv: protectionOption.iv
        }
      }
    }

    console.log("Sending response:", responseData)
    
    return new Response(
      JSON.stringify(responseData),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    )
  } catch (error) {
    console.error("Error in test function:", error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    )
  }
})