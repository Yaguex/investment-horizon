import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Edit2, Trash2, Triangle } from "lucide-react";

const DIYNotes = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 pt-24 pb-8">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-foreground">DIY Notes</h1>
          <Button size="lg" className="px-6">
            New Note
          </Button>
        </div>
        <Card className="w-full">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="font-bold text-lg mr-8">SPY</span>
                <span className="text-sm text-gray-500 mr-8">18 Dec 2024</span>
                <span className="text-sm text-gray-500 mr-8">$1,000,000</span>
                <span className="text-sm text-gray-500">IV 72% | IVP 72%</span>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-accent rounded-md transition-colors">
                  <Copy className="h-5 w-5 text-muted-foreground" />
                </button>
                <button className="p-2 hover:bg-accent rounded-md transition-colors">
                  <Edit2 className="h-5 w-5 text-muted-foreground" />
                </button>
                <button className="p-2 hover:bg-accent rounded-md transition-colors">
                  <Trash2 className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            </div>
            <div className="mt-12 relative">
              <div className="absolute left-1/2 -translate-x-1/2 -top-6 flex flex-col items-center">
                <span className="text-sm text-black mb-1">$590</span>
                <Triangle className="h-4 w-4 fill-black text-black transform rotate-180" />
              </div>
              <div className="w-full bg-gray-100 rounded-lg h-2">
                {/* Price range content will go here */}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DIYNotes;