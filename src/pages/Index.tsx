import Header from "@/components/Header";
import MetricCard from "@/components/MetricCard";
import PortfolioChart from "@/components/PortfolioChart";
import PortfolioTable from "@/components/PortfolioTable";
import { usePortfolioData } from "@/utils/portfolioData";

const Index = () => {
  const { data, latestData } = usePortfolioData();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <MetricCard
            title="Portfolio Value"
            value={`$${latestData.value.toLocaleString()}`}
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
          <PortfolioTable data={data} />
        </div>
      </main>
    </div>
  );
};

export default Index;