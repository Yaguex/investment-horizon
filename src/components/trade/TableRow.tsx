import React, { useState } from "react"
import { TableCell, TableRow as TableRowComponent } from "@/components/ui/table"
import { TradeActions } from "./actions/TradeActions"
import { EditTradeSheet } from "./EditTradeSheet"
import { TradeData } from "./types"
import { cn } from "@/lib/utils"

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

  return (
    <TableRowComponent className={cn(
      "group hover:bg-muted/50",
      isSubRow && "bg-muted/50"
    )}>
      <TableCell className="sticky left-0 bg-white group-hover:bg-muted/50">
        <TradeActions
          isSubRow={isSubRow}
          isExpanded={isExpanded}
          onToggle={onToggle}
          onEdit={() => setIsEditSheetOpen(true)}
          id={row.id}
          profileId={row.profile_id}
          tradeId={row.trade_id}
          tradeStatus={tradeStatus}
        />
      </TableCell>
      
      <TableCell>{row.ticker}</TableCell>
      <TableCell>{row.vehicle}</TableCell>
      <TableCell>{row.order}</TableCell>
      <TableCell>{row.qty}</TableCell>
      <TableCell>{row.date_entry}</TableCell>
      <TableCell>{row.date_expiration}</TableCell>
      <TableCell>{row.date_exit}</TableCell>
      <TableCell>{row.days_in_trade}</TableCell>
      <TableCell>{row.strike_start}</TableCell>
      <TableCell>{row.strike_end}</TableCell>
      <TableCell>{row.premium}</TableCell>
      <TableCell>{row.stock_price}</TableCell>
      <TableCell>{row["risk_%"]}</TableCell>
      <TableCell>{row["risk_$"]}</TableCell>
      <TableCell>{row.commission}</TableCell>
      <TableCell>{row.pnl}</TableCell>
      <TableCell>{row.roi}</TableCell>
      <TableCell>{row.roi_yearly}</TableCell>
      <TableCell>{row.roi_portfolio}</TableCell>
      <TableCell>{row.be_0}</TableCell>
      <TableCell>{row.be_1}</TableCell>
      <TableCell>{row.be_2}</TableCell>
      <TableCell>{row.delta}</TableCell>
      <TableCell>{row.iv}</TableCell>
      <TableCell>{row.iv_percentile}</TableCell>
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
