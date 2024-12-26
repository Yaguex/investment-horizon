import {
  TableCell,
  TableRow as TableRowBase,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { Allocation } from "@/types/allocations"
import { formatNumber } from "../trade/utils/formatters"
import { getRowBackground, getStickyBackground } from "../trade/utils/styles"
import { TradeActions } from "../trade/actions/TradeActions"

interface TableRowProps {
  row: Allocation
  isExpanded: boolean
  isSubRow?: boolean
  onToggle: () => void
}

export const TableRow = ({ row, isExpanded, isSubRow = false, onToggle }: TableRowProps) => {
  return (
    <TableRowBase 
      className={cn("group", getRowBackground(isSubRow, "open", 0))}
    >
      <TableCell className={cn("sticky left-0 z-10 w-[100px]", getStickyBackground(isSubRow, "open", 0))}>
        <TradeActions 
          isSubRow={isSubRow}
          isExpanded={isExpanded}
          onToggle={onToggle}
          onEdit={() => {}}
          id={row.id}
          profileId={row.profile_id}
          ticker={row.ticker || ''}
        />
      </TableCell>
      <TableCell className={cn("sticky left-[100px] z-10 min-w-[200px]", getStickyBackground(isSubRow, "open", 0))}>{row.bucket}</TableCell>
      <TableCell className="min-w-[140px]">{row.ticker}</TableCell>
      <TableCell className="min-w-[140px]">{row.vehicle}</TableCell>
      <TableCell>{formatNumber(row.weight_target, 2)}%</TableCell>
      <TableCell className="min-w-[140px]">${formatNumber(row.value_target, 2)}</TableCell>
      <TableCell className="min-w-[140px]">{formatNumber(row.weight_actual, 2)}%</TableCell>
      <TableCell className="min-w-[140px]">${formatNumber(row.value_actual, 2)}</TableCell>
      <TableCell className="min-w-[140px]">${formatNumber(row.delta, 2)}</TableCell>
      <TableCell>{row.risk_profile}</TableCell>
      <TableCell>{formatNumber(row["dividend_%"], 2)}%</TableCell>
      <TableCell>${formatNumber(row["dividend_$"], 2)}</TableCell>
    </TableRowBase>
  )
}