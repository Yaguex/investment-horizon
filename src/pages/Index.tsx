import Header from "@/components/Header";
import MetricCard from "@/components/MetricCard";
import PortfolioChart from "@/components/PortfolioChart";
import AccumulatedReturnChart from "@/components/AccumulatedReturnChart";
import PortfolioTable from "@/components/PortfolioTable";
import { usePortfolioData } from "@/utils/portfolioData";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { data, latestData } = usePortfolioData();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchMacroData = async () => {
      try {
        console.log('Invoking fetch_macro_data function...');
        const { data, error } = await supabase.functions.invoke('fetch_macro_data');
        
        if (error) {
          console.error('Error fetching macro data:', error);
          toast({
            title: "Error",
            description: "Failed to fetch macro data",
            variant: "destructive",
          });
          return;
        }
        
        console.log('Macro data fetch completed:', data);
        toast({
          title: "Success",
          description: "Macro data updated successfully",
        });
      } catch (error) {
        console.error('Error in fetchMacroData:', error);
        toast({
          title: "Error",
          description: "Failed to fetch macro data",
          variant: "destructive",
        });
      }
    };

    fetchMacroData();
  }, []); // Run once when component mounts
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <MetricCard
            title="Portfolio Value"
            value={`$${latestData.value.toLocaleString()}`}
            isNumeric={true}
          />
          <MetricCard
            title="YTD Net Flows"
            value={`$${latestData.ytdNetFlow.toLocaleString()}`}
            isNumeric={true}
          />
          <MetricCard
            title="YTD Gains"
            value={`$${latestData.ytdGain.toLocaleString()}`}
            isNumeric={true}
          />
          <MetricCard
            title="YTD Return"
            value={`${latestData.ytdReturn}%`}
            isNumeric={true}
          />
        </div>

        <div className="space-y-8">
          <PortfolioChart data={data} />
          <AccumulatedReturnChart data={data} />
        </div>

        <div className="mt-8">
          <PortfolioTable data={data} />
        </div>
      </main>
    </div>
  );
};

export default Index;