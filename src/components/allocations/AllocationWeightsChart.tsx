import { useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts"
import { Allocation } from "@/types/allocations"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

interface AllocationWeightsChartProps {
  allocations: Allocation[]
}

const AllocationWeightsChart = ({ allocations }: AllocationWeightsChartProps) => {
  const chartData = useMemo(() => {
    const data: any[] = []
    let lastParentIndex = 0

    allocations?.forEach((parent) => {
      parent.subRows?.forEach((child, index) => {
        data.push({
          name: `${child.bucket} - ${child.vehicle}`,
          weightTarget: child.weight_target || 0,
          weightActual: child.weight_actual || 0,
          isLastInGroup: index === (parent.subRows?.length || 0) - 1,
          parentIndex: lastParentIndex,
        })
      })
      lastParentIndex++
    })

    return data
  }, [allocations])

  const chartConfig = {
    target: {
      label: "Weight Target",
      theme: {
        light: "#2563eb", // blue-600
        dark: "#3b82f6", // blue-500
      },
    },
    actual: {
      label: "Weight Actual",
      theme: {
        light: "#ca8a04", // yellow-600
        dark: "#eab308", // yellow-500
      },
    },
  }

  return (
    <ChartContainer className="h-[400px]" config={chartConfig}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          barGap={0}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={100}
            interval={0}
            fontSize={12}
          />
          <YAxis
            label={{ value: "Weight (%)", angle: -90, position: "insideLeft" }}
          />
          <Tooltip content={<ChartTooltipContent />} />
          
          {/* Add reference lines to separate parent groups */}
          {chartData
            .filter((d) => d.isLastInGroup)
            .map((d, i) => (
              <ReferenceLine
                key={i}
                x={d.name}
                stroke="#374151"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
            ))}

          <Bar dataKey="weightTarget" name="target" fill="#2563eb" />
          <Bar dataKey="weightActual" name="actual" fill="#ca8a04" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

export default AllocationWeightsChart