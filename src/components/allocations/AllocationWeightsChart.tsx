import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
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

  // Calculate reference lines positions between buckets
  const referenceLines = data.reduce((acc: string[], parent, index) => {
    if (index === 0) return acc;
    
    // Get the last child of the previous bucket
    const previousParentLastChildIndex = data
      .slice(0, index)
      .reduce((sum, p) => sum + (p.subRows?.length || 0), 0) - 1;
    
    // Get the first child of the current bucket
    const currentParentFirstChildIndex = previousParentLastChildIndex + 1;
    
    // If we have both a previous bucket's last child and current bucket's first child
    if (previousParentLastChildIndex >= 0 && currentParentFirstChildIndex < chartData.length) {
      // Place the line between them
      const lastChildBucket = chartData[previousParentLastChildIndex]?.bucket;
      const firstChildBucket = chartData[currentParentFirstChildIndex]?.bucket;
      if (lastChildBucket && firstChildBucket) {
        // Use a special marker to indicate this is a midpoint position
        acc.push(`${lastChildBucket}|${firstChildBucket}`);
      }
    }
    return acc;
  }, []);

  const getBarColor = (delta: number | undefined | null) => {
    if (delta === undefined || delta === null) return "#94a3b8"; // Default grey
    if (delta > 25) return "#22c55e"; // Green for > +25%
    if (delta < -25) return "#ef4444"; // Red for < -25%
    return "#94a3b8"; // Grey for values between -25% and +25%
  };

  console.log('Chart data:', chartData);
  console.log('Reference lines at:', referenceLines);

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
              {referenceLines.map((bucketPair) => {
                const [prevBucket, nextBucket] = bucketPair.split('|');
                // Position the line between the two buckets
                const xPosition = `${prevBucket}|${nextBucket}`;
                return (
                  <ReferenceLine
                    key={xPosition}
                    x={prevBucket}
                    stroke="#94a3b8"
                    strokeDasharray="3 3"
                    xAxisId={0}
                  />
                );
              })}
              <Bar
                dataKey="weight_target"
                fill="#2563eb"
                minPointSize={5}
                name="Target Weight"
              />
              <Bar
                dataKey="weight_actual"
                minPointSize={5}
                name="Actual Weight"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.delta)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AllocationWeightsChart;