import { useState } from "react"
import {
  TableCell,
  TableRow as TableRowBase,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { TradeData } from "./types"
import { EditTradeSheet } from "./EditTradeSheet"
import { formatNumber } from "./utils/formatters"
import { getRowBackground, getStickyBackground } from "./utils/styles"
import { TradeActions } from "./actions/TradeActions"

interface TableRowProps {
  row: TradeData
  isExpanded: boolean
  isSubRow?: boolean
  onToggle: () => void
  tradeStatus: "open" | "closed"
}

export const TableRow = ({ row, isExpanded, isSubRow = false, onToggle, tradeStatus }: TableRowProps) => {
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)

  return (
    <>
      <TableRowBase 
        className={cn("group", getRowBackground(isSubRow, row.trade_status, row.pnl))}
      >
        <TableCell className={cn("sticky left-0 z-10 w-[100px]", getStickyBackground(isSubRow, row.trade_status, row.pnl))}>
          <TradeActions 
            isSubRow={isSubRow}
            isExpanded={isExpanded}
            onToggle={onToggle}
            onEdit={() => setIsEditSheetOpen(true)}
            tradeId={row.trade_id}
            id={row.id}
            profileId={row.profile_id}
            ticker={row.ticker}
          />
        </TableCell>
        <TableCell className={cn("sticky left-[100px] z-10 min-w-[200px] font-bold", getStickyBackground(isSubRow, row.trade_status, row.pnl))}>{row.bucket}</TableCell>
        <TableCell className="min-w-[140px]">{row.ticker}</TableCell>
        <TableCell className="min-w-[140px]">{row.vehicle}</TableCell>
        <TableCell>{formatNumber(row.qty)}</TableCell>
        <TableCell className="min-w-[140px]">{formatNumber(row.strike_start)}</TableCell>
        <TableCell className="min-w-[140px]">{formatNumber(row.strike_end)}</TableCell>
        <TableCell className="min-w-[140px]">{formatNumber(row.premium)}</TableCell>
        <TableCell>{formatNumber(row.days_in_trade)}</TableCell>
        <TableCell>{formatNumber(row.stock_price)}</TableCell>
        <TableCell>{row["risk_%"] !== undefined && row["risk_%"] !== null ? `${formatNumber(row["risk_%"], 2)}%` : ""}</TableCell>
        <TableCell>{row["risk_$"] !== undefined && row["risk_$"] !== null ? `$${formatNumber(row["risk_$"])}` : ""}</TableCell>
      </TableRowBase>
      
      {isEditSheetOpen && (
        <EditTradeSheet
          isOpen={isEditSheetOpen}
          onClose={() => setIsEditSheetOpen(false)}
          trade={row}
        />
      )}
    </>
  )
}