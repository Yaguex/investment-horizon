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

interface TableRowProps {
  row: TradeData
  isExpanded: boolean
  isSubRow?: boolean
  onToggle: () => void
}

export const TableRow = ({ row, isExpanded, isSubRow = false, onToggle }: TableRowProps) => {
  return (
    <TableRowBase 
      className={cn(
        "cursor-pointer",
        isSubRow ? "bg-white hover:bg-gray-50" : "bg-yellow-50 hover:bg-yellow-100"
      )}
      onClick={!isSubRow ? onToggle : undefined}
    >
      <TableCell className="w-[100px]">
        {!isSubRow ? (
          isExpanded ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )
        ) : null}
        <div className="flex gap-2">
          <TooltipProvider>
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
            <TooltipProvider>
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
      <TableCell className="min-w-[120px]">{row.dateEntry}</TableCell>
      <TableCell className="min-w-[120px]">{row.dateExpiration}</TableCell>
      <TableCell className="min-w-[120px]">{row.dateExit}</TableCell>
      <TableCell className="min-w-[120px]">{row.daysInTrade}</TableCell>
      <TableCell>{row.strikeStart}</TableCell>
      <TableCell>{row.strikeEnd}</TableCell>
      <TableCell>${row.premium}</TableCell>
      <TableCell>${row.stockPrice}</TableCell>
      <TableCell>{row.riskPercentage}%</TableCell>
      <TableCell>${row.riskDollars}</TableCell>
      <TableCell>${row.commission}</TableCell>
      <TableCell>${row.pnl}</TableCell>
      <TableCell>{row.roi}%</TableCell>
      <TableCell>{row.roiYearly}%</TableCell>
      <TableCell>{row.roiPortfolio}%</TableCell>
      <TableCell className="min-w-[100px]">${row.be0}</TableCell>
      <TableCell className="min-w-[100px]">${row.be1}</TableCell>
      <TableCell className="min-w-[100px]">${row.be2}</TableCell>
      <TableCell>{row.delta}</TableCell>
      <TableCell>{row.iv}%</TableCell>
      <TableCell>{row.ivPercentile}%</TableCell>
      <TableCell className="min-w-[300px]">{row.notes}</TableCell>
    </TableRowBase>
  )
}