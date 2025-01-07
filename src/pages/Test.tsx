import { useState } from "react"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { TextField } from "@/components/test/form-fields/TextField"
import { NumberField } from "@/components/test/form-fields/NumberField"
import Header from "@/components/Header"
import { Loader } from "lucide-react"
import MetricCard from "@/components/MetricCard"

interface TestFormValues {
  ticker: string
  expiration: string
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
  responses: StrikeData[]
}

const Test = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null)

  const form = useForm<TestFormValues>({
    defaultValues: {
      ticker: "SPY",
      expiration: "2025-12-19",
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
      // Prepare the strikes array for the API
      const strikes = [
        {
          ticker: data.ticker,
          expiration: data.expiration,
          type: 'call',
          strike: data.strike_entry
        },
        {
          ticker: data.ticker,
          expiration: data.expiration,
          type: 'call',
          strike: data.strike_target
        },
        {
          ticker: data.ticker,
          expiration: data.expiration,
          type: 'put',
          strike: data.strike_protection
        }
      ]

      console.log("Calling fetch_marketdata_api with strikes:", strikes)
      const { data: response, error } = await supabase.functions.invoke('fetch_marketdata_api', {
        body: { strikes }
      })

      if (error) throw error

      console.log("API response:", response)
      setApiResponse(response)
      toast.success('Market data successfully fetched')
    } catch (error) {
      console.error("Error in API call:", error)
      toast.error('Could not fetch market data')
    } finally {
      setIsLoading(false)
    }
  }

  const formatValue = (value: number | undefined | null) => {
    if (value === undefined || value === null) return "N/A"
    return value.toFixed(2)
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
                label="Expiration (YYYY-MM-DD)"
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
                {isLoading ? (
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Generate Symbols"
                )}
              </Button>
            </form>
          </Form>

          {apiResponse && (
            <div className="mt-8 grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Entry Strike Card */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Entry Strike</h3>
                  <MetricCard
                    title="Mid"
                    value={formatValue(apiResponse.responses[0]?.marketData?.mid)}
                    isNumeric
                  />
                  <MetricCard
                    title="Open Interest"
                    value={formatValue(apiResponse.responses[0]?.marketData?.openInterest)}
                    isNumeric
                  />
                  <MetricCard
                    title="IV"
                    value={formatValue(apiResponse.responses[0]?.marketData?.iv)}
                    isNumeric
                  />
                  <MetricCard
                    title="Delta"
                    value={formatValue(apiResponse.responses[0]?.marketData?.delta)}
                    isNumeric
                  />
                </div>

                {/* Target Strike Card */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Target Strike</h3>
                  <MetricCard
                    title="Mid"
                    value={formatValue(apiResponse.responses[1]?.marketData?.mid)}
                    isNumeric
                  />
                  <MetricCard
                    title="Open Interest"
                    value={formatValue(apiResponse.responses[1]?.marketData?.openInterest)}
                    isNumeric
                  />
                  <MetricCard
                    title="IV"
                    value={formatValue(apiResponse.responses[1]?.marketData?.iv)}
                    isNumeric
                  />
                  <MetricCard
                    title="Delta"
                    value={formatValue(apiResponse.responses[1]?.marketData?.delta)}
                    isNumeric
                  />
                </div>

                {/* Protection Strike Card */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Protection Strike</h3>
                  <MetricCard
                    title="Mid"
                    value={formatValue(apiResponse.responses[2]?.marketData?.mid)}
                    isNumeric
                  />
                  <MetricCard
                    title="Open Interest"
                    value={formatValue(apiResponse.responses[2]?.marketData?.openInterest)}
                    isNumeric
                  />
                  <MetricCard
                    title="IV"
                    value={formatValue(apiResponse.responses[2]?.marketData?.iv)}
                    isNumeric
                  />
                  <MetricCard
                    title="Delta"
                    value={formatValue(apiResponse.responses[2]?.marketData?.delta)}
                    isNumeric
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Test