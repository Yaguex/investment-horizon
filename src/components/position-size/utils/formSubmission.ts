import { PositionSizeFormValues } from "../types"
import { supabase } from "@/integrations/supabase/client"

export const fetchMarketData = async (data: PositionSizeFormValues) => {
  console.log('[fetchMarketData] Starting to fetch market data for:', data)
  
  const isSpread = data.action.includes('spread')
  const isCall = data.action.toLowerCase().includes('call')
  const type = isCall ? 'call' : 'put'
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    console.log('[fetchMarketData] Current user:', user?.id)

    // Prepare strikes array based on action type
    const strikes = []
    
    // Always add entry strike
    strikes.push({
      ticker: data.ticker,
      expiration: data.expiration,
      type,
      strike: data.strike_entry
    })

    // Add exit strike for spreads
    if (isSpread && data.strike_exit) {
      strikes.push({
        ticker: data.ticker,
        expiration: data.expiration,
        type,
        strike: data.strike_exit
      })
    }

    const { data: marketData, error } = await supabase.functions.invoke('fetch_marketdata_api', {
      body: { strikes }
    })

    if (error) {
      console.error('[fetchMarketData] Error fetching market data:', error)
      throw new Error(`Failed to fetch market data: ${error.message}`)
    }

    if (marketData.error === "API failure") {
      console.error('[fetchMarketData] Market data API error: API failure')
      throw new Error("Function failure")
    }

    console.log('[fetchMarketData] Market data received:', marketData)
    return marketData
  } catch (error: any) {
    console.error('[fetchMarketData] Error in fetchMarketData:', error)
    throw new Error(`Failed to fetch market data: ${error.message}`)
  }
}