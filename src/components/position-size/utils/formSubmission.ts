import { PositionSizeFormValues } from "../types"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
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

export const handleFormSubmission = async (data: PositionSizeFormValues, note?: any) => {
  try {
    console.log('[handleFormSubmission] Starting form submission with data:', data)
    
    const { data: { user } } = await supabase.auth.getUser()
    console.log('[handleFormSubmission] Current user:', user?.id)
    
    if (!user) {
      console.error('[handleFormSubmission] No authenticated user found')
      toast.error('User not authenticated')
      return
    }

    let marketData
    if (data.ticker && data.expiration && data.strike_entry) {
      try {
        marketData = await fetchMarketData(data)
        console.log('[handleFormSubmission] Market data fetched successfully:', marketData)
      } catch (error: any) {
        console.error('[handleFormSubmission] Failed to fetch market data:', error)
        toast.error(`Failed to fetch market data: ${error.message}`)
        return
      }
    }

    const formDataToSave = {
      ...data,
      expiration: data.expiration || null,
      action: data.action || null,
      ticker: data.ticker || null,
      profile_id: user.id,
      ...(marketData?.marketData?.entry && {
        delta_entry: marketData.marketData.entry.marketData?.delta,
        iv_entry: marketData.marketData.entry.marketData?.iv,
        premium_entry: marketData.marketData.entry.marketData?.mid,
        underlying_price_entry: marketData.marketData.entry.marketData?.underlyingPrice
      }),
      ...(marketData?.marketData?.target && {
        delta_exit: marketData.marketData.target.marketData?.delta,
        iv_exit: marketData.marketData.target.marketData?.iv,
        premium_exit: marketData.marketData.target.marketData?.mid,
        underlying_price_exit: marketData.marketData.target.marketData?.underlyingPrice
      })
    }

    console.log('[handleFormSubmission] Attempting to save form data:', formDataToSave)

    if (note) {
      const { error } = await supabase
        .from('position_size')
        .update(formDataToSave)
        .eq('id', note.id)

      if (error) {
        console.error('[handleFormSubmission] Error updating position size:', error)
        toast.error(`Failed to update position size: ${error.message}`)
        return
      }
      console.log('[handleFormSubmission] Position size updated successfully')
      toast.success('Position size updated successfully')
    } else {
      const { error } = await supabase
        .from('position_size')
        .insert([formDataToSave])

      if (error) {
        console.error('[handleFormSubmission] Error creating position size:', error)
        toast.error(`Failed to save position size: ${error.message}`)
        return
      }
      console.log('[handleFormSubmission] Position size created successfully')
      toast.success('Position size saved successfully')
    }

    return true
  } catch (error: any) {
    console.error('[handleFormSubmission] Unexpected error in form submission:', error)
    toast.error(`Error: ${error.message}`)
    return false
  }
}