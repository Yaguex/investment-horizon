import Header from "@/components/Header";
import TradeLogTable from "@/components/TradeLogTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TradeLog = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-8">
        <h1 className="text-3xl font-bold mb-8">Trade Log</h1>
        
        <Tabs defaultValue="open" className="w-full">
          <TabsList>
            <TabsTrigger value="open">Open Trades</TabsTrigger>
            <TabsTrigger value="closed">Closed Trades</TabsTrigger>
          </TabsList>
          <TabsContent value="open">
            <TradeLogTable status="open" />
          </TabsContent>
          <TabsContent value="closed">
            <TradeLogTable status="closed" />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TradeLog;