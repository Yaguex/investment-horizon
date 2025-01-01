import { serve } from "https://deno.fresh.run/std@0.168.0/http/server.ts"
import { format } from "https://deno.land/x/date_fns@v2.22.1/format/index.js"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  ticker: string
  expiration: string
  strike_entry: number
  strike_target: number
  strike_protection: number
}

async function fetchWithRetry(url: string, apiKey: string, attempts = 3): Promise<any> {
  console.log(`Fetching ${url}`)
  
  for (let i = 0; i < attempts; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error)
      
      if (i === attempts - 1) {
        console.error(`All ${attempts} attempts failed for ${url}`)
        return null
      }
      
      // Wait 5 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('MARKETDATA_API_KEY')
    if (!apiKey) {
      throw new Error('MARKETDATA_API_KEY not found')
    }

    const { ticker, expiration, strike_entry, strike_target, strike_protection } = await req.json() as RequestBody
    
    // Convert date format from YYYY-MM-DD to MM/DD/YY
    const formattedExpiration = format(new Date(expiration), 'MM/dd/yy')
    
    // Fetch stock quote
    const stockQuote = await fetchWithRetry(
      `https://api.marketdata.app/v1/stocks/quotes/${ticker}/`,
      apiKey
    )
    
    // Fetch call options data
    const callOptions = await fetchWithRetry(
      `https://api.marketdata.app/v1/options/chain/${ticker}/?expiration=${formattedExpiration}&side=call&strikeLimit=3&strike=${strike_entry},${strike_target},${strike_protection}`,
      apiKey
    )
    
    // Fetch put options data
    const putOptions = await fetchWithRetry(
      `https://api.marketdata.app/v1/options/chain/${ticker}/?expiration=${formattedExpiration}&side=put&strikeLimit=3&strike=${strike_entry},${strike_target},${strike_protection}`,
      apiKey
    )

    const response = {
      stock: {
        mid: stockQuote?.mid,
      },
      options: {
        calls: callOptions?.data?.map((option: any) => ({
          strike: option.strike,
          optionSymbol: option.optionSymbol,
          mid: option.mid,
          iv: option.iv,
        })) || [],
        puts: putOptions?.data?.map((option: any) => ({
          strike: option.strike,
          optionSymbol: option.optionSymbol,
          mid: option.mid,
          iv: option.iv,
        })) || [],
      }
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})