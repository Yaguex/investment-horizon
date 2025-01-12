import { useState } from "react"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import Header from "@/components/Header"
import TestForm, { TestFormValues } from "@/components/test/TestForm"
import StrikeDataCard from "@/components/test/StrikeDataCard"
import { ApiResponse } from "@/components/test/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const Test = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null)

  const onSubmit = async (data: TestFormValues) => {
    console.log("Submitting test form with data:", data)
    setIsLoading(true)
    setApiResponse(null)

    try {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Test</h1>
        </div>

        <Tabs defaultValue="diy-notes" className="w-full">
          <TabsList>
            <TabsTrigger value="diy-notes">DIY Notes</TabsTrigger>
            <TabsTrigger value="option-expirations">Option Expirations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="diy-notes" className="animate-fade-in">
            <div className="max-w-2xl mx-auto">
              <TestForm onSubmit={onSubmit} isLoading={isLoading} />

              {apiResponse && (
                <div className="mt-8">
                  <StrikeDataCard 
                    title="Entry Strike"
                    symbol={apiResponse.responses[0]?.symbol}
                    marketData={apiResponse.responses[0]?.marketData}
                  />
                  <StrikeDataCard 
                    title="Target Strike"
                    symbol={apiResponse.responses[1]?.symbol}
                    marketData={apiResponse.responses[1]?.marketData}
                  />
                  <StrikeDataCard 
                    title="Protection Strike"
                    symbol={apiResponse.responses[2]?.symbol}
                    marketData={apiResponse.responses[2]?.marketData}
                  />
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="option-expirations" className="animate-fade-in">
            <div className="max-w-2xl mx-auto">
              {/* Empty for now, waiting for future implementation */}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default Test