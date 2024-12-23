import { useEffect, useState } from "react";
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

const generateSampleData = () => {
  const data = [];
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  
  let value = 100000;
  const startDate = new Date(2021, 6); // July 2021
  const endDate = new Date();
  let currentDate = startDate;
  
  while (currentDate <= endDate) {
    const month = months[currentDate.getMonth()];
    const year = currentDate.getFullYear();
    value = value * (1 + (Math.random() * 0.1 - 0.03));
    
    const ytdReturn = ((value - 100000) / 100000) * 100;
    const netFlow = Math.random() > 0.5 ? Math.round(Math.random() * 5000) : -Math.round(Math.random() * 5000);
    
    data.push({
      date: `${month} ${year}`,
      value: Math.round(value),
      ytdReturn: ytdReturn.toFixed(2),
      netFlow
    });
    
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return data;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border rounded-lg shadow-lg">
        <p className="font-bold">{label}</p>
        <p className="text-primary">
          Value: ${payload[0].value.toLocaleString()}
        </p>
        <p className={Number(payload[0].payload.ytdReturn) >= 0 ? "text-green-600" : "text-red-600"}>
          YTD Return: {payload[0].payload.ytdReturn}%
        </p>
      </div>
    );
  }
  return null;
};

const PortfolioChart = () => {
  const [data, setData] = useState(generateSampleData());

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Portfolio Value Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                interval={2}
              />
              <YAxis
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