import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type PortfolioDataPoint } from "@/utils/portfolioData";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: PortfolioDataPoint;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload || !payload[0] || !payload[0].payload) {
    return null;
  }

  const getValueColor = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (numValue > 0) return "text-green-600";
    if (numValue < 0) return "text-red-600";
    return "text-foreground";
  };

  const data = payload[0].payload;

  return (
    <div className="bg-white p-4 border rounded-lg shadow-lg">
      <p className="font-bold mb-2">{label}</p>
      <p className="text-foreground">
        Portfolio Value: ${data.value?.toLocaleString() ?? 'N/A'}
      </p>
      <p className={getValueColor(data.monthlyGain)}>
        Monthly Gain: ${data.monthlyGain?.toLocaleString() ?? 'N/A'}
      </p>
      <p className={getValueColor(data.monthlyReturn)}>
        Monthly Return: {data.monthlyReturn ?? 'N/A'}%
      </p>
      <p className={getValueColor(data.ytdGain)}>
        YTD Gain: ${data.ytdGain?.toLocaleString() ?? 'N/A'}
      </p>
      <p className={getValueColor(data.ytdReturn)}>
        YTD Return: {data.ytdReturn ?? 'N/A'}%
      </p>
    </div>
  );
};

interface PortfolioChartProps {
  data: PortfolioDataPoint[];
}

const PortfolioChart = ({ data }: PortfolioChartProps) => {
  const ascendingData = [...data].reverse();
  
  const values = ascendingData.map(item => item.value);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const padding = (maxValue - minValue) * 0.1;
  const domainMin = Math.floor((minValue - padding) / 1000) * 1000;
  const domainMax = Math.ceil((maxValue + padding) / 1000) * 1000;

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Portfolio Value</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={ascendingData}
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
                tickCount={6}
                tickFormatter={(value: number) => `$${Math.round(value).toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} />
              {ascendingData.map((entry) => 
                entry.month.includes("Dec") && (
                  <ReferenceLine
                    key={entry.month}
                    x={entry.month}
                    stroke="#94a3b8"
                    strokeDasharray="3 3"
                  />
                )
              )}
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