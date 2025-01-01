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
            <div className="mt-12 mb-20 relative">
              <div className="absolute left-1/2 -translate-x-1/2 -top-6 flex flex-col items-center z-10">
                <span className="text-sm text-black mb-1">$590</span>
                <Circle className="h-4 w-4 fill-black text-black" />
              </div>
              <div className="absolute left-[90%] -translate-x-1/2 -top-6 flex flex-col items-center z-10">
                <span className="text-sm text-black mb-1">$640</span>
                <Circle className="h-4 w-4 fill-black text-black" />
              </div>
              <div className="absolute left-[25%] -translate-x-1/2 -top-6 flex flex-col items-center z-10">
                <span className="text-sm text-black mb-1">$570</span>
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
                <span className="text-xs text-black">+46C at $80.45</span>
                <span className="text-xs text-red-500">$-58,094</span>
              </div>
              <div className="absolute left-[25%] -translate-x-1/2 top-8 flex flex-col items-center">
                <span className="text-xs text-black">-32P at $11.20</span>
                <span className="text-xs text-green-500">$7,450</span>
              </div>
              <div className="absolute left-[90%] -translate-x-1/2 top-8 flex flex-col items-center">
                <span className="text-xs text-black">-46C at $50.22</span>
                <span className="text-xs text-green-500">$32,622</span>
              </div>
            </div>
            <div className="text-sm space-y-2 flex justify-between">
              <div>
                <p className="text-black">Dividend: 2.38% ($17,039)</p>
                <p className="text-black">Bond yield: 4.20% ($42,003)</p>
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
      </main>
    </div>
  );
};

export default DIYNotes;
