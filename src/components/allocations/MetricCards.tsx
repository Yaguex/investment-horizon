import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MetricCard from "@/components/MetricCard";

const MetricCards = () => {
  // Fetch latest portfolio data for balance
  const { data: portfolioData } = useQuery({
    queryKey: ['portfolioLatestData'],
    queryFn: async () => {
      console.log('Fetching latest portfolio data...');
      const { data: latestData, error } = await supabase
        .from('portfolio_data')
        .select('balance')
        .order('month', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching portfolio data:', error);
        throw error;
      }

      console.log('Latest portfolio data:', latestData);
      return latestData[0];
    }
  });

  // Fetch allocations data for calculations
  const { data: allocations } = useQuery({
    queryKey: ['allocationsMetrics'],
    queryFn: async () => {
      console.log('Fetching allocations for metrics...');
      const { data, error } = await supabase
        .from('allocations')
        .select('*')
        .eq('row_type', 'child');

      if (error) {
        console.error('Error fetching allocations:', error);
        throw error;
      }

      console.log('Allocations data:', data);
      return data;
    }
  });

  // Calculate metrics
  const calculateMetrics = () => {
    if (!portfolioData?.balance || !allocations) return null;

    const totalValueActual = allocations.reduce((sum, row) => sum + (row.value_actual || 0), 0);
    const cashAvailable = portfolioData.balance - totalValueActual;

    const toAdd = allocations
      .filter(row => (row.delta || 0) < -25)
      .reduce((sum, row) => sum + ((row.value_actual || 0) - (row.value_target || 0)), 0);

    const toTrim = allocations
      .filter(row => (row.delta || 0) > 25)
      .reduce((sum, row) => sum + ((row.value_target || 0) - (row.value_actual || 0)), 0);

    const totalDividendDollars = allocations.reduce((sum, row) => sum + (row["dividend_$"] || 0), 0);
    
    const totalDividendPercentage = (totalDividendDollars / portfolioData.balance) * 100;

    const totalTarget = allocations.reduce((sum, row) => sum + (row.weight_target || 0), 0);

    return {
      cashAvailable,
      toAdd,
      toTrim,
      totalDividendDollars,
      totalDividendPercentage,
      totalTarget
    };
  };

  const metrics = calculateMetrics();

  if (!metrics) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      <MetricCard
        title="Cash Available"
        value={`$${metrics.cashAvailable.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
      />
      <MetricCard
        title="Underinvested"
        value={`$${Math.abs(metrics.toAdd).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
        isNumeric={true}
      />
      <MetricCard
        title="Overinvested"
        value={`$${metrics.toTrim.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
        isNumeric={true}
      />
      <MetricCard
        title="Total Dividend $"
        value={`$${metrics.totalDividendDollars.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
      />
      <MetricCard
        title="Total Dividend %"
        value={`${metrics.totalDividendPercentage.toFixed(2)}%`}
      />
      <MetricCard
        title="Total Target"
        value={`${metrics.totalTarget.toFixed(2)}%`}
      />
    </div>
  );
};

export default MetricCards;