import Header from "@/components/Header";
import MetricCard from "@/components/MetricCard";
import PortfolioChart from "@/components/PortfolioChart";
import AccumulatedReturnChart from "@/components/AccumulatedReturnChart";
import PortfolioTable from "@/components/PortfolioTable";
import { usePortfolioData } from "@/utils/portfolioData";
import { APITest } from "@/components/APITest";

const Index = () => {
  const { data, latestData } = usePortfolioData();
  
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

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">API Test</h2>
          <APITest />
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