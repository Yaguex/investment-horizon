import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Rectangle,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Allocation } from "@/types/allocations";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload) return null;

  return (
    <div className="bg-white p-4 border rounded-lg shadow-lg">
      <p className="font-bold mb-2">{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} className="text-sm">
          {item.dataKey === "weight_target" ? "Target" : "Actual"}: {item.value.toFixed(2)}%
        </p>
      ))}
    </div>
  );
};

// Custom background component for alternating colors
const CustomBackground = (props: any) => {
  const { x, y, width, height, index } = props;
  const isEvenBucket = Math.floor(index / 2) % 2 === 0;
  
  return (
    <Rectangle
      x={x}
      y={y}
      width={width}
      height={height}
      fill={isEvenBucket ? "#FFFFFF" : "#f3f3f3"}
    />
  );
};

interface AllocationWeightsChartProps {
  data: Allocation[];
}

const AllocationWeightsChart = ({ data }: AllocationWeightsChartProps) => {
  // Process data to get only child rows and add parent bucket info
  const chartData = data.reduce((acc: any[], parent) => {
    if (parent.subRows) {
      const childRows = parent.subRows.map((child) => ({
        ...child,
        parentBucket: parent.bucket,
      }));
      return [...acc, ...childRows];
    }
    return acc;
  }, []);

  console.log('Chart data:', chartData);

  return (
    <Card className="animate-fade-in mb-6">
      <CardHeader>
        <CardTitle>Weight Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              barCategoryGap="20%"
              barGap={0}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="bucket"
                tick={{ fontSize: 12 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis
                tickFormatter={(value) => `${value}%`}
                domain={[0, 'auto']}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <defs>
                <clipPath id="backgroundClip">
                  <rect x="0" y="0" width="100%" height="100%" />
                </clipPath>
              </defs>
              <g clipPath="url(#backgroundClip)">
                {chartData.map((entry: any, index: number) => (
                  <CustomBackground
                    key={`background-${index}`}
                    x={index * (100 / chartData.length)}
                    y={0}
                    width={100 / chartData.length}
                    height="100%"
                    index={Math.floor(index / 2)}
                  />
                ))}
              </g>
              <Bar
                dataKey="weight_target"
                fill="#2563eb"
                minPointSize={5}
                name="Target Weight"
              />
              <Bar
                dataKey="weight_actual"
                fill="#eab308"
                minPointSize={5}
                name="Actual Weight"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AllocationWeightsChart;