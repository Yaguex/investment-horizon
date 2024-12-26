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
  const getDeltaColor = (delta: number | undefined | null) => {
    if (delta === undefined || delta === null) return ""
    if (delta < -10) return "text-red-500"
    if (delta > 10) return "text-green-500"
    return ""
  }

  const getDeltaDisplay = (delta: number | undefined | null) => {
    if (delta === undefined || delta === null) return ""
    if (delta >= -10 && delta <= 10) return ""
    return `${formatNumber(delta, 2)}%`
  }

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
      <TableCell className={cn("sticky left-[100px] z-10 min-w-[200px] font-bold", getStickyBackground(isSubRow, "open", 0))}>{row.bucket}</TableCell>
      <TableCell className="min-w-[200px]">{row.ticker}</TableCell>
      <TableCell className="min-w-[140px]">{row.vehicle}</TableCell>
      <TableCell>{formatNumber(row.weight_target, 2)}%</TableCell>
      <TableCell className="min-w-[140px]">${formatNumber(row.value_target, 0)}</TableCell>
      <TableCell className="min-w-[140px]">{formatNumber(row.weight_actual, 2)}%</TableCell>
      <TableCell className="min-w-[140px]">${formatNumber(row.value_actual, 0)}</TableCell>
      <TableCell className={cn("min-w-[140px] font-bold", getDeltaColor(row.delta))}>{getDeltaDisplay(row.delta)}</TableCell>
      <TableCell>{row.risk_profile}</TableCell>
      <TableCell>{formatNumber(row["dividend_%"], 2)}%</TableCell>
      <TableCell className="min-w-[160px]">${formatNumber(row["dividend_$"], 0)}</TableCell>
    </TableRowBase>
  )
}