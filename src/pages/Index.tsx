import Header from "@/components/Header";
import MetricCard from "@/components/MetricCard";
import PortfolioChart from "@/components/PortfolioChart";
import PortfolioTable from "@/components/PortfolioTable";
import { PortfolioProvider } from "@/contexts/PortfolioContext";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <PortfolioProvider>
        <main className="container mx-auto px-4 pt-24 pb-8">
          <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
          <MetricCards />
          <div className="mb-8">
            <PortfolioChart />
          </div>
          <div>
            <PortfolioTable />
          </div>
        </main>
      </PortfolioProvider>
    </div>
  );
};

const MetricCards = () => {
  const { portfolioData } = usePortfolio();
  const latestData = portfolioData[0]; // Data is already sorted in descending order

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
      <MetricCard
        title="Portfolio Value"
        value={`$${latestData.value.toLocaleString()}`}
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
  );
};

export default Index;