import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MarketData } from "./types"

interface StrikeDataCardProps {
  title: string
  symbol: string
  marketData: MarketData | null
}

const StrikeDataCard = ({ title, symbol, marketData }: StrikeDataCardProps) => {
  if (!marketData) return null

  return (
    <Card className="w-full mb-4">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{symbol}</p>
      </CardHeader>
      <CardContent className="space-y-2">
        <p>Mid: {marketData.mid}</p>
        <p>Open Interest: {marketData.openInterest}</p>
        <p>IV: {marketData.iv}</p>
        <p>Delta: {marketData.delta}</p>
        <p>Intrinsic Value: {marketData.intrinsicValue}</p>
        <p>Extrinsic Value: {marketData.extrinsicValue}</p>
        <p>Underlying Price: {marketData.underlyingPrice}</p>
      </CardContent>
    </Card>
  )
}

export default StrikeDataCard