import { useState } from "react"
import Header from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { DIYDividendForm } from "@/components/diy-dividend/DIYDividendForm"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { DividendHeader } from "@/components/diy-dividend/DividendHeader"
import { PriceVisualization } from "@/components/diy-dividend/PriceVisualization"
import { DividendMetrics } from "@/components/diy-dividend/DividendMetrics"

const DIYDividend = () => {
  const [editDividend, setEditDividend] = useState<any>(null)
  const [newDividend, setNewDividend] = useState<any>(null)

  const { data: dividend, isLoading } = useQuery({
    queryKey: ['diy-dividend'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diy_dividend')
        .select('*')
      
      if (error) throw error
      return data
    }
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
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
          {dividend?.map((dividend) => (
            <Card key={dividend.id} className="w-full">
              <CardContent className="p-6">
                <DividendHeader dividend={dividend} onEdit={setEditDividend} />
                <PriceVisualization dividend={dividend} />
                <DividendMetrics dividend={dividend} />
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}

export default DIYDividend
