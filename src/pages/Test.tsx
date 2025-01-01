import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import TestForm from "@/components/test/TestForm"
import TestResults from "@/components/test/TestResults"

export default function Test() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const [formData, setFormData] = useState({
    ticker: "SPY",
    expiration: "2026-01-16",
    strike_entry: "585",
    strike_target: "640",
    strike_protection: "540"
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleTestFunction = async () => {
    try {
      setLoading(true)
      console.log('Sending request with data:', formData)
      
      const requestBody = {
        ...formData,
        strike_entry: parseFloat(formData.strike_entry),
        strike_target: parseFloat(formData.strike_target),
        strike_protection: parseFloat(formData.strike_protection)
      }
      console.log('Parsed request body:', requestBody)
      
      const { data: responseData, error } = await supabase.functions.invoke('test', {
        body: requestBody
      })
      
      if (error) {
        console.error('Supabase function error:', error)
        throw error
      }
      
      console.log('Test function response:', responseData)
      setData(responseData)
      
      if (!responseData.stock.mid && !responseData.callOptions.entry.mid && !responseData.putOptions.protection.mid) {
        console.warn('No option data found in response')
        toast.error('No option data found for the specified parameters')
      } else {
        console.log('Successfully received option data')
        toast.success('Test function executed successfully!')
      }
    } catch (error) {
      console.error('Error calling test function:', error)
      toast.error('Error executing test function')
    } finally {
      setLoading(false)
    }
  }

  const handleHardcodedTest = async () => {
    try {
      setLoading(true)
      console.log('Sending request to hardcoded URL')
      
      const { data: responseData, error } = await supabase.functions.invoke('test', {
        body: {
          ticker: "SPY",
          expiration: "2026-01-16",
          strike_entry: 580,
          hardcodedUrl: "https://api.marketdata.app/v1/options/chain/SPY/?expiration=2026-01-16&side=call&strikeLimit=580,640,540"
        }
      })
      
      if (error) {
        console.error('Supabase function error:', error)
        throw error
      }
      
      console.log('Hardcoded test response:', responseData)
      setData(responseData)
      
      if (!responseData.callOptions?.entry?.mid) {
        console.warn('No option data found in response')
        toast.error('No option data found from hardcoded URL')
      } else {
        console.log('Successfully received option data')
        toast.success('Hardcoded test executed successfully!')
      }
    } catch (error) {
      console.error('Error calling hardcoded test:', error)
      toast.error('Error executing hardcoded test')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>
      
      <TestForm 
        formData={formData}
        loading={loading}
        onInputChange={handleInputChange}
        onTestFunction={handleTestFunction}
        onHardcodedTest={handleHardcodedTest}
      />

      <TestResults data={data} />
    </div>
  )
}