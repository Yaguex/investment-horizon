import { useState } from "react"
import {
  TableCell,
  TableRow as TableRowBase,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { Allocation } from "@/types/allocations"
import { formatNumber } from "../trade/utils/formatters"
import { getRowBackground, getStickyBackground } from "../trade/utils/styles"
import { AllocationActions } from "./actions/AllocationActions"
import { EditBucketSheet } from "./EditBucketSheet"
import { EditSubBucketSheet } from "./EditSubBucketSheet"

interface TableRowProps {
  row: Allocation
  isExpanded: boolean
  isSubRow?: boolean
  onToggle: () => void
}

export const TableRow = ({ row, isExpanded, isSubRow = false, onToggle }: TableRowProps) => {
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)

  const getDeltaColor = (delta: number | undefined | null) => {
    if (delta === undefined || delta === null) return ""
    if (delta < -25) return "text-red-500"
    if (delta > 25) return "text-green-500"
    return ""
  }

  const formatDelta = (delta: number | undefined | null) => {
    if (delta === undefined || delta === null) return "0"
    
    // Special case: if weight_target is 0
    if (row.weight_target === 0) {
      return row.weight_actual && row.weight_actual > 0 ? "100" : "0"
    }
    
    // Cap display values at ±100%
    if (delta > 100) return "100"
    if (delta < -100) return "-100"
    
    return formatNumber(delta, 0)
  }

  return (
    <>
      <TableRowBase 
        className={cn("group", getRowBackground(isSubRow, "open", 0))}
      >
        <TableCell className={cn("sticky left-0 z-10 w-[100px]", getStickyBackground(isSubRow, "open", 0))}>
          <AllocationActions 
            isSubRow={isSubRow}
            isExpanded={isExpanded}
            onToggle={onToggle}
            onEdit={() => setIsEditSheetOpen(true)}
            id={row.id}
            profileId={row.profile_id}
            bucket={row.bucket}
            bucketId={row.bucket_id}
          />
        </TableCell>
        <TableCell className={cn(
          "sticky left-[100px] z-10 min-w-[200px]",
          getStickyBackground(isSubRow, "open", 0),
          !isSubRow && "font-bold"
        )}>{row.bucket}</TableCell>
        <TableCell className="min-w-[120px]">{row.vehicle}</TableCell>
        <TableCell className="min-w-[140px]">${formatNumber(row.value_target, 0)}</TableCell>
        <TableCell className="min-w-[140px]">${formatNumber(row.value_actual, 0)}</TableCell>
        <TableCell className="min-w-[140px]">{formatNumber(row.weight_target, 2)}%</TableCell>
        <TableCell className="min-w-[140px]">{formatNumber(row.weight_actual, 2)}%</TableCell>
        <TableCell className={cn("min-w-[100px] font-bold", getDeltaColor(row.delta))}>{formatDelta(row.delta)}%</TableCell>
        <TableCell className="min-w-[160px]">{row.risk_profile}</TableCell>
        <TableCell className="min-w-[140px]">{formatNumber(row["dividend_%"], 2)}{!isSubRow ? '' : '%'}</TableCell>
        <TableCell className="min-w-[160px]">${formatNumber(row["dividend_$"], 0)}</TableCell>
      </TableRowBase>
      
      {isEditSheetOpen && (
        isSubRow ? (
          <EditSubBucketSheet
            isOpen={isEditSheetOpen}
            onClose={() => setIsEditSheetOpen(false)}
            allocation={row}
          />
        ) : (
          <EditBucketSheet
            isOpen={isEditSheetOpen}
            onClose={() => setIsEditSheetOpen(false)}
            bucket={row.bucket || ""}
            id={row.id}
          />
        )
      )}
    </>
  )
}