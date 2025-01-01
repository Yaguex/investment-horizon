import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Edit2, Trash2 } from "lucide-react";

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
              <span className="font-bold text-lg">SPY</span>
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
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DIYNotes;