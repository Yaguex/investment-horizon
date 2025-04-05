import { PositionSizeFormValues } from "../PositionSizeForm.tsx"
import { supabase } from "@/integrations/supabase/client"
import { getOptionTypes } from "./optionTypes"

export const fetchMarketData = async (data: PositionSizeFormValues) => {
  console.log('[fetchMarketData] Starting to fetch market data for:', data)
  
  const isSpread = data.action.includes('spread')
  const optionTypes = getOptionTypes(data.action)
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    console.log('[fetchMarketData] Current user:', user?.id)

    const { data: marketData, error } = await supabase.functions.invoke('fetch_ticker_data', {
      body: {
        ticker: data.ticker,
        expiration: data.expiration,
        strikes: {
          entry: {
            strike: data.strike_entry,
            type: optionTypes.entry
          },
          target: {
            strike: isSpread ? data.strike_exit : data.strike_entry,
            type: optionTypes.target
          },
          protection: {
            strike: data.strike_entry,
            type: optionTypes.protection
          }
        },
        profile_id: user?.id
      }
    })

    if (error) {
      console.error('[fetchMarketData] Error fetching market data:', error)
      throw new Error(`Failed to fetch market data: ${error.message}`)
    }

    console.log('[fetchMarketData] Market data received:', marketData)
    return marketData
  } catch (error: any) {
    console.error('[fetchMarketData] Error in fetchMarketData:', error)
    throw new Error(`Failed to fetch market data: ${error.message}`)
  }
}
