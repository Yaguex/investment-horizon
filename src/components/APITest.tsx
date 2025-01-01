import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export function APITest() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const { toast } = useToast()

  const testAPI = async () => {
    try {
      setLoading(true)
      console.log("Calling fetch_ticker_data...")
      
      const { data: response, error } = await supabase.functions.invoke('fetch_ticker_data', {
        body: {
          ticker: "SPY",
          expiration: "2025-01-16",
          strike_entry: 590,
          strike_target: 590,
          strike_protection: 590
        }
      })

      if (error) {
        console.error("Error calling function:", error)
        toast({
          variant: "destructive",
          title: "Error fetching data",
          description: error.message
        })
        return
      }

      console.log("Response:", response)
      setData(response)
      toast({
        title: "Data fetched successfully",
        description: "Check the console for details"
      })
    } catch (err) {
      console.error("Error:", err)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={testAPI} disabled={loading}>
        {loading ? "Loading..." : "Test API"}
      </Button>

      {data && (
        <pre className="p-4 bg-gray-100 rounded-lg overflow-auto max-h-96">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  )
}