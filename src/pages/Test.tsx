import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function Test() {
  const [loading, setLoading] = useState(false)

  const handleTestFunction = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.functions.invoke('test')
      
      if (error) throw error
      
      console.log('Test function response:', data)
      toast.success('Test function executed successfully!')
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
      <Button 
        onClick={handleTestFunction}
        disabled={loading}
      >
        {loading ? 'Testing...' : 'Test Function'}
      </Button>
    </div>
  )
}