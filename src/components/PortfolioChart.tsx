import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePortfolio } from "@/contexts/PortfolioContext";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const getReturnColor = (value: number) => {
      if (value > 0) return "text-green-600";
      if (value < 0) return "text-red-600";
      return "text-foreground";
    };

    return (
      <div className="bg-white p-4 border rounded-lg shadow-lg">
        <p className="font-bold">{label}</p>
        <p className="text-foreground">
          Value: ${payload[0].value.toLocaleString()}
        </p>
        <p className={getReturnColor(Number(payload[0].payload.ytdReturn))}>
          YTD Return: {payload[0].payload.ytdReturn}%
        </p>
      </div>
    );
  }
  return null;
};

const PortfolioChart = () => {
  const { portfolioData } = usePortfolio();
  const sortedData = [...portfolioData].reverse(); // Reverse to show ascending order

  // Calculate domain padding
  const values = sortedData.map(item => item.value);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const padding = (maxValue - minValue) * 0.1;
  const domainMin = minValue - padding;
  const domainMax = maxValue + padding;

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Portfolio Value Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={sortedData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                interval={2}
              />
              <YAxis
                domain={[domainMin, domainMax]}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${(value / 1000)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioChart;