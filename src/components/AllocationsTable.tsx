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
      bucket: "Growth",
      ticker: "VTI",
      vehicle: "ETF",
      qty: 100,
      strike_start: 200,
      strike_end: 0,
      premium: 1000,
      days_in_trade: 30,
      stock_price: 200,
      "risk_%": 5,
      "risk_$": 1000,
      notes: "US Total Market ETF",
      subRows: [
        {
          id: 2,
          profile_id: "1",
          trade_id: 1,
          row_type: "child",
          trade_status: "open",
          bucket: "Growth",
          ticker: "VTI",
          vehicle: "ETF",
          qty: 50,
          strike_start: 205,
          strike_end: 0,
          premium: 500,
          days_in_trade: 15,
          stock_price: 205,
          "risk_%": 2.5,
          "risk_$": 500,
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
      bucket: "International",
      ticker: "VXUS",
      vehicle: "ETF",
      qty: 200,
      strike_start: 55,
      strike_end: 0,
      premium: 2000,
      days_in_trade: 30,
      stock_price: 55,
      "risk_%": 10,
      "risk_$": 2000,
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
                  <TableHead>Delta</TableHead>
                  <TableHead>Risk profile</TableHead>
                  <TableHead>Dividend %</TableHead>
                  <TableHead>Dividend $</TableHead>
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