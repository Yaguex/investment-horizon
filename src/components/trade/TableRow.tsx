import React, { useState } from "react"
import { TableCell, TableRow as TableRowComponent } from "@/components/ui/table"
import { TradeActions } from "./actions/TradeActions"
import { EditTradeSheet } from "./EditTradeSheet"
import { TradeData } from "./types"
import { cn } from "@/lib/utils"
import { getRowBackground, getStickyBackground } from "./utils/styles"
import { formatNumber } from "./utils/formatters"

interface TableRowProps {
  row: TradeData
  isExpanded: boolean
  onToggle: () => void
  isSubRow?: boolean
  tradeStatus: "open" | "closed"
}

export const TableRow = ({ 
  row, 
  isExpanded, 
  onToggle, 
  isSubRow = false,
  tradeStatus 
}: TableRowProps) => {
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
  const effectiveTradeStatus = isSubRow ? row.trade_status as "open" | "closed" : tradeStatus

  return (
    <TableRowComponent className={cn(
      "group",
      getRowBackground(isSubRow, effectiveTradeStatus, row.pnl)
    )}>
      <TableCell className={cn(
        "sticky left-0",
        getStickyBackground(isSubRow, effectiveTradeStatus, row.pnl)
      )}>
        <TradeActions
          isSubRow={isSubRow}
          isExpanded={isExpanded}
          onToggle={onToggle}
          onEdit={() => setIsEditSheetOpen(true)}
          id={row.id}
          profileId={row.profile_id}
          tradeId={row.trade_id}
          tradeStatus={effectiveTradeStatus}
        />
      </TableCell>
      
      <TableCell>{row.ticker}</TableCell>
      <TableCell>{row.vehicle}</TableCell>
      <TableCell>{row.order}</TableCell>
      <TableCell>{formatNumber(row.qty)}</TableCell>
      <TableCell>{row.date_entry}</TableCell>
      <TableCell>{row.date_expiration}</TableCell>
      <TableCell>{row.date_exit}</TableCell>
      <TableCell>{formatNumber(row.days_in_trade)}</TableCell>
      <TableCell>{formatNumber(row.strike_start, 2)}</TableCell>
      <TableCell>{formatNumber(row.strike_end, 2)}</TableCell>
      <TableCell>{formatNumber(row.premium)}</TableCell>
      <TableCell>{formatNumber(row.stock_price, 2)}</TableCell>
      <TableCell>{formatNumber(row["risk_%"], 2)}</TableCell>
      <TableCell>{formatNumber(row["risk_$"])}</TableCell>
      <TableCell>{formatNumber(row.commission)}</TableCell>
      <TableCell>{formatNumber(row.pnl)}</TableCell>
      <TableCell>{formatNumber(row.roi, 2)}</TableCell>
      <TableCell>{formatNumber(row.roi_yearly, 2)}</TableCell>
      <TableCell>{formatNumber(row.roi_portfolio, 2)}</TableCell>
      <TableCell>{formatNumber(row.be_0, 2)}</TableCell>
      <TableCell>{formatNumber(row.be_1, 2)}</TableCell>
      <TableCell>{formatNumber(row.be_2, 2)}</TableCell>
      <TableCell>{formatNumber(row.delta, 2)}</TableCell>
      <TableCell>{formatNumber(row.iv, 2)}</TableCell>
      <TableCell>{formatNumber(row.iv_percentile, 2)}</TableCell>
      <TableCell>{row.notes}</TableCell>

      {isEditSheetOpen && (
        <EditTradeSheet
          isOpen={isEditSheetOpen}
          onClose={() => setIsEditSheetOpen(false)}
          trade={row}
        />
      )}
    </TableRowComponent>
  )
}