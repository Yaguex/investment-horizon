import Header from "@/components/Header";
import MetricCard from "@/components/MetricCard";
import PortfolioChart from "@/components/PortfolioChart";
import PortfolioTable from "@/components/PortfolioTable";
import { usePortfolioData } from "@/utils/portfolioData";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { data, latestData, updateData, isLoading, error } = usePortfolioData();
  const { toast } = useToast();
  
  console.log('Index page rendering with:', {
    dataLength: data.length,
    isLoading,
    error,
    hasLatestData: !!latestData
  });

  if (error) {
    console.error('Error in Index page:', error);
    toast({
      title: "Error loading data",
      description: "There was a problem loading your portfolio data. Please try again later.",
      variant: "destructive",
    });
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        {isLoading ? (
          <div className="text-center py-8">Loading your portfolio data...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-8">
            No portfolio data available. Please add some data to get started.
          </div>
        ) : (
          <>
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

            <div className="mb-8">
              <PortfolioChart data={data} />
            </div>

            <div>
              <PortfolioTable data={data} onDataUpdate={updateData} />
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Index;