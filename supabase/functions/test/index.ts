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
        console.error(`HTTP error! status: ${response.status}`)
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log(`Raw API Response for ${url}:`, JSON.stringify(data, null, 2))
      return data
    } catch (error) {
      console.error(`Attempt ${attempt} failed for ${url}:`, error)
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
    console.log("Received parameters:", { ticker, expiration, strike_entry, strike_target, strike_protection })
    
    const apiKey = Deno.env.get('MARKETDATA_API_KEY')
    if (!apiKey) {
      throw new Error('MARKETDATA_API_KEY not found')
    }

    // Convert strike prices to numbers
    const strikeEntry = parseFloat(strike_entry)
    const strikeTarget = parseFloat(strike_target)
    const strikeProtection = parseFloat(strike_protection)

    console.log(`Processing request with parsed values:
      ticker: ${ticker}
      expiration: ${expiration}
      strikes: ${strikeEntry}, ${strikeTarget}, ${strikeProtection}
    `)

    // Convert date format from YYYY-MM-DD to YYMMDD
    const parsedDate = parse(expiration, 'yyyy-MM-dd', new Date())
    const formattedExpiration = format(parsedDate, 'yyMMdd')
    console.log(`Formatted expiration date: ${formattedExpiration}`)

    // Fetch stock quote
    const stockQuoteUrl = `https://api.marketdata.app/v1/stocks/quotes/${ticker}/`
    console.log("Fetching stock quote from:", stockQuoteUrl)
    const stockQuote = await fetchWithRetry(stockQuoteUrl, apiKey)
    console.log("Stock quote response:", stockQuote)

    // Fetch call options chain
    const callOptionsUrl = `https://api.marketdata.app/v1/options/chain/${ticker}/?expiration=${formattedExpiration}&side=call&strikeLimit=${strikeEntry},${strikeTarget}`
    console.log("Fetching call options from:", callOptionsUrl)
    const callOptions = await fetchWithRetry(callOptionsUrl, apiKey)
    console.log("Call options response:", callOptions)

    // Fetch put options chain
    const putOptionsUrl = `https://api.marketdata.app/v1/options/chain/${ticker}/?expiration=${formattedExpiration}&side=put&strikeLimit=${strikeProtection}`
    console.log("Fetching put options from:", putOptionsUrl)
    const putOptions = await fetchWithRetry(putOptionsUrl, apiKey)
    console.log("Put options response:", putOptions)

    const responseData = {
      stock: {
        mid: stockQuote?.data?.[0]?.mid || null
      },
      callOptions: {
        entry: {
          strike: strikeEntry,
          optionSymbol: null,
          mid: null,
          iv: null
        },
        target: {
          strike: strikeTarget,
          optionSymbol: null,
          mid: null,
          iv: null
        }
      },
      putOptions: {
        protection: {
          strike: strikeProtection,
          optionSymbol: null,
          mid: null,
          iv: null
        }
      }
    }

    // Process call options data with detailed logging
    if (callOptions?.data) {
      console.log("Processing call options data...")
      const entryOption = callOptions.data.find((opt: any) => {
        console.log(`Comparing option strike ${opt.strike} with entry strike ${strikeEntry}`)
        return parseFloat(opt.strike) === strikeEntry
      })
      const targetOption = callOptions.data.find((opt: any) => {
        console.log(`Comparing option strike ${opt.strike} with target strike ${strikeTarget}`)
        return parseFloat(opt.strike) === strikeTarget
      })

      if (entryOption) {
        console.log("Found entry option:", entryOption)
        responseData.callOptions.entry = {
          strike: strikeEntry,
          optionSymbol: entryOption.optionSymbol,
          mid: entryOption.mid,
          iv: entryOption.iv
        }
      } else {
        console.log(`No entry option found for strike ${strikeEntry}`)
      }

      if (targetOption) {
        console.log("Found target option:", targetOption)
        responseData.callOptions.target = {
          strike: strikeTarget,
          optionSymbol: targetOption.optionSymbol,
          mid: targetOption.mid,
          iv: targetOption.iv
        }
      } else {
        console.log(`No target option found for strike ${strikeTarget}`)
      }
    } else {
      console.log("No call options data available")
    }

    // Process put options data with detailed logging
    if (putOptions?.data) {
      console.log("Processing put options data...")
      const protectionOption = putOptions.data.find((opt: any) => {
        console.log(`Comparing option strike ${opt.strike} with protection strike ${strikeProtection}`)
        return parseFloat(opt.strike) === strikeProtection
      })

      if (protectionOption) {
        console.log("Found protection option:", protectionOption)
        responseData.putOptions.protection = {
          strike: strikeProtection,
          optionSymbol: protectionOption.optionSymbol,
          mid: protectionOption.mid,
          iv: protectionOption.iv
        }
      } else {
        console.log(`No protection option found for strike ${strikeProtection}`)
      }
    } else {
      console.log("No put options data available")
    }

    console.log("Final response data:", responseData)
    
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