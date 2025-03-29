
import { useState } from "react"
import Header from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, AlertCircle } from "lucide-react"
import { DIYDividendForm } from "@/components/diy-dividend/DIYDividendForm"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { DividendHeader } from "@/components/diy-dividend/DividendHeader"
import { PriceVisualization } from "@/components/diy-dividend/PriceVisualization"
import { DividendMetrics } from "@/components/diy-dividend/DividendMetrics"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"

const DIYDividend = () => {
  const [editDividend, setEditDividend] = useState<any>(null)
  const [newDividend, setNewDividend] = useState<any>(null)
  const { user } = useAuth()
  
  const { data: dividend, isLoading, error } = useQuery({
    queryKey: ['diy-dividend', user?.id],
    queryFn: async () => {
      console.log("Fetching DIY dividend data for user:", user?.id)
      
      if (!user) {
        console.log("No authenticated user found, skipping data fetch")
        return []
      }
      
      const { data, error } = await supabase
        .from('diy_dividend')
        .select('*')
      
      if (error) {
        console.error("Error fetching dividend data:", error)
        throw error
      }
      
      console.log("Dividend data fetched:", data)
      return data
    },
    enabled: !!user // Only run the query when the user is authenticated
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    console.error("Query error:", error)
    toast.error("Failed to load dividend data")
    
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 pt-24 pb-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load dividend data. Please try again later.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 pt-24 pb-8">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-foreground">DIY Dividend</h1>
          <Button size="lg" className="px-6" onClick={() => setNewDividend({})}>
            New Dividend
          </Button>
        </div>
        
        {newDividend && (
          <DIYDividendForm 
            open={true}
            onOpenChange={() => setNewDividend(null)}
          />
        )}

        {editDividend && (
          <DIYDividendForm 
            open={true}
            onOpenChange={() => setEditDividend(null)}
            dividend={editDividend}
          />
        )}

        <div className="space-y-6">
          {(!dividend || dividend.length === 0) && (
            // Dont display anything if there is no DIY Dividend saved in the database
          )}
          {dividend && dividend.length > 0 ? (
            // Display existing DIY Dividends saved in the database
            dividend.map((item) => (
              <Card key={item.id} className="w-full">
                <CardContent className="p-6">
                  <DividendHeader dividend={item} onEdit={setEditDividend} />
                  <PriceVisualization dividend={item} />
                  <DividendMetrics dividend={item} />
                </CardContent>
              </Card>
            ))
          ) : null}
        </div>
      </main>
    </div>
  )
}

export default DIYDividend
