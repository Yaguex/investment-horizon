import { useState } from "react"
import Header from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { PositionSizeForm } from "@/components/position-size/PositionSizeForm"
import { useQuery } from "@tanstack/react-query"
import { PositionHeader } from "@/components/position-size/PositionHeader"
import { PriceVisualization } from "@/components/position-size/PriceVisualization"
import { PositionMetrics } from "@/components/position-size/PositionMetrics"
import { supabase } from "@/integrations/supabase/client"

const PositionSize = () => {
  const [editPosition, setEditPosition] = useState<any>(null)
  const [isNewPositionOpen, setIsNewPositionOpen] = useState(false)

  const { data: positions, isLoading } = useQuery({
    queryKey: ['position-sizes'],
    queryFn: async () => {
      console.log('Fetching position sizes...')
      const { data: userData } = await supabase.auth.getUser()
      console.log('Current user ID:', userData.user?.id)
      
      const { data, error } = await supabase
        .from('position_size')
        .select('*')
      
      console.log('Position sizes data:', data)
      console.log('Position sizes error:', error)
      
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
          <h1 className="text-3xl font-bold text-foreground">Position Size</h1>
          <Button size="lg" className="px-6" onClick={() => setIsNewPositionOpen(true)}>
            New Sizing
          </Button>
        </div>
        
        <PositionSizeForm 
          open={isNewPositionOpen}
          onOpenChange={setIsNewPositionOpen}
        />

        {editPosition && (
          <PositionSizeForm 
            open={true}
            onOpenChange={() => setEditPosition(null)}
            position={editPosition}
          />
        )}

        <div className="space-y-6">
          {positions?.map((position) => (
            <Card key={position.id} className="w-full">
              <CardContent className="p-6">
                <PositionHeader position={position} onEdit={setEditPosition} />
                <PriceVisualization position={position} />
                <PositionMetrics position={position} />
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}

export default PositionSize