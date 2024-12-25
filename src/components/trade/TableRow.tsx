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

interface TableRowProps {
  row: TradeData
  isExpanded: boolean
  isSubRow?: boolean
  onToggle: () => void
  tradeStatus: "open" | "closed"
}

export const TableRow = ({ row, isExpanded, isSubRow = false, onToggle, tradeStatus }: TableRowProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    return format(new Date(dateString), "dd MMM yyyy")
  }

  const getRowBackground = () => {
    if (isSubRow) return "bg-white hover:bg-gray-50"
    
    if (tradeStatus === "open") return "bg-yellow-50 hover:bg-yellow-100"
    
    // For closed trades, check PnL
    if (row.pnl === undefined || row.pnl === null) return "bg-yellow-50 hover:bg-yellow-100"
    if (row.pnl > 0) return "bg-green-50 hover:bg-green-100"
    if (row.pnl < 0) return "bg-red-50 hover:bg-red-100"
    return "bg-yellow-50 hover:bg-yellow-100"
  }

  return (
    <TableRowBase 
      className={cn(getRowBackground())}
    >
      <TableCell className="w-[100px]">
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
                    <Edit className="h-4 w-4 cursor-pointer" />
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
                  <Edit className="h-4 w-4 cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit trade</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </TableCell>
      <TableCell>{row.ticker}</TableCell>
      <TableCell className="min-w-[180px]">{row.vehicle}</TableCell>
      <TableCell className="min-w-[180px]">{row.order}</TableCell>
      <TableCell>{row.qty}</TableCell>
      <TableCell className="min-w-[140px]">{formatDate(row.date_entry)}</TableCell>
      <TableCell className="min-w-[140px]">{formatDate(row.date_expiration)}</TableCell>
      <TableCell className="min-w-[140px]">{formatDate(row.date_exit)}</TableCell>
      <TableCell className="min-w-[140px]">{row.days_in_trade}</TableCell>
      <TableCell>{row.strike_start}</TableCell>
      <TableCell>{row.strike_end}</TableCell>
      <TableCell>{row.premium}</TableCell>
      <TableCell>{row.stock_price}</TableCell>
      <TableCell className="min-w-[100px]">{row["risk_%"] !== undefined && row["risk_%"] !== null ? `${row["risk_%"]}%` : ""}</TableCell>
      <TableCell className="min-w-[100px]">{row["risk_$"] !== undefined && row["risk_$"] !== null ? `$${row["risk_$"]}` : ""}</TableCell>
      <TableCell>{row.commission !== undefined && row.commission !== null ? `$${row.commission}` : ""}</TableCell>
      <TableCell>{row.pnl !== undefined && row.pnl !== null ? `$${row.pnl}` : ""}</TableCell>
      <TableCell>{row.roi !== undefined && row.roi !== null ? `${row.roi}%` : ""}</TableCell>
      <TableCell>{row.roi_yearly !== undefined && row.roi_yearly !== null ? `${row.roi_yearly}%` : ""}</TableCell>
      <TableCell>{row.roi_portfolio !== undefined && row.roi_portfolio !== null ? `${row.roi_portfolio}%` : ""}</TableCell>
      <TableCell className="min-w-[120px]">{row.be_0 !== undefined && row.be_0 !== null ? `$${row.be_0}` : ""}</TableCell>
      <TableCell className="min-w-[120px]">{row.be_1 !== undefined && row.be_1 !== null ? `$${row.be_1}` : ""}</TableCell>
      <TableCell className="min-w-[120px]">{row.be_2 !== undefined && row.be_2 !== null ? `$${row.be_2}` : ""}</TableCell>
      <TableCell>{row.delta}</TableCell>
      <TableCell>{row.iv !== undefined && row.iv !== null ? `${row.iv}%` : ""}</TableCell>
      <TableCell>{row.iv_percentile !== undefined && row.iv_percentile !== null ? `${row.iv_percentile}%` : ""}</TableCell>
      <TableCell className="min-w-[400px]">{row.notes}</TableCell>
    </TableRowBase>
  )
}