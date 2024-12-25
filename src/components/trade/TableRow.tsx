import { useState } from "react"
import { ArrowDown, ArrowUp, Edit, Plus } from "lucide-react"
import {
  TableCell,
  TableRow as TableRowBase,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { TradeData } from "./types"
import { format } from "date-fns"
import { EditTradeSheet } from "./EditTradeSheet"

interface TableRowProps {
  row: TradeData
  isExpanded: boolean
  isSubRow?: boolean
  onToggle: () => void
  tradeStatus: "open" | "closed"
}

export const TableRow = ({ row, isExpanded, isSubRow = false, onToggle, tradeStatus }: TableRowProps) => {
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    return format(new Date(dateString), "dd MMM yyyy")
  }

  const formatNumber = (value: number | undefined | null, decimals: number = 0) => {
    if (value === undefined || value === null) return ""
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value)
  }

  const getRowBackground = () => {
    if (isSubRow) return "bg-white hover:bg-gray-50"
    
    if (tradeStatus === "open") return "bg-yellow-50 hover:bg-yellow-100"
    
    if (row.pnl === undefined || row.pnl === null) return "bg-yellow-50 hover:bg-yellow-100"
    if (row.pnl > 0) return "bg-green-50 hover:bg-green-100"
    if (row.pnl < 0) return "bg-red-50 hover:bg-red-100"
    return "bg-yellow-50 hover:bg-yellow-100"
  }

  const getStickyBackground = () => {
    if (isSubRow) return "bg-white group-hover:bg-gray-50"
    
    if (tradeStatus === "open") return "bg-yellow-50 group-hover:bg-yellow-100"
    
    if (row.pnl === undefined || row.pnl === null) return "bg-yellow-50 group-hover:bg-yellow-100"
    if (row.pnl > 0) return "bg-green-50 group-hover:bg-green-100"
    if (row.pnl < 0) return "bg-red-50 group-hover:bg-red-100"
    return "bg-yellow-50 group-hover:bg-yellow-100"
  }

  return (
    <>
      <TableRowBase 
        className={cn("group", getRowBackground())}
      >
        <TableCell className={cn("sticky left-0 z-10 w-[100px]", getStickyBackground())}>
          <div className="flex items-center gap-2">
            {!isSubRow && (
              <div 
                onClick={onToggle}
                className="cursor-pointer"
              >
                {isExpanded ? (
                  <ArrowUp className="h-4 w-4" />
                ) : (
                  <ArrowDown className="h-4 w-4" />
                )}
              </div>
            )}
            
            {isSubRow ? (
              <>
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Plus className="h-4 w-4 cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add trade</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Edit className="h-4 w-4 cursor-pointer" onClick={() => setIsEditSheetOpen(true)} />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edit trade</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            ) : (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Edit className="h-4 w-4 cursor-pointer" onClick={() => setIsEditSheetOpen(true)} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit trade</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </TableCell>
        <TableCell className={cn("sticky left-[100px] z-10 min-w-[200px]", getStickyBackground())}>{row.ticker}</TableCell>
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
        <TableCell>{row.pnl !== undefined && row.pnl !== null ? `$${formatNumber(row.pnl)}` : ""}</TableCell>
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
        <EditTradeSheet
          isOpen={isEditSheetOpen}
          onClose={() => setIsEditSheetOpen(false)}
          trade={row}
        />
      )}
    </>
  )
}