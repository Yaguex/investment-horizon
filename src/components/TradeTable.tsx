import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { TableRow as TradeTableRow } from "./trade/TableRow"
import { TradeData } from "./trade/types"

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
  const mockData: TradeData[] = [
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
                <TableHead className="w-[100px]">Actions</TableHead>
                <TableHead>Ticker</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>QTY</TableHead>
                <TableHead className="min-w-[120px]">Date Entry</TableHead>
                <TableHead className="min-w-[120px]">Date Expiration</TableHead>
                <TableHead className="min-w-[120px]">Date Exit</TableHead>
                <TableHead className="min-w-[120px]">Days in Trade</TableHead>
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
                <TableHead className="min-w-[100px]">B/E 0</TableHead>
                <TableHead className="min-w-[100px]">B/E 1</TableHead>
                <TableHead className="min-w-[100px]">B/E 2</TableHead>
                <TableHead>Delta</TableHead>
                <TableHead>IV</TableHead>
                <TableHead>IV Percentile</TableHead>
                <TableHead className="min-w-[300px]">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockData.map((row) => (
                <>
                  <TradeTableRow 
                    key={row.id}
                    row={row}
                    isExpanded={expandedRows[row.id]}
                    onToggle={() => toggleRow(row.id)}
                  />
                  {expandedRows[row.id] && row.subRows?.map((subRow) => (
                    <TradeTableRow 
                      key={subRow.id}
                      row={subRow}
                      isExpanded={false}
                      isSubRow={true}
                      onToggle={() => {}}
                    />
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