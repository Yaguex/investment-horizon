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
import { TooltipProvider } from "@/components/ui/tooltip"

const AllocationsTable = () => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  // Dummy data that matches the TradeData structure
  const dummyData: TradeData[] = [
    {
      id: 1,
      profile_id: "1",
      trade_id: 1,
      row_type: "parent",
      trade_status: "open",
      ticker: "VTI",
      vehicle: "ETF",
      order: "Buy",
      qty: 100,
      date_entry: "2024-01-01",
      date_expiration: null,
      date_exit: null,
      days_in_trade: 30,
      strike_start: 200,
      strike_end: null,
      premium: 0,
      stock_price: 200,
      "risk_%": 5,
      "risk_$": 1000,
      commission: 0,
      pnl: 500,
      roi: 2.5,
      roi_yearly: 30,
      roi_portfolio: 1,
      be_0: 200,
      be_1: null,
      be_2: null,
      delta: 1,
      iv: null,
      iv_percentile: null,
      notes: "US Total Market ETF",
      subRows: [
        {
          id: 2,
          profile_id: "1",
          trade_id: 1,
          row_type: "child",
          trade_status: "open",
          ticker: "VTI",
          vehicle: "ETF",
          order: "Buy",
          qty: 50,
          date_entry: "2024-01-15",
          date_expiration: null,
          date_exit: null,
          days_in_trade: 15,
          strike_start: 205,
          strike_end: null,
          premium: 0,
          stock_price: 205,
          "risk_%": 2.5,
          "risk_$": 500,
          commission: 0,
          pnl: 250,
          roi: 1.25,
          roi_yearly: 30,
          roi_portfolio: 0.5,
          be_0: 205,
          be_1: null,
          be_2: null,
          delta: 1,
          iv: null,
          iv_percentile: null,
          notes: "Additional VTI purchase"
        }
      ]
    },
    {
      id: 3,
      profile_id: "1",
      trade_id: 2,
      row_type: "parent",
      trade_status: "open",
      ticker: "VXUS",
      vehicle: "ETF",
      order: "Buy",
      qty: 200,
      date_entry: "2024-01-01",
      date_expiration: null,
      date_exit: null,
      days_in_trade: 30,
      strike_start: 55,
      strike_end: null,
      premium: 0,
      stock_price: 55,
      "risk_%": 10,
      "risk_$": 2000,
      commission: 0,
      pnl: -100,
      roi: -0.5,
      roi_yearly: -6,
      roi_portfolio: -0.2,
      be_0: 55,
      be_1: null,
      be_2: null,
      delta: 1,
      iv: null,
      iv_percentile: null,
      notes: "International ETF",
      subRows: []
    }
  ]

  return (
    <TooltipProvider>
      <Card className="mt-6">
        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-white">
                  <TableHead className="sticky left-0 z-20 w-[100px] bg-white after:absolute after:right-0 after:top-0 after:h-full after:w-px after:bg-border">Actions</TableHead>
                  <TableHead className="sticky left-[100px] z-20 min-w-[200px] bg-white after:absolute after:right-0 after:top-0 after:h-full after:w-px after:bg-border">Bucket</TableHead>
                  <TableHead className="min-w-[140px]">Ticker</TableHead>
                  <TableHead className="min-w-[140px]">Vehicle</TableHead>
                  <TableHead>Weight target</TableHead>
                  <TableHead className="min-w-[140px]">Value target</TableHead>
                  <TableHead className="min-w-[140px]">Weight actual</TableHead>
                  <TableHead className="min-w-[140px]">Value actual</TableHead>
                  <TableHead className="min-w-[140px]">Delta</TableHead>
                  <TableHead>Risk profile</TableHead>
                  <TableHead>Dividend %</TableHead>
                  <TableHead>Dividend $</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dummyData.map((trade) => (
                  <>
                    <TableRow 
                      key={trade.id}
                      className="group"
                    >
                      <TableCell className="sticky left-0 z-10 w-[100px]">
                        Actions
                      </TableCell>
                      <TableCell className="sticky left-[100px] z-10 min-w-[200px] font-bold">
                        {trade.ticker}
                      </TableCell>
                      <TableCell>{trade.vehicle}</TableCell>
                      <TableCell>{trade.order}</TableCell>
                      <TableCell>{trade.qty}</TableCell>
                      <TableCell>{trade.date_entry}</TableCell>
                      <TableCell>{trade.date_expiration}</TableCell>
                      <TableCell>{trade.date_exit}</TableCell>
                      <TableCell>{trade.days_in_trade}</TableCell>
                      <TableCell>{trade.strike_start}</TableCell>
                      <TableCell>{trade.strike_end}</TableCell>
                      <TableCell>{trade.premium}</TableCell>
                    </TableRow>
                    {expandedRows[trade.id] && trade.subRows?.map((subRow) => (
                      <TableRow 
                        key={subRow.id}
                        className="group bg-muted/50"
                      >
                        <TableCell className="sticky left-0 z-10 w-[100px]">
                          Actions
                        </TableCell>
                        <TableCell className="sticky left-[100px] z-10 min-w-[200px] font-bold">
                          {subRow.ticker}
                        </TableCell>
                        <TableCell>{subRow.vehicle}</TableCell>
                        <TableCell>{subRow.order}</TableCell>
                        <TableCell>{subRow.qty}</TableCell>
                        <TableCell>{subRow.date_entry}</TableCell>
                        <TableCell>{subRow.date_expiration}</TableCell>
                        <TableCell>{subRow.date_exit}</TableCell>
                        <TableCell>{subRow.days_in_trade}</TableCell>
                        <TableCell>{subRow.strike_start}</TableCell>
                        <TableCell>{subRow.strike_end}</TableCell>
                        <TableCell>{subRow.premium}</TableCell>
                      </TableRow>
                    ))}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

export default AllocationsTable