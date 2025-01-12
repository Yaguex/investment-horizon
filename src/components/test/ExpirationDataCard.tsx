import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ExpirationDataCardProps {
  ticker: string
  expirations: string[]
}

const ExpirationDataCard = ({ ticker, expirations }: ExpirationDataCardProps) => {
  if (!expirations.length) return null

  return (
    <Card className="w-full mb-4">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{ticker}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 font-mono">
          {expirations.map((date, index) => (
            <p key={index}>{date}</p>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default ExpirationDataCard