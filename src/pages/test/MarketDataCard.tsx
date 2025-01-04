import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StrikeData } from "./types"

interface MarketDataCardProps {
  title: string
  data: StrikeData | undefined
  strike: number | null
}

export const MarketDataCard = ({ title, data, strike }: MarketDataCardProps) => {
  if (!data) return null

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p><span className="font-semibold">Symbol:</span> {data.symbol}</p>
          <p><span className="font-semibold">Strike:</span> {strike}</p>
          {data.marketData && (
            <>
              <p><span className="font-semibold">Mid:</span> {data.marketData.mid}</p>
              <p><span className="font-semibold">Open Interest:</span> {data.marketData.openInterest}</p>
              <p><span className="font-semibold">IV:</span> {data.marketData.iv}</p>
              <p><span className="font-semibold">Delta:</span> {data.marketData.delta}</p>
              <p><span className="font-semibold">Intrinsic Value:</span> {data.marketData.intrinsicValue}</p>
              <p><span className="font-semibold">Extrinsic Value:</span> {data.marketData.extrinsic}</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}