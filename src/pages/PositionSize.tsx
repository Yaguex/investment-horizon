import { useState } from "react"
import Header from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { PositionSizeForm } from "@/components/position-size/PositionSizeForm"
import { useQuery } from "@tanstack/react-query"
import { NoteHeader } from "@/components/position-size/NoteHeader"
import { PriceVisualization } from "@/components/position-size/PriceVisualization"
import { NoteMetrics } from "@/components/position-size/NoteMetrics"

const dummyNote = {
  id: 1,
  ticker: "SPY",
  expiration: "2024-06-21",
  nominal: 100000,
  exposure: 50000,
  risk_free_yield: 5.5,
  strike_entry: 480,
  strike_exit: 500,
  action: "buy_call"
}

const PositionSize = () => {
  const [editNote, setEditNote] = useState<any>(null)
  const [isNewNoteOpen, setIsNewNoteOpen] = useState(false)

  // Temporarily return empty array since we don't have a table yet
  const { data: notes, isLoading } = useQuery({
    queryKey: ['position-size'],
    queryFn: async () => {
      return [dummyNote]
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
          <Button size="lg" className="px-6" onClick={() => setIsNewNoteOpen(true)}>
            New Sizing
          </Button>
        </div>
        
        <PositionSizeForm 
          open={isNewNoteOpen}
          onOpenChange={setIsNewNoteOpen}
        />

        {editNote && (
          <PositionSizeForm 
            open={true}
            onOpenChange={() => setEditNote(null)}
            note={editNote}
          />
        )}

        <div className="space-y-6">
          {notes?.map((note) => (
            <Card key={note.id} className="w-full">
              <CardContent className="p-6">
                <NoteHeader note={note} onEdit={setEditNote} />
                <PriceVisualization note={note} />
                <NoteMetrics note={note} />
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}

export default PositionSize