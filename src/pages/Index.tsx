import { MacroDataTest } from "@/components/MacroDataTest";
import PortfolioTable from "@/components/PortfolioTable";
import { usePortfolioData } from "@/utils/portfolioData";

export default function Index() {
  const { data } = usePortfolioData();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <MacroDataTest />
      <PortfolioTable data={data} />
    </div>
  );
}