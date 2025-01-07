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
      <CardContent>
        <div className="space-y-1 font-mono">
          <p>Ask: {marketData.ask}</p>
          <p>Bid: {marketData.bid}</p>
          <p>Mid: {marketData.mid}</p>
          <p>Last: {marketData.last}</p>
          <p>Volume: {marketData.volume}</p>
          <p>Open Interest: {marketData.openInterest}</p>
          <p>IV: {marketData.iv}</p>
          <p>Delta: {marketData.delta}</p>
          <p>Gamma: {marketData.gamma}</p>
          <p>Theta: {marketData.theta}</p>
          <p>Vega: {marketData.vega}</p>
          <p>Rho: {marketData.rho}</p>
          <p>Intrinsic Value: {marketData.intrinsicValue}</p>
          <p>Extrinsic Value: {marketData.extrinsicValue}</p>
          <p>Underlying Price: {marketData.underlyingPrice}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default StrikeDataCard