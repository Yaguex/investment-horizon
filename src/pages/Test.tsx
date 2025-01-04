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