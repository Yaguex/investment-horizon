import { useState } from "react"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { TextField } from "@/components/test/form-fields/TextField"
import { NumberField } from "@/components/test/form-fields/NumberField"
import Header from "@/components/Header"

interface TestFormValues {
  ticker: string
  expiration: string
  type: string
  strike_entry: number | null
  strike_target: number | null
  strike_protection: number | null
}

interface MarketData {
  mid: number
  openInterest: number
  iv: number
  delta: number
  intrinsicValue: number
  extrinsicValue: number
}

interface StrikeData {
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

  const form = useForm<TestFormValues>({
    defaultValues: {
      ticker: "SPY",
      expiration: "19-12-2025",
      type: "call",
      strike_entry: 590,
      strike_target: 640,
      strike_protection: 560
    }
  })

  const saveToDatabase = async (data: TestFormValues, response: ApiResponse) => {
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
        .eq('ticker', data.ticker)
        .eq('expiration', data.expiration)
        .single()

      if (queryError && queryError.code !== 'PGRST116') {
        console.error("Error checking existing record:", queryError)
        throw queryError
      }

      const dbData = {
        profile_id,
        ticker: data.ticker,
        expiration: data.expiration,
        strike_entry: data.strike_entry,
        strike_target: data.strike_target,
        strike_protection: data.strike_protection,
        underlying_price: response.underlying_price,
        // Entry strike data
        strike_entry_mid: response.entry.marketData?.mid,
        strike_entry_open_interest: response.entry.marketData?.openInterest,
        strike_entry_iv: response.entry.marketData?.iv,
        strike_entry_delta: response.entry.marketData?.delta,
        strike_entry_intrinsic_value: response.entry.marketData?.intrinsicValue,
        strike_entry_extrinsic_value: response.entry.marketData?.extrinsicValue,
        // Target strike data
        strike_target_mid: response.target.marketData?.mid,
        strike_target_open_interest: response.target.marketData?.openInterest,
        strike_target_iv: response.target.marketData?.iv,
        strike_target_delta: response.target.marketData?.delta,
        strike_target_intrinsic_value: response.target.marketData?.intrinsicValue,
        strike_target_extrinsic_value: response.target.marketData?.extrinsicValue,
        // Protection strike data
        strike_protection_mid: response.protection.marketData?.mid,
        strike_protection_open_interest: response.protection.marketData?.openInterest,
        strike_protection_iv: response.protection.marketData?.iv,
        strike_protection_delta: response.protection.marketData?.delta,
        strike_protection_intrinsic_value: response.protection.marketData?.intrinsicValue,
        strike_protection_extrinsic_value: response.protection.marketData?.extrinsicValue,
      }

      let error
      if (existingRecord) {
        console.log("Updating existing record...")
        const { error: updateError } = await supabase
          .from('diy_notes')
          .update(dbData)
          .eq('profile_id', profile_id)
          .eq('ticker', data.ticker)
          .eq('expiration', data.expiration)
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
      setApiResponse(response)
      
      // Save to database after successful API response
      await saveToDatabase(data, response)
      
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

  const renderMarketDataCard = (title: string, data: StrikeData | undefined, strike: number | null) => {
    if (!data) return null;
    
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><span className="font-semibold">Symbol:</span> {data.symbol}</p>
            <p><span className="font-semibold">Strike:</span> {strike}</p>
            {data.marketData && (
              <>
                <p><span className="font-semibold">Mid:</span> {data.marketData.mid}</p>
                <p><span className="font-semibold">Open Interest:</span> {data.marketData.openInterest}</p>
                <p><span className="font-semibold">IV:</span> {data.marketData.iv}</p>
                <p><span className="font-semibold">Delta:</span> {data.marketData.delta}</p>
                <p><span className="font-semibold">Intrinsic Value:</span> {data.marketData.intrinsicValue}</p>
                <p><span className="font-semibold">Extrinsic Value:</span> {data.marketData.extrinsicValue}</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Test</h1>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <TextField
                control={form.control}
                name="ticker"
                label="Ticker"
              />
              
              <TextField
                control={form.control}
                name="expiration"
                label="Expiration (DD-MM-YYYY)"
              />
              
              <TextField
                control={form.control}
                name="type"
                label="Type"
              />
              
              <NumberField
                control={form.control}
                name="strike_entry"
                label="Strike Entry"
              />

              <NumberField
                control={form.control}
                name="strike_target"
                label="Strike Target"
              />

              <NumberField
                control={form.control}
                name="strike_protection"
                label="Strike Protection"
              />
              
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full"
              >
                Generate Symbols
              </Button>
            </form>
          </Form>

          {apiResponse && (
            <div className="space-y-4">
              {renderMarketDataCard("Strike Entry", apiResponse.entry, form.getValues("strike_entry"))}
              {renderMarketDataCard("Strike Target", apiResponse.target, form.getValues("strike_target"))}
              {renderMarketDataCard("Strike Protection", apiResponse.protection, form.getValues("strike_protection"))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Test