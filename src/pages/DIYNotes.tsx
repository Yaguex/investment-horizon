import { useState } from "react"
import Header from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Copy, Edit, Trash, Circle, Loader2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DIYNoteForm } from "@/components/diy-notes/DIYNoteForm"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { formatNumber, formatDate } from "@/components/trade/utils/formatters"

const DIYNotes = () => {
  const [isFormOpen, setIsFormOpen] = useState(false)

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
          <Button size="lg" className="px-6" onClick={() => setIsFormOpen(true)}>
            New Note
          </Button>
        </div>
        
        <DIYNoteForm 
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
        />

        <div className="space-y-6">
          {notes?.map((note) => (
            <Card key={note.id} className="w-full">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="font-bold text-lg mr-8">{note.ticker}</span>
                    <span className="text-sm text-gray-500 mr-8">{formatDate(note.expiration)}</span>
                    <span className="text-sm text-gray-500 mr-8">${formatNumber(note.nominal, 0)}</span>
                    <span className="text-sm text-gray-500">IV 72% | IVP 72%</span>
                  </div>
                  <TooltipProvider>
                    <div className="flex gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="cursor-pointer">
                            <Copy className="h-5 w-5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy Note</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="cursor-pointer">
                            <Edit className="h-5 w-5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit Note</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="cursor-pointer">
                            <Trash className="h-5 w-5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete Note</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </div>
                <div className="mt-12 mb-20 relative">
                  <div className="absolute left-1/2 -translate-x-1/2 -top-6 flex flex-col items-center z-10">
                    <span className="text-sm text-black mb-1">${note.strike_entry}</span>
                    <Circle className="h-4 w-4 fill-black text-black" />
                  </div>
                  <div className="absolute left-[90%] -translate-x-1/2 -top-6 flex flex-col items-center z-10">
                    <span className="text-sm text-black mb-1">${note.strike_target}</span>
                    <Circle className="h-4 w-4 fill-black text-black" />
                  </div>
                  <div className="absolute left-[25%] -translate-x-1/2 -top-6 flex flex-col items-center z-10">
                    <span className="text-sm text-black mb-1">${note.strike_protection}</span>
                    <Circle className="h-4 w-4 fill-black text-black" />
                  </div>
                  <div className="absolute left-[55%] -translate-x-1/2 -top-6 flex flex-col items-center z-10">
                    <span className="text-sm text-gray-500 mb-1">$595</span>
                    <Circle className="h-4 w-4" style={{ fill: 'rgba(0,0,0,0.2)', color: 'rgba(0,0,0,0.2)' }} />
                  </div>
                  <div className="absolute left-[58%] -translate-x-1/2 -top-6 flex flex-col items-center z-10">
                    <span className="text-sm text-gray-500 mb-1">$598</span>
                    <Circle className="h-4 w-4" style={{ fill: 'rgba(0,0,0,0.2)', color: 'rgba(0,0,0,0.2)' }} />
                  </div>
                  <div className="w-full bg-gray-100 rounded-lg h-4 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 bg-red-500 w-[25%]"></div>
                    <div className="absolute left-1/2 top-0 bottom-0 bg-green-500 w-[40%]"></div>
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2 top-8 flex flex-col items-center">
                    <span className="text-xs text-black"><span className="font-bold">+46C</span> at $80.45</span>
                    <span className="text-xs text-red-500">$-58,094</span>
                  </div>
                  <div className="absolute left-[25%] -translate-x-1/2 top-8 flex flex-col items-center">
                    <span className="text-xs text-black"><span className="font-bold">-32P</span> at $11.20</span>
                    <span className="text-xs text-green-500">$7,450</span>
                  </div>
                  <div className="absolute left-[90%] -translate-x-1/2 top-8 flex flex-col items-center">
                    <span className="text-xs text-black"><span className="font-bold">-46C</span> at $50.22</span>
                    <span className="text-xs text-green-500">$32,622</span>
                  </div>
                </div>
                <div className="text-sm space-y-2 flex justify-between">
                  <div>
                    <p className="text-black">Dividend: {note.dividend_yield}% (${formatNumber(note.nominal * note.dividend_yield / 100, 0)})</p>
                    <p className="text-black">Bond yield: {note.bond_yield}% (${formatNumber(note.nominal * note.bond_yield / 100, 0)})</p>
                    <p className="text-black">Note's net: <span className="text-green-600">$1,022</span></p>
                    <p className="text-black">Options premium: <span className="text-red-600">-$22,390</span></p>
                    <p className="text-black">Max gain: 14.42% ($130,034)</p>
                  </div>
                  <div className="flex gap-8 items-start">
                    <div className="text-center">
                      <p className="text-red-600 text-xl font-bold">8.3%</p>
                      <p className="text-xs text-black">Max ROI<br />annualized</p>
                    </div>
                    <div className="text-center">
                      <p className="text-green-600 text-xl font-bold">58%</p>
                      <p className="text-xs text-black">Leverage<br />ratio</p>
                    </div>
                    <div className="text-center">
                      <p className="text-red-600 text-xl font-bold">2.0</p>
                      <p className="text-xs text-black">Convexity<br />ratio</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}

export default DIYNotes