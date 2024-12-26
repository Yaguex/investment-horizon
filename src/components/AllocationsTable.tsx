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

  // Local dummy data
  const dummyData: TradeData[] = [
    {
      id: 1,
      profile_id: "1",
      ticker: "VTI",
      vehicle: "ETF",
      bucket: "US Equities",
      trade_status: "open",
      row_type: "parent",
      notes: "US Total Market ETF",
      subRows: [
        {
          id: 2,
          profile_id: "1",
          ticker: "VTI",
          vehicle: "ETF",
          bucket: "US Equities",
          trade_status: "open",
          row_type: "child",
          notes: "Additional VTI purchase"
        }
      ]
    },
    {
      id: 3,
      profile_id: "1",
      ticker: "VXUS",
      vehicle: "ETF",
      bucket: "International Equities",
      trade_status: "open",
      row_type: "parent",
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