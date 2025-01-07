import { useState } from "react"
import Header from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { DIYNoteForm } from "@/components/diy-notes/DIYNoteForm"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { NoteHeader } from "@/components/diy-notes/NoteHeader"
import { PriceVisualization } from "@/components/diy-notes/PriceVisualization"
import { NoteMetrics } from "@/components/diy-notes/NoteMetrics"

const DIYNotes = () => {
  const [editNote, setEditNote] = useState<any>(null)
  const [isNewNoteOpen, setIsNewNoteOpen] = useState(false)

  const { data: notes, isLoading } = useQuery({
    queryKey: ['diy-notes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diy_notes')
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
          <h1 className="text-3xl font-bold text-foreground">DIY Notes</h1>
          <Button size="lg" className="px-6" onClick={() => setIsNewNoteOpen(true)}>
            New Note
          </Button>
        </div>
        
        {isNewNoteOpen && (
          <DIYNoteForm 
            open={true}
            onOpenChange={setIsNewNoteOpen}
          />
        )}

        {editNote && (
          <DIYNoteForm 
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

export default DIYNotes