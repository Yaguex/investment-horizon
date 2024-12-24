import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Header from "@/components/Header"
import TradeTable from "@/components/TradeTable"

const TradeLog = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Trade Log</h1>
        </div>
        
        <Tabs defaultValue="open" className="w-full">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="open">Open Trades</TabsTrigger>
              <TabsTrigger value="closed">Closed Trades</TabsTrigger>
            </TabsList>
            <TabsContent value="open" className="m-0">
              <Button>New Trade</Button>
            </TabsContent>
          </div>
          <TabsContent value="open" className="animate-fade-in mt-6">
            <TradeTable tradeStatus="open" />
          </TabsContent>
          <TabsContent value="closed" className="animate-fade-in mt-6">
            <TradeTable tradeStatus="closed" />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default TradeLog