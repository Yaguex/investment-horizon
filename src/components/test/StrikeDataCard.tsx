import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MarketData } from "@/integrations/supabase/types"
import MetricCard from "../MetricCard"

interface StrikeDataCardProps {
  title: string
  marketData: MarketData | null
}

const formatValue = (value: number | undefined | null) => {
  if (value === undefined || value === null) return "N/A"
  return value.toFixed(2)
}

const StrikeDataCard = ({ title, marketData }: StrikeDataCardProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <MetricCard
          title="Mid"
          value={formatValue(marketData?.mid)}
          isNumeric
        />
        <MetricCard
          title="Open Interest"
          value={formatValue(marketData?.openInterest)}
          isNumeric
        />
        <MetricCard
          title="IV"
          value={formatValue(marketData?.iv)}
          isNumeric
        />
        <MetricCard
          title="Delta"
          value={formatValue(marketData?.delta)}
          isNumeric
        />
      </CardContent>
    </Card>
  )
}

export default StrikeDataCard