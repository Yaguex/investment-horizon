import { useState } from "react"
import { ArrowDown, ArrowUp, Edit, Plus } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { createSubPosition } from "./tradeActionUtils"

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

  return (
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
                <Plus className="h-4 w-4 cursor-pointer" onClick={handleAddTrade} />
              </TooltipTrigger>
              <TooltipContent>
                <p>Add Sub-position</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
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
  )
}