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
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 pt-24 pb-8">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-foreground">DIY Notes</h1>
          <Button size="lg" className="px-6">
            <Plus className="mr-2 h-5 w-5" />
            New Note
          </Button>
        </div>

        <div className="space-y-6">
          {notes.map((note, index) => (
            <Card key={index} className="w-full">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Ticker</div>
                    <div className="text-xl font-semibold">{note.ticker}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Date</div>
                    <div className="text-xl font-semibold">{note.date}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">IV/IVP</div>
                    <div className="text-xl font-semibold">{note.iv}% / {note.ivp}%</div>
                  </div>
                </div>

                <div className="relative px-8">
                  <div className="h-1 bg-gray-200 w-full rounded-full"></div>
                  
                  {/* Price markers */}
                  <div className="absolute left-0 -top-8 transform -translate-x-1/2">
                    <div className="text-base font-medium mb-2">${note.priceRange.low}</div>
                    <div className="w-0.5 h-4 bg-gray-400 mx-auto"></div>
                  </div>
                  
                  <div className="absolute left-1/2 -top-8 transform -translate-x-1/2">
                    <div className="text-base font-medium mb-2">${note.priceRange.current}</div>
                    <div className="w-0.5 h-4 bg-primary mx-auto"></div>
                  </div>
                  
                  <div className="absolute right-0 -top-8 transform translate-x-1/2">
                    <div className="text-base font-medium mb-2">${note.priceRange.high}</div>
                    <div className="w-0.5 h-4 bg-gray-400 mx-auto"></div>
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