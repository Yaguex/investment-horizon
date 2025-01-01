import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Edit2, Trash2, Circle } from "lucide-react";

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
                <span className="text-sm text-gray-500 mr-30">$1,000,000</span>
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
              <div className="absolute left-1/2 -translate-x-1/2 -top-6 flex flex-col items-center z-10">
                <span className="text-sm text-black mb-1">$590</span>
                <Circle className="h-4 w-4 fill-black text-black" />
              </div>
              <div className="absolute left-[95%] -translate-x-1/2 -top-6 flex flex-col items-center z-10">
                <span className="text-sm text-black mb-1">$640</span>
                <Circle className="h-4 w-4 fill-black text-black" />
              </div>
              <div className="absolute left-[25%] -translate-x-1/2 -top-6 flex flex-col items-center z-10">
                <span className="text-sm text-black mb-1">$570</span>
                <Circle className="h-4 w-4 fill-black text-black" />
              </div>
              <div className="absolute left-[55%] -translate-x-1/2 -top-6 flex flex-col items-center z-10">
                <span className="text-sm text-gray-500 mb-1">$595</span>
                <Circle className="h-4 w-4 fill-gray-500 text-gray-500" />
              </div>
              <div className="w-full bg-gray-100 rounded-lg h-4 relative overflow-hidden">
                {/* Red section from left edge to $570 */}
                <div className="absolute left-0 top-0 bottom-0 bg-red-500 w-[25%]"></div>
                {/* Green section from $590 to $640 */}
                <div className="absolute left-1/2 top-0 bottom-0 bg-green-500 w-[45%]"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DIYNotes;