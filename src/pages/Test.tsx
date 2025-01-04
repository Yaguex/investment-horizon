import { useState } from "react"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import Header from "@/components/Header"
import { TestForm, TestFormValues } from "@/components/test/TestForm"
import { MarketDataCard } from "@/components/test/MarketDataCard"

interface MarketData {
  mid: number
  openInterest: number
  iv: number
  delta: number
  intrinsicValue: number
  extrinsicValue: number
}

export interface StrikeData {
  symbol: string
  marketData: MarketData | null
}

interface ApiResponse {
  entry: StrikeData
  target: StrikeData
  protection: StrikeData
  underlying_price?: number
}

const Test = () => {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null)

  const saveToDatabase = async (formData: TestFormValues, responseData: ApiResponse) => {
    console.log("Attempting to save data to database...")
    
    try {
      const { data: user, error: userError } = await supabase.auth.getUser()
      if (userError || !user.user) throw userError

      const profile_id = user.user.id
      console.log("User profile_id:", profile_id)

      // Check if record exists
      const { data: existingRecord, error: queryError } = await supabase
        .from('diy_notes')
        .select('*')
        .eq('profile_id', profile_id)
        .eq('ticker', formData.ticker)
        .eq('expiration', formData.expiration)
        .single()

      if (queryError && queryError.code !== 'PGRST116') {
        console.error("Error checking existing record:", queryError)
        throw queryError
      }

      const dbData = {
        profile_id,
        ticker: formData.ticker,
        expiration: formData.expiration,
        strike_entry: formData.strike_entry,
        strike_target: formData.strike_target,
        strike_protection: formData.strike_protection,
        underlying_price: responseData.underlying_price,
        // Entry strike data
        strike_entry_mid: responseData.entry.marketData?.mid,
        strike_entry_open_interest: responseData.entry.marketData?.openInterest,
        strike_entry_iv: responseData.entry.marketData?.iv,
        strike_entry_delta: responseData.entry.marketData?.delta,
        strike_entry_intrinsic_value: responseData.entry.marketData?.intrinsicValue,
        strike_entry_extrinsic_value: responseData.entry.marketData?.extrinsicValue,
        // Target strike data
        strike_target_mid: responseData.target.marketData?.mid,
        strike_target_open_interest: responseData.target.marketData?.openInterest,
        strike_target_iv: responseData.target.marketData?.iv,
        strike_target_delta: responseData.target.marketData?.delta,
        strike_target_intrinsic_value: responseData.target.marketData?.intrinsicValue,
        strike_target_extrinsic_value: responseData.target.marketData?.extrinsicValue,
        // Protection strike data
        strike_protection_mid: responseData.protection.marketData?.mid,
        strike_protection_open_interest: responseData.protection.marketData?.openInterest,
        strike_protection_iv: responseData.protection.marketData?.iv,
        strike_protection_delta: responseData.protection.marketData?.delta,
        strike_protection_intrinsic_value: responseData.protection.marketData?.intrinsicValue,
        strike_protection_extrinsic_value: responseData.protection.marketData?.extrinsicValue,
      }

      let error
      if (existingRecord) {
        console.log("Updating existing record...")
        const { error: updateError } = await supabase
          .from('diy_notes')
          .update(dbData)
          .eq('profile_id', profile_id)
          .eq('ticker', formData.ticker)
          .eq('expiration', formData.expiration)
        error = updateError
      } else {
        console.log("Inserting new record...")
        const { error: insertError } = await supabase
          .from('diy_notes')
          .insert(dbData)
        error = insertError
      }

      if (error) {
        console.error("Error saving to database:", error)
        throw error
      }

      console.log("Successfully saved data to database")
      return true
    } catch (error) {
      console.error("Error in saveToDatabase:", error)
      throw error
    }
  }

  const onSubmit = async (data: TestFormValues) => {
    console.log("Submitting test form with data:", data)
    setIsLoading(true)
    setApiResponse(null)

    try {
      const { data: response, error } = await supabase.functions.invoke('fetch_ticker_data', {
        body: { 
          ticker: data.ticker,
          expiration: data.expiration,
          type: data.type,
          strikes: {
            entry: data.strike_entry,
            target: data.strike_target,
            protection: data.strike_protection
          }
        }
      })

      if (error) {
        console.error("Error generating symbols:", error)
        toast({
          variant: "destructive",
          description: "API data could not be fetched or stored in the database"
        })
        return
      }

      console.log("API response:", response)
      
      // Store response data before setting state
      const responseData = response as ApiResponse
      
      // Set state with the stored data
      setApiResponse(responseData)
      
      // Save to database using the stored data
      await saveToDatabase(data, responseData)
      
      toast({
        description: "API data successfully fetched and stored in the database"
      })
    } catch (error) {
      console.error("Error in symbol generation:", error)
      toast({
        variant: "destructive",
        description: "API data could not be fetched or stored in the database"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Test</h1>
          
          <TestForm onSubmit={onSubmit} isLoading={isLoading} />

          {apiResponse && (
            <div className="space-y-4">
              <MarketDataCard 
                title="Strike Entry" 
                data={apiResponse.entry} 
                strike={apiResponse.entry.marketData?.mid} 
              />
              <MarketDataCard 
                title="Strike Target" 
                data={apiResponse.target} 
                strike={apiResponse.target.marketData?.mid} 
              />
              <MarketDataCard 
                title="Strike Protection" 
                data={apiResponse.protection} 
                strike={apiResponse.protection.marketData?.mid} 
              />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Test