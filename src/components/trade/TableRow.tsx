import { useState } from "react"
import {
  TableCell,
  TableRow as TableRowBase,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { TradeData } from "./types"
import { EditTradeSheet } from "./EditTradeSheet"
import { EditPositionSheet } from "./EditPositionSheet"
import { formatDate, formatNumber } from "./utils/formatters"
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
            portfolioId={row.portfolio_id}
          />
        </TableCell>
        <TableCell className={cn("sticky left-[100px] z-10 min-w-[200px] font-bold", getStickyBackground(isSubRow, row.trade_status, row.pnl))}>{row.ticker}</TableCell>
        <TableCell className="min-w-[180px]">{row.vehicle}</TableCell>
        <TableCell className="min-w-[180px]">{row.order}</TableCell>
        <TableCell>{formatNumber(row.qty)}</TableCell>
        <TableCell className="min-w-[140px]">{formatDate(row.date_entry)}</TableCell>
        <TableCell className="min-w-[140px]">{formatDate(row.date_expiration)}</TableCell>
        <TableCell className="min-w-[140px]">{formatDate(row.date_exit)}</TableCell>
        <TableCell className="min-w-[140px]">{formatNumber(row.days_in_trade)}</TableCell>
        <TableCell>{formatNumber(row.strike_start)}</TableCell>
        <TableCell>{formatNumber(row.strike_end)}</TableCell>
        <TableCell>{formatNumber(row.premium, 2)}</TableCell>
        <TableCell>{formatNumber(row.stock_price, 2)}</TableCell>
        <TableCell className="min-w-[100px]">{row["risk_%"] !== undefined && row["risk_%"] !== null ? `${formatNumber(row["risk_%"], 2)}%` : ""}</TableCell>
        <TableCell className="min-w-[100px]">{row["risk_$"] !== undefined && row["risk_$"] !== null ? `$${formatNumber(row["risk_$"])}` : ""}</TableCell>
        <TableCell>{row.commission !== undefined && row.commission !== null ? `$${formatNumber(row.commission)}` : ""}</TableCell>
        <TableCell className="font-bold">{row.pnl !== undefined && row.pnl !== null ? `$${formatNumber(row.pnl)}` : ""}</TableCell>
        <TableCell>{row.roi !== undefined && row.roi !== null ? `${formatNumber(row.roi, 2)}%` : ""}</TableCell>
        <TableCell>{row.roi_yearly !== undefined && row.roi_yearly !== null ? `${formatNumber(row.roi_yearly, 2)}%` : ""}</TableCell>
        <TableCell>{row.roi_portfolio !== undefined && row.roi_portfolio !== null ? `${formatNumber(row.roi_portfolio, 2)}%` : ""}</TableCell>
        <TableCell className="min-w-[120px]">{row.be_0 !== undefined && row.be_0 !== null ? `$${formatNumber(row.be_0, 2)}` : ""}</TableCell>
        <TableCell className="min-w-[120px]">{row.be_1 !== undefined && row.be_1 !== null ? `$${formatNumber(row.be_1, 2)}` : ""}</TableCell>
        <TableCell className="min-w-[120px]">{row.be_2 !== undefined && row.be_2 !== null ? `$${formatNumber(row.be_2, 2)}` : ""}</TableCell>
        <TableCell>{formatNumber(row.delta)}</TableCell>
        <TableCell>{row.iv !== undefined && row.iv !== null ? `${formatNumber(row.iv)}%` : ""}</TableCell>
        <TableCell>{row.iv_percentile !== undefined && row.iv_percentile !== null ? `${formatNumber(row.iv_percentile)}%` : ""}</TableCell>
        <TableCell className="min-w-[7000px]">{row.notes}</TableCell>
      </TableRowBase>
      
      {isEditSheetOpen && (
        row.row_type === 'parent' ? (
          <EditPositionSheet
            isOpen={isEditSheetOpen}
            onClose={() => setIsEditSheetOpen(false)}
            trade={row}
          />
        ) : (
          <EditTradeSheet
            isOpen={isEditSheetOpen}
            onClose={() => setIsEditSheetOpen(false)}
            trade={row}
          />
        )
      )}
    </>
  )
}