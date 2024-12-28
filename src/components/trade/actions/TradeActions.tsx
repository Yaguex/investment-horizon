import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, Pencil, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { supabase } from "@/integrations/supabase/client"
import { useQueryClient } from "@tanstack/react-query"
import { recalculateParentCommissions } from "../utils/commissionCalculations"

interface TradeActionsProps {
  isSubRow: boolean
  isExpanded: boolean
  onToggle: () => void
  onEdit: () => void
  tradeId?: number
  id: number
  profileId?: string
  ticker?: string
}

export function TradeActions({ 
  isSubRow, 
  isExpanded, 
  onToggle, 
  onEdit,
  tradeId,
  id,
  profileId,
  ticker
}: TradeActionsProps) {
  const queryClient = useQueryClient()
  
  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('trade_log')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      // After deleting a child row, recalculate parent commissions
      if (isSubRow) {
        await recalculateParentCommissions()
      }
      
      await queryClient.invalidateQueries({ queryKey: ['trades'] })
    } catch (error) {
      console.error('Error deleting trade:', error)
    }
  }
  
  return (
    <div className="flex items-center gap-2">
      {!isSubRow && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onToggle}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      )}
      
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", isSubRow && "ml-8")}
        onClick={onEdit}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {ticker} Trade</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the trade
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}