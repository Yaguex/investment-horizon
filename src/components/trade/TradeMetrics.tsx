import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MetricCard from "@/components/MetricCard";
import { useAuth } from "@/contexts/AuthContext";

interface TradeMetricsProps {
  tradeStatus: "open" | "closed";
}

const TradeMetrics = ({ tradeStatus }: TradeMetricsProps) => {
  const { user } = useAuth();

  const { data: metrics } = useQuery({
    queryKey: ['tradeMetrics', tradeStatus, user?.id],
    queryFn: async () => {
      console.log('Fetching trade metrics for:', { tradeStatus, userId: user?.id });
      
      if (!user) {
        console.error('No user found');
        throw new Error('User not authenticated');
      }

      const { data: trades, error } = await supabase
        .from('trade_log')
        .select('*')
        .eq('profile_id', user.id)
        .eq('trade_status', tradeStatus)
        .eq('row_type', 'parent');

      if (error) {
        console.error('Error fetching trades for metrics:', error);
        throw error;
      }

      console.log('Raw trades data for metrics:', trades);

      if (!trades || trades.length === 0) {
        console.log('No trades found for metrics calculation');
        return {
          winLossRatio: 0,
          averageWinner: 0,
          averageLoser: 0,
          averageDays: 0,
          averageWinnerRoi: 0,
          averageLoserRoi: 0
        };
      }

      const winners = trades.filter(trade => (trade.pnl || 0) > 0);
      const losers = trades.filter(trade => (trade.pnl || 0) < 0);

      const winLossRatio = trades.length > 0 
        ? Number((winners.length / trades.length * 100).toFixed(2))
        : 0;

      const averageWinner = winners.length > 0
        ? Number((winners.reduce((sum, trade) => sum + (trade.pnl || 0), 0) / winners.length).toFixed(2))
        : 0;

      const averageLoser = losers.length > 0
        ? Number((losers.reduce((sum, trade) => sum + (trade.pnl || 0), 0) / losers.length).toFixed(2))
        : 0;

      const averageDays = trades.length > 0
        ? Math.ceil(trades.reduce((sum, trade) => sum + (trade.days_in_trade || 0), 0) / trades.length)
        : 0;

      const averageWinnerRoi = winners.length > 0
        ? Number((winners.reduce((sum, trade) => sum + (trade.roi_portfolio || 0), 0) / winners.length).toFixed(2))
        : 0;

      const averageLoserRoi = losers.length > 0
        ? Number((losers.reduce((sum, trade) => sum + (trade.roi_portfolio || 0), 0) / losers.length).toFixed(2))
        : 0;

      console.log('Calculated metrics:', { 
        winLossRatio, 
        averageWinner, 
        averageLoser, 
        averageDays,
        averageWinnerRoi,
        averageLoserRoi
      });

      return {
        winLossRatio,
        averageWinner,
        averageLoser,
        averageDays,
        averageWinnerRoi,
        averageLoserRoi
      };
    },
    enabled: !!user && tradeStatus === "closed"
  });

  if (tradeStatus === "open") return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <MetricCard
        title="Win/Loss Ratio"
        value={`${metrics?.winLossRatio.toFixed(2) || '0.00'}%`}
        isNumeric={true}
      />
      <MetricCard
        title="Average Winner"
        value={`$${(metrics?.averageWinner || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
        isNumeric={true}
      />
      <MetricCard
        title="Average Loser"
        value={`$${(metrics?.averageLoser || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
        isNumeric={true}
      />
      <MetricCard
        title="Average Days"
        value={`${metrics?.averageDays || 0}`}
      />
    </div>
  );
};

export default TradeMetrics;