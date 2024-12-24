import { useState } from "react"
import { ArrowDown, ArrowUp } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface TradeTableProps {
  tradeStatus: "open" | "closed"
}

const TradeTable = ({ tradeStatus }: TradeTableProps) => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  // Mock data for now - will be replaced with actual data from Supabase
  const mockData = [
    {
      id: "1",
      ticker: "AAPL",
      vehicle: "Stock",
      order: "Buy",
      qty: 100,
      dateEntry: "2024-01-01",
      dateExpiration: "2024-12-31",
      dateExit: "",
      daysInTrade: 30,
      strikeStart: 150,
      strikeEnd: 160,
      premium: 500,
      stockPrice: 155,
      riskPercentage: 5,
      riskDollars: 750,
      commission: 10,
      pnl: 1000,
      roi: 15,
      roiYearly: 180,
      roiPortfolio: 2,
      be0: 145,
      be1: 150,
      be2: 155,
      delta: 0.5,
      iv: 30,
      ivPercentile: 60,
      notes: "Initial position",
      subRows: [
        {
          id: "1-1",
          ticker: "AAPL",
          vehicle: "Stock",
          order: "Sell",
          qty: 50,
          dateEntry: "2024-01-15",
          dateExpiration: "2024-12-31",
          dateExit: "2024-01-15",
          daysInTrade: 15,
          strikeStart: 150,
          strikeEnd: 160,
          premium: 250,
          stockPrice: 158,
          riskPercentage: 2.5,
          riskDollars: 375,
          commission: 5,
          pnl: 500,
          roi: 7.5,
          roiYearly: 90,
          roiPortfolio: 1,
          be0: 145,
          be1: 150,
          be2: 155,
          delta: 0.25,
          iv: 30,
          ivPercentile: 60,
          notes: "Partial exit"
        }
      ]
    }
  ]

  return (
    <Card className="mt-6">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Ticker</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>QTY</TableHead>
                <TableHead>Date Entry</TableHead>
                <TableHead>Date Expiration</TableHead>
                <TableHead>Date Exit</TableHead>
                <TableHead>Days in Trade</TableHead>
                <TableHead>Strike Start</TableHead>
                <TableHead>Strike End</TableHead>
                <TableHead>Premium</TableHead>
                <TableHead>Stock Price</TableHead>
                <TableHead>Risk %</TableHead>
                <TableHead>Risk $</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>PnL</TableHead>
                <TableHead>ROI</TableHead>
                <TableHead>Yearly ROI</TableHead>
                <TableHead>ROI Portfolio</TableHead>
                <TableHead>B/E 0</TableHead>
                <TableHead>B/E 1</TableHead>
                <TableHead>B/E 2</TableHead>
                <TableHead>Delta</TableHead>
                <TableHead>IV</TableHead>
                <TableHead>IV Percentile</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockData.map((row) => (
                <>
                  <TableRow 
                    key={row.id}
                    className="bg-yellow-50 hover:bg-yellow-100 cursor-pointer"
                    onClick={() => toggleRow(row.id)}
                  >
                    <TableCell>
                      {expandedRows[row.id] ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )}
                    </TableCell>
                    <TableCell>{row.ticker}</TableCell>
                    <TableCell>{row.vehicle}</TableCell>
                    <TableCell>{row.order}</TableCell>
                    <TableCell>{row.qty}</TableCell>
                    <TableCell>{row.dateEntry}</TableCell>
                    <TableCell>{row.dateExpiration}</TableCell>
                    <TableCell>{row.dateExit}</TableCell>
                    <TableCell>{row.daysInTrade}</TableCell>
                    <TableCell>{row.strikeStart}</TableCell>
                    <TableCell>{row.strikeEnd}</TableCell>
                    <TableCell>${row.premium}</TableCell>
                    <TableCell>${row.stockPrice}</TableCell>
                    <TableCell>{row.riskPercentage}%</TableCell>
                    <TableCell>${row.riskDollars}</TableCell>
                    <TableCell>${row.commission}</TableCell>
                    <TableCell>${row.pnl}</TableCell>
                    <TableCell>{row.roi}%</TableCell>
                    <TableCell>{row.roiYearly}%</TableCell>
                    <TableCell>{row.roiPortfolio}%</TableCell>
                    <TableCell>${row.be0}</TableCell>
                    <TableCell>${row.be1}</TableCell>
                    <TableCell>${row.be2}</TableCell>
                    <TableCell>{row.delta}</TableCell>
                    <TableCell>{row.iv}%</TableCell>
                    <TableCell>{row.ivPercentile}%</TableCell>
                    <TableCell>{row.notes}</TableCell>
                  </TableRow>
                  {expandedRows[row.id] && row.subRows?.map((subRow) => (
                    <TableRow 
                      key={subRow.id}
                      className="bg-white hover:bg-gray-50"
                    >
                      <TableCell></TableCell>
                      <TableCell>{subRow.ticker}</TableCell>
                      <TableCell>{subRow.vehicle}</TableCell>
                      <TableCell>{subRow.order}</TableCell>
                      <TableCell>{subRow.qty}</TableCell>
                      <TableCell>{subRow.dateEntry}</TableCell>
                      <TableCell>{subRow.dateExpiration}</TableCell>
                      <TableCell>{subRow.dateExit}</TableCell>
                      <TableCell>{subRow.daysInTrade}</TableCell>
                      <TableCell>{subRow.strikeStart}</TableCell>
                      <TableCell>{subRow.strikeEnd}</TableCell>
                      <TableCell>${subRow.premium}</TableCell>
                      <TableCell>${subRow.stockPrice}</TableCell>
                      <TableCell>{subRow.riskPercentage}%</TableCell>
                      <TableCell>${subRow.riskDollars}</TableCell>
                      <TableCell>${subRow.commission}</TableCell>
                      <TableCell>${subRow.pnl}</TableCell>
                      <TableCell>{subRow.roi}%</TableCell>
                      <TableCell>{subRow.roiYearly}%</TableCell>
                      <TableCell>{subRow.roiPortfolio}%</TableCell>
                      <TableCell>${subRow.be0}</TableCell>
                      <TableCell>${subRow.be1}</TableCell>
                      <TableCell>${subRow.be2}</TableCell>
                      <TableCell>{subRow.delta}</TableCell>
                      <TableCell>{subRow.iv}%</TableCell>
                      <TableCell>{subRow.ivPercentile}%</TableCell>
                      <TableCell>{subRow.notes}</TableCell>
                    </TableRow>
                  ))}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export default TradeTable