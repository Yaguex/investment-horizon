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
  // Process data to get only parent rows
  const parentChartData = data.filter(row => row.row_type === 'parent');

  // Process data to get only child rows
  const childChartData = data.reduce((acc: any[], parent) => {
    if (parent.subRows) {
      const childRows = parent.subRows.map((child) => ({
        ...child,
        parentBucket: parent.bucket,
      }));
      return [...acc, ...childRows];
    }
    return acc;
  }, []);

  // Calculate reference lines positions for parent bucket separators in child chart
  const referenceLines = data.reduce((acc: string[], parent, index) => {
    if (index === 0) return acc;
    const previousParentLastChildIndex = data
      .slice(0, index)
      .reduce((sum, p) => sum + (p.subRows?.length || 0), 0);
    const childBucket = childChartData[previousParentLastChildIndex]?.bucket;
    if (childBucket) acc.push(childBucket);
    return acc;
  }, []);

  const getBarColor = (delta: number | undefined | null) => {
    if (delta === undefined || delta === null) return "#94a3b8"; // Default grey
    if (delta > 25) return "#22c55e"; // Green for > +25%
    if (delta < -25) return "#ef4444"; // Red for < -25%
    return "#94a3b8"; // Grey for values between -25% and +25%
  };

  const renderChart = (chartData: any[], showReferenceLines: boolean = false) => (
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
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ fill: '#ff0000', opacity: 0.1 }} // Changed the hover background color to red
          />
          {showReferenceLines && referenceLines.map((bucket) => (
            <ReferenceLine
              key={bucket}
              x={bucket}
              stroke="#94a3b8"
              strokeDasharray="3 3"
            />
          ))}
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
  );

  console.log('Parent chart data:', parentChartData);
  console.log('Child chart data:', childChartData);

  return (
    <Card className="animate-fade-in mb-6">
      <CardHeader>
        <CardTitle>Weight Distribution</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderChart(parentChartData)}
        {renderChart(childChartData, true)}
      </CardContent>
    </Card>
  );
};

export default AllocationWeightsChart;