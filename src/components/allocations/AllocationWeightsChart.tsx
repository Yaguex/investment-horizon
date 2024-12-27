import { Allocation } from "@/types/allocations"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine
} from "recharts"

interface AllocationWeightsChartProps {
  allocations: Allocation[]
}

export const AllocationWeightsChart = ({ allocations }: AllocationWeightsChartProps) => {
  // Process data to get child rows and their parent buckets
  const chartData = allocations.reduce((acc: any[], parent) => {
    if (parent.subRows) {
      const parentBucket = parent.bucket
      parent.subRows.forEach((child) => {
        acc.push({
          bucket: child.bucket,
          parentBucket,
          weightTarget: child.weight_target || 0,
          weightActual: child.weight_actual || 0,
        })
      })
    }
    return acc
  }, [])

  console.log('Chart data:', chartData)

  // Find indices where parent bucket changes to add separator lines
  const separatorIndices = chartData.reduce((acc: number[], curr, idx) => {
    if (idx > 0 && curr.parentBucket !== chartData[idx - 1].parentBucket) {
      acc.push(idx - 0.5) // Subtract 0.5 to place line between bars
    }
    return acc
  }, [])

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        barSize={20}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="bucket"
          interval={0}
          angle={-45}
          textAnchor="end"
          height={100}
        />
        <YAxis />
        <Tooltip />
        
        {/* Add separator lines */}
        {separatorIndices.map((index) => (
          <ReferenceLine
            key={index}
            x={index}
            stroke="#666"
            strokeDasharray="3 3"
            strokeWidth={1}
          />
        ))}

        <Bar
          dataKey="weightTarget"
          fill="#3b82f6"
          name="Weight Target"
          minPointSize={5}
        />
        <Bar
          dataKey="weightActual"
          fill="#fbbf24"
          name="Weight Actual"
          minPointSize={5}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}