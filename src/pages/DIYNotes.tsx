import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

const DIYNotes = () => {
  const notes = [
    {
      ticker: "AAPL",
      date: "2024-03-15",
      iv: 32,
      ivp: 65,
      priceRange: {
        current: 175,
        low: 165,
        high: 185
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">DIY Notes</h1>
          <Button>
            <Plus className="mr-2" />
            New Note
          </Button>
        </div>

        <div className="space-y-4">
          {notes.map((note, index) => (
            <Card key={index} className="w-full">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Ticker</div>
                    <div className="font-semibold">{note.ticker}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Date</div>
                    <div className="font-semibold">{note.date}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">IV/IVP</div>
                    <div className="font-semibold">{note.iv}% / {note.ivp}%</div>
                  </div>
                </div>

                <div className="mt-6 relative">
                  <div className="h-1 bg-gray-200 w-full rounded"></div>
                  
                  {/* Price markers */}
                  <div className="absolute left-0 -top-6 transform -translate-x-1/2">
                    <div className="text-sm font-medium">${note.priceRange.low}</div>
                    <div className="w-0.5 h-3 bg-gray-400 mx-auto mt-1"></div>
                  </div>
                  
                  <div className="absolute left-1/2 -top-6 transform -translate-x-1/2">
                    <div className="text-sm font-medium">${note.priceRange.current}</div>
                    <div className="w-0.5 h-3 bg-primary mx-auto mt-1"></div>
                  </div>
                  
                  <div className="absolute right-0 -top-6 transform translate-x-1/2">
                    <div className="text-sm font-medium">${note.priceRange.high}</div>
                    <div className="w-0.5 h-3 bg-gray-400 mx-auto mt-1"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default DIYNotes;