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
                  <TableHead className="sticky left-[100px] z-20 min-w-[200px] bg-white after:absolute after:right-0 after:top-0 after:h-full after:w-px after:bg-border">Ticker</TableHead>
                  <TableHead className="min-w-[140px]">Vehicle</TableHead>
                  <TableHead className="min-w-[140px]">Order</TableHead>
                  <TableHead>QTY</TableHead>
                  <TableHead className="min-w-[140px]">Date Entry</TableHead>
                  <TableHead className="min-w-[140px]">Date Expiration</TableHead>
                  <TableHead className="min-w-[140px]">Date Exit</TableHead>
                  <TableHead className="min-w-[140px]">Days in Trade</TableHead>
                  <TableHead>Strike Start</TableHead>
                  <TableHead>Strike End</TableHead>
                  <TableHead>Premium</TableHead>
                  <TableHead>Stock Price</TableHead>
                  <TableHead className="min-w-[100px]">Risk %</TableHead>
                  <TableHead className="min-w-[100px]">Risk $</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>PnL</TableHead>
                  <TableHead>ROI</TableHead>
                  <TableHead>Yearly ROI</TableHead>
                  <TableHead>ROI Portfolio</TableHead>
                  <TableHead className="min-w-[120px]">B/E 0</TableHead>
                  <TableHead className="min-w-[120px]">B/E 1</TableHead>
                  <TableHead className="min-w-[120px]">B/E 2</TableHead>
                  <TableHead>Delta</TableHead>
                  <TableHead>IV</TableHead>
                  <TableHead>IV Percentile</TableHead>
                  <TableHead className="min-w-[7000px]">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dummyData.map((trade) => (
                  <>
                    <TradeTableRow 
                      key={trade.id}
                      row={trade}
                      isExpanded={expandedRows[trade.id]}
                      onToggle={() => toggleRow(trade.id.toString())}
                      tradeStatus="open"
                    />
                    {expandedRows[trade.id] && trade.subRows?.map((subRow) => (
                      <TradeTableRow 
                        key={subRow.id}
                        row={subRow}
                        isExpanded={false}
                        isSubRow={true}
                        onToggle={() => {}}
                        tradeStatus="open"
                      />
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