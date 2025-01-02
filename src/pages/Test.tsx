import { useState } from "react"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { TextField } from "@/components/trade/form-fields/TextField"
import { DateField } from "@/components/trade/form-fields/DateField"
import { SelectField } from "@/components/allocations/form-fields/SelectField"
import { NumberField } from "@/components/trade/form-fields/NumberField"
import { supabase } from "@/integrations/supabase/client"
import Header from "@/components/Header"

interface TestFormValues {
  ticker: string
  expiration: Date
  type: string
  strike: number
}

const Test = () => {
  const [generatedSymbol, setGeneratedSymbol] = useState<string>("")
  
  const form = useForm<TestFormValues>({
    defaultValues: {
      ticker: "SPY",
      expiration: new Date("2026-01-16"),
      type: "call",
      strike: 585
    }
  })

  const onSubmit = async (data: TestFormValues) => {
    console.log("Submitting data:", data)
    
    const { data: response, error } = await supabase.functions.invoke('fetch_ticker_data', {
      body: { ticker: data.ticker }
    })

    if (response) {
      console.log("Response from fetch_ticker_data:", response)
      setGeneratedSymbol(response.symbol)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-xl mx-auto space-y-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <TextField 
                control={form.control}
                name="ticker"
                label="Ticker"
              />
              
              <DateField 
                control={form.control}
                name="expiration"
                label="Expiration"
              />
              
              <SelectField 
                control={form.control}
                name="type"
                label="Type"
                options={[
                  { label: "Call", value: "call" },
                  { label: "Put", value: "put" }
                ]}
              />
              
              <NumberField 
                control={form.control}
                name="strike"
                label="Strike"
              />
              
              <Button type="submit" className="w-full">
                Generate Symbol
              </Button>
            </form>
          </Form>

          {generatedSymbol && (
            <Card>
              <CardHeader>
                <CardTitle>MarketData.app symbol</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-mono">{generatedSymbol}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

export default Test