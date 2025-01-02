import { useState } from "react"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { DateField } from "@/components/trade/form-fields/DateField"
import { TextField } from "@/components/trade/form-fields/TextField"
import { NumberField } from "@/components/trade/form-fields/NumberField"
import Header from "@/components/Header"

interface TestFormValues {
  ticker: string
  expiration: Date
  type: string
  strike: number | null
}

const Test = () => {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [generatedSymbol, setGeneratedSymbol] = useState<string | null>(null)

  const form = useForm<TestFormValues>({
    defaultValues: {
      ticker: "SPY",
      expiration: new Date("2026-01-16"),
      type: "call",
      strike: 585
    }
  })

  const onSubmit = async (data: TestFormValues) => {
    console.log("Submitting test form with data:", data)
    setIsLoading(true)

    try {
      const { data: response, error } = await supabase.functions.invoke('fetch_ticker_data', {
        body: { ticker: data.ticker }
      })

      if (error) {
        console.error("Error generating symbol:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to generate symbol. Please try again."
        })
        return
      }

      console.log("Generated symbol:", response)
      setGeneratedSymbol(response.symbol)
    } catch (error) {
      console.error("Error in symbol generation:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again."
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
              
              <DateField
                control={form.control}
                name="expiration"
                label="Expiration"
              />
              
              <TextField
                control={form.control}
                name="type"
                label="Type"
              />
              
              <NumberField
                control={form.control}
                name="strike"
                label="Strike"
              />
              
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full"
              >
                Generate Symbol
              </Button>
            </form>
          </Form>

          {generatedSymbol && (
            <Card className="mt-8">
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