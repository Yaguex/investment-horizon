import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type TestResultsProps = {
  data: any
}

export default function TestResults({ data }: TestResultsProps) {
  if (!data) return null

  return (
    <div className="mt-4 grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Stock Price</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Mid: ${data.stock.mid || 'N/A'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Call Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <h3 className="font-semibold">Entry ({data.callOptions.entry.strike})</h3>
              <p>Symbol: {data.callOptions.entry.optionSymbol || 'N/A'}</p>
              <p>Mid: ${data.callOptions.entry.mid || 'N/A'}</p>
              <p>IV: {data.callOptions.entry.iv || 'N/A'}%</p>
            </div>
            <div>
              <h3 className="font-semibold">Target ({data.callOptions.target.strike})</h3>
              <p>Symbol: {data.callOptions.target.optionSymbol || 'N/A'}</p>
              <p>Mid: ${data.callOptions.target.mid || 'N/A'}</p>
              <p>IV: {data.callOptions.target.iv || 'N/A'}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Put Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <h3 className="font-semibold">Protection ({data.putOptions.protection.strike})</h3>
            <p>Symbol: {data.putOptions.protection.optionSymbol || 'N/A'}</p>
            <p>Mid: ${data.putOptions.protection.mid || 'N/A'}</p>
            <p>IV: {data.putOptions.protection.iv || 'N/A'}%</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}