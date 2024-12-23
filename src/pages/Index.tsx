import Header from "@/components/Header";
import MetricCard from "@/components/MetricCard";
import PortfolioChart from "@/components/PortfolioChart";
import PortfolioTable from "@/components/PortfolioTable";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <MetricCard
            title="Portfolio Value"
            value="$125,430"
            trend="up"
          />
          <MetricCard
            title="YTD Gains"
            value="$25,430"
            trend="up"
          />
          <MetricCard
            title="YTD Return"
            value="25.43%"
            trend="up"
          />
        </div>

        <div className="mb-8">
          <PortfolioChart />
        </div>

        <div>
          <PortfolioTable />
        </div>
      </main>
    </div>
  );
};

export default Index;