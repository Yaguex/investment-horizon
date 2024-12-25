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
  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    return format(new Date(dateString), "dd MMM yyyy")
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
      <TableCell>{row.qty}</TableCell>
      <TableCell className="min-w-[140px]">{formatDate(row.date_entry)}</TableCell>
      <TableCell className="min-w-[140px]">{formatDate(row.date_expiration)}</TableCell>
      <TableCell className="min-w-[140px]">{formatDate(row.date_exit)}</TableCell>
      <TableCell className="min-w-[140px]">{row.days_in_trade}</TableCell>
      <TableCell>{row.strike_start}</TableCell>
      <TableCell>{row.strike_end}</TableCell>
      <TableCell>${row.premium}</TableCell>
      <TableCell>${row.stock_price}</TableCell>
      <TableCell className="min-w-[100px]">{row["risk_%"]}%</TableCell>
      <TableCell className="min-w-[100px]">${row["risk_$"]}</TableCell>
      <TableCell>${row.commission}</TableCell>
      <TableCell>${row.pnl}</TableCell>
      <TableCell>{row.roi}%</TableCell>
      <TableCell>{row.roi_yearly}%</TableCell>
      <TableCell>{row.roi_portfolio}%</TableCell>
      <TableCell className="min-w-[120px]">${row.be_0}</TableCell>
      <TableCell className="min-w-[120px]">${row.be_1}</TableCell>
      <TableCell className="min-w-[120px]">${row.be_2}</TableCell>
      <TableCell>{row.delta}</TableCell>
      <TableCell>{row.iv}%</TableCell>
      <TableCell>{row.iv_percentile}%</TableCell>
      <TableCell className="min-w-[400px]">{row.notes}</TableCell>
    </TableRowBase>
  )
}