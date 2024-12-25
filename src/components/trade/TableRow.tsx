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
}

export const TableRow = ({ row, isExpanded, isSubRow = false, onToggle }: TableRowProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    return format(new Date(dateString), "dd MMM yyyy")
  }

  const formatNumber = (value?: number) => {
    if (value === undefined || value === null) return ""
    return value.toLocaleString()
  }

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return ""
    return `$${value.toLocaleString()}`
  }

  const formatPercentage = (value?: number) => {
    if (value === undefined || value === null) return ""
    return `${value}%`
  }

  return (
    <TableRowBase 
      className={cn(
        isSubRow ? "bg-white hover:bg-gray-50" : "bg-yellow-50 hover:bg-yellow-100"
      )}
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
          
          {isSubRow && (
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
          )}
        </div>
      </TableCell>
      <TableCell>{row.ticker}</TableCell>
      <TableCell>{row.vehicle}</TableCell>
      <TableCell>{row.order}</TableCell>
      <TableCell>{formatNumber(row.qty)}</TableCell>
      <TableCell className="min-w-[140px]">{formatDate(row.date_entry)}</TableCell>
      <TableCell className="min-w-[140px]">{formatDate(row.date_expiration)}</TableCell>
      <TableCell className="min-w-[140px]">{formatDate(row.date_exit)}</TableCell>
      <TableCell className="min-w-[140px]">{formatNumber(row.days_in_trade)}</TableCell>
      <TableCell>{formatNumber(row.strike_start)}</TableCell>
      <TableCell>{formatNumber(row.strike_end)}</TableCell>
      <TableCell>{formatCurrency(row.premium)}</TableCell>
      <TableCell>{formatCurrency(row.stock_price)}</TableCell>
      <TableCell className="min-w-[100px]">{formatPercentage(row["risk_%"])}</TableCell>
      <TableCell className="min-w-[100px]">{formatCurrency(row["risk_$"])}</TableCell>
      <TableCell>{formatCurrency(row.commission)}</TableCell>
      <TableCell>{formatCurrency(row.pnl)}</TableCell>
      <TableCell>{formatPercentage(row.roi)}</TableCell>
      <TableCell>{formatPercentage(row.roi_yearly)}</TableCell>
      <TableCell>{formatPercentage(row.roi_portfolio)}</TableCell>
      <TableCell className="min-w-[120px]">{formatCurrency(row.be_0)}</TableCell>
      <TableCell className="min-w-[120px]">{formatCurrency(row.be_1)}</TableCell>
      <TableCell className="min-w-[120px]">{formatCurrency(row.be_2)}</TableCell>
      <TableCell>{formatNumber(row.delta)}</TableCell>
      <TableCell>{formatPercentage(row.iv)}</TableCell>
      <TableCell>{formatPercentage(row.iv_percentile)}</TableCell>
      <TableCell className="min-w-[400px]">{row.notes}</TableCell>
    </TableRowBase>
  )
}