import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

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
      
      if (!responseData.callOptions.entry.mid && !responseData.callOptions.target.mid && !responseData.putOptions.protection.mid) {
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>
      
      <div className="grid gap-4 mb-4">
        <div>
          <Label htmlFor="ticker">Ticker</Label>
          <Input
            id="ticker"
            name="ticker"
            value={formData.ticker}
            onChange={handleInputChange}
          />
        </div>
        
        <div>
          <Label htmlFor="expiration">Expiration Date</Label>
          <Input
            id="expiration"
            name="expiration"
            type="date"
            value={formData.expiration}
            onChange={handleInputChange}
          />
        </div>
        
        <div>
          <Label htmlFor="strike_entry">Entry Strike</Label>
          <Input
            id="strike_entry"
            name="strike_entry"
            type="number"
            value={formData.strike_entry}
            onChange={handleInputChange}
          />
        </div>
        
        <div>
          <Label htmlFor="strike_target">Target Strike</Label>
          <Input
            id="strike_target"
            name="strike_target"
            type="number"
            value={formData.strike_target}
            onChange={handleInputChange}
          />
        </div>
        
        <div>
          <Label htmlFor="strike_protection">Protection Strike</Label>
          <Input
            id="strike_protection"
            name="strike_protection"
            type="number"
            value={formData.strike_protection}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <Button 
        onClick={handleTestFunction}
        disabled={loading}
      >
        {loading ? 'Fetching...' : 'Fetch Option Data'}
      </Button>

      {data && (
        <div className="mt-4 grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Call Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div>
                  <h3 className="font-semibold">Entry ({data.callOptions.entry.strike})</h3>
                  <p>Symbol: {data.callOptions.entry.optionSymbol || 'N/A'}</p>
                  <p>Mid: ${data.callOptions.entry.mid || 'N/A'}</p>
                  <p>IV: {data.callOptions.entry.iv || 'N/A'}%</p>
                </div>
                <div>
                  <h3 className="font-semibold">Target ({data.callOptions.target.strike})</h3>
                  <p>Symbol: {data.callOptions.target.optionSymbol || 'N/A'}</p>
                  <p>Mid: ${data.callOptions.target.mid || 'N/A'}</p>
                  <p>IV: {data.callOptions.target.iv || 'N/A'}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Put Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <h3 className="font-semibold">Protection ({data.putOptions.protection.strike})</h3>
                <p>Symbol: {data.putOptions.protection.optionSymbol || 'N/A'}</p>
                <p>Mid: ${data.putOptions.protection.mid || 'N/A'}</p>
                <p>IV: {data.putOptions.protection.iv || 'N/A'}%</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}