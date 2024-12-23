import { useEffect, useState } from "react";
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

const generateSampleData = () => {
  const data = [];
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  
  let value = 100000;
  let previousValue = value;
  const startDate = new Date(2021, 6); // July 2021
  const endDate = new Date();
  let currentDate = startDate;
  let yearStartValue = value;
  
  while (currentDate <= endDate) {
    const month = months[currentDate.getMonth()];
    const year = currentDate.getFullYear();
    
    // Reset YTD tracking at start of year
    if (month === "Jan") {
      yearStartValue = value;
    }
    
    value = value * (1 + (Math.random() * 0.1 - 0.03));
    const monthlyGain = value - previousValue;
    const monthlyReturn = ((value - previousValue) / previousValue) * 100;
    const ytdGain = value - yearStartValue;
    const ytdReturn = ((value - yearStartValue) / yearStartValue) * 100;
    
    data.push({
      date: `${month} ${year}`,
      value: Math.round(value),
      monthlyGain: Math.round(monthlyGain),
      monthlyReturn: monthlyReturn.toFixed(2),
      ytdGain: Math.round(ytdGain),
      ytdReturn: ytdReturn.toFixed(2),
      isYearEnd: month === "Dec"
    });
    
    previousValue = value;
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return data;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const getValueColor = (value: number) => {
      if (value > 0) return "text-green-600";
      if (value < 0) return "text-red-600";
      return "text-foreground";
    };

    const data = payload[0].payload;

    return (
      <div className="bg-white p-4 border rounded-lg shadow-lg">
        <p className="font-bold mb-2">{label}</p>
        <p className="text-foreground">
          Portfolio Value: ${data.value.toLocaleString()}
        </p>
        <p className={getValueColor(data.monthlyGain)}>
          Monthly Gain: ${data.monthlyGain.toLocaleString()}
        </p>
        <p className={getValueColor(Number(data.monthlyReturn))}>
          Monthly Return: {data.monthlyReturn}%
        </p>
        <p className={getValueColor(data.ytdGain)}>
          YTD Gain: ${data.ytdGain.toLocaleString()}
        </p>
        <p className={getValueColor(Number(data.ytdReturn))}>
          YTD Return: {data.ytdReturn}%
        </p>
      </div>
    );
  }
  return null;
};

const PortfolioChart = () => {
  const [data, setData] = useState(generateSampleData());

  // Calculate domain padding
  const values = data.map(item => item.value);
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
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                interval={2}
              />
              <YAxis
                domain={[domainMin, domainMax]}
                tick={{ fontSize: 12 }}
                tickCount={6}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} />
              {data.map((entry) => 
                entry.isYearEnd && (
                  <ReferenceLine
                    key={entry.date}
                    x={entry.date}
                    stroke="#gray"
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