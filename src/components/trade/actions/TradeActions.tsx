import { useState } from "react"
import { ArrowDown, ArrowUp, Edit, Plus, X } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { createSubPosition, deleteSubPosition } from "./tradeActionUtils"
import { supabase } from "@/integrations/supabase/client"

interface TradeActionsProps {
  isSubRow: boolean
  isExpanded: boolean
  onToggle: () => void
  onEdit: () => void
  id?: number
  profileId?: string
  tradeId?: number
  tradeStatus?: string
}

export const TradeActions = ({ 
  isSubRow, 
  isExpanded, 
  onToggle, 
  onEdit,
  id,
  profileId,
  tradeId,
  tradeStatus = 'open'
}: TradeActionsProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const handleAddTrade = async () => {
    try {
      await createSubPosition(profileId, id, tradeStatus)
      
      queryClient.invalidateQueries({ queryKey: ['trades'] })
      
      toast({
        title: "Success",
        description: "New sub-position added successfully"
      })
    } catch (error) {
      console.error('Error in handleAddTrade:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add sub-position",
        variant: "destructive"
      })
    }
  }

  const handleDeleteSubPosition = async () => {
    try {
      if (!id) throw new Error('Missing sub-position id')
      
      await deleteSubPosition(id)
      
      queryClient.invalidateQueries({ queryKey: ['trades'] })
      
      toast({
        title: "Success",
        description: "Sub-position deleted successfully"
      })
    } catch (error) {
      console.error('Error in handleDeleteSubPosition:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete sub-position",
        variant: "destructive"
      })
    }
  }

  const handleDeletePosition = async () => {
    try {
      if (!tradeId) {
        throw new Error('Missing trade ID')
      }

      console.log('Deleting position and all sub-positions for trade_id:', tradeId)
      
      const { error } = await supabase
        .from('trade_log')
        .delete()
        .eq('trade_id', tradeId)

      if (error) {
        throw error
      }

      queryClient.invalidateQueries({ queryKey: ['trades'] })
      
      toast({
        title: "Success",
        description: "Position and all sub-positions deleted successfully"
      })
    } catch (error) {
      console.error('Error in handleDeletePosition:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete position",
        variant: "destructive"
      })
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {!isSubRow && (
          <>
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
            
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <X 
                    className="h-4 w-4 cursor-pointer text-red-500 hover:text-red-600" 
                    onClick={() => setShowDeleteDialog(true)}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete position</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Plus className="h-4 w-4 cursor-pointer" onClick={handleAddTrade} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add Sub-position</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        )}
        
        {isSubRow && (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <X 
                  className="h-4 w-4 cursor-pointer text-red-500 hover:text-red-600" 
                  onClick={handleDeleteSubPosition}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete Sub-position</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Edit 
                className="h-4 w-4 cursor-pointer" 
                onClick={onEdit}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>{isSubRow ? "Edit Sub-position" : "Edit Position"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this position and all its sub-positions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                handleDeletePosition()
                setShowDeleteDialog(false)
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}