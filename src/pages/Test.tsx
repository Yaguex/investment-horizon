import { useState } from "react"
import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { TextField } from "@/components/test/form-fields/TextField"
import { NumberField } from "@/components/test/form-fields/NumberField"
import Header from "@/components/Header"
import { MarketDataCard } from "./test/MarketDataCard"
import type { TestFormValues, ApiResponse } from "./test/types"
import { format, parse } from "date-fns"

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

  const onSubmit = async (data: TestFormValues) => {
    console.log("Submitting test form with data:", data)
    setIsLoading(true)
    setApiResponse(null)

    try {
      // First get the market data from the API
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
          description: "API data could not be fetched"
        })
        return
      }

      console.log("API response:", response)
      setApiResponse(response)

      // After getting market data, check if record exists
      // Parse the DD-MM-YYYY date to a Date object and format as YYYY-MM-DD
      const formattedDate = format(
        parse(data.expiration, 'dd-MM-yyyy', new Date()),
        'yyyy-MM-dd'
      )

      const { count, error: countError } = await supabase
        .from('diy_notes')
        .select('*', { count: 'exact', head: true })
        .eq('ticker', data.ticker)
        .eq('expiration', formattedDate)

      if (countError) {
        console.error("Error checking existing record:", countError)
        throw countError
      }

      const isUpdate = count && count > 0
      console.log(isUpdate ? "Updating existing record" : "Creating new record")

      // Store the data in the database
      if (isUpdate) {
        const { error: updateError } = await supabase
          .from('diy_notes')
          .update({
            strike_entry: data.strike_entry,
            strike_target: data.strike_target,
            strike_protection: data.strike_protection,
            // Add other fields as needed
          })
          .eq('ticker', data.ticker)
          .eq('expiration', formattedDate)

        if (updateError) throw updateError
        toast({
          description: "Record updated successfully"
        })
      } else {
        const { error: insertError } = await supabase
          .from('diy_notes')
          .insert([{
            ticker: data.ticker,
            expiration: formattedDate,
            strike_entry: data.strike_entry,
            strike_target: data.strike_target,
            strike_protection: data.strike_protection,
            // Add other fields as needed
          }])

        if (insertError) throw insertError
        toast({
          description: "New record created successfully"
        })
      }

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
              <MarketDataCard 
                title="Strike Entry" 
                data={apiResponse.entry} 
                strike={form.getValues("strike_entry")} 
              />
              <MarketDataCard 
                title="Strike Target" 
                data={apiResponse.target} 
                strike={form.getValues("strike_target")} 
              />
              <MarketDataCard 
                title="Strike Protection" 
                data={apiResponse.protection} 
                strike={form.getValues("strike_protection")} 
              />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Test