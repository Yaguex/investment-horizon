import { useState } from "react"
import { ArrowDown, ArrowUp, Edit, Plus, X } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { supabase } from "@/integrations/supabase/client"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/components/ui/use-toast"
import { EditBucketSheet } from "@/components/allocations/EditBucketSheet"

interface AllocationActionsProps {
  isSubRow: boolean
  isExpanded: boolean
  onToggle: () => void
  onEdit: () => void
  id?: number
  profileId?: string
  bucket?: string
  bucketId?: number
  tradeId?: number
  ticker?: string
}

export const AllocationActions = ({ 
  isSubRow, 
  isExpanded, 
  onToggle, 
  onEdit,
  id,
  profileId,
  bucket,
  bucketId,
  tradeId,
  ticker
}: AllocationActionsProps) => {
  console.log('AllocationActions rendered with:', { isSubRow, id, tradeId, ticker })
  
  const [isEditBucketOpen, setIsEditBucketOpen] = useState(false)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const handleEditClick = () => {
    console.log('Edit clicked for:', {
      isSubRow,
      id,
      tradeId,
      ticker,
      type: isSubRow ? 'child row' : 'parent row'
    })
    
    // Always call onEdit() regardless of row type
    onEdit()
  }

  const handleAddTrade = async () => {
    if (!profileId || !bucketId) {
      console.error('Missing required fields for adding allocation')
      toast({
        title: "Error",
        description: "Missing required fields for adding allocation",
        variant: "destructive"
      })
      return
    }

    try {
      console.log('Starting new allocation creation for bucket:', bucketId)
      
      const { data: maxIdResult } = await supabase
        .from('allocations')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .single()

      const newId = (maxIdResult?.id || 0) + 1
      console.log('Generated new id:', newId)

      const { error } = await supabase
        .from('allocations')
        .insert({
          id: newId,
          profile_id: profileId,
          bucket_id: bucketId,
          bucket: "XXX",
          row_type: 'child',
          vehicle: 'stock',
          value_target: 0,
          value_actual: 0,
          weight_target: 0,
          weight_actual: 0,
          delta: 0,
          risk_profile: 'Medium',
          "dividend_%": 0,
          "dividend_$": 0
        })

      if (error) {
        console.error('Error adding allocation:', error)
        toast({
          title: "Error",
          description: "Failed to add allocation",
          variant: "destructive"
        })
        return
      }

      console.log('Successfully added allocation')
      queryClient.invalidateQueries({ queryKey: ['allocations'] })
      
      toast({
        title: "Success",
        description: "New allocation added successfully"
      })
    } catch (error) {
      console.error('Error in handleAddTrade:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    }
  }

  const handleDeleteTrade = async () => {
    if (!id) {
      console.error('No id found for child row')
      return
    }

    try {
      console.log('Deleting allocation with id:', id)
      const { error } = await supabase
        .from('allocations')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting allocation:', error)
        toast({
          title: "Error",
          description: "Failed to delete allocation",
          variant: "destructive"
        })
        return
      }

      console.log('Successfully deleted allocation')
      queryClient.invalidateQueries({ queryKey: ['allocations'] })
      
      toast({
        title: "Success",
        description: "Allocation deleted successfully"
      })
    } catch (error) {
      console.error('Error in handleDeleteTrade:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
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
                  <Plus className="h-4 w-4 cursor-pointer" onClick={handleAddTrade} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add Sub-bucket</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        )}
        
        {isSubRow ? (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <X className="h-4 w-4 cursor-pointer" onClick={handleDeleteTrade} />
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete Sub-bucket</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : null}
        
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Edit 
                className="h-4 w-4 cursor-pointer" 
                onClick={handleEditClick}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>{isSubRow ? "Edit Sub-bucket" : "Edit Bucket"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {!isSubRow && id && bucket && (
        <EditBucketSheet
          isOpen={isEditBucketOpen}
          onClose={() => setIsEditBucketOpen(false)}
          bucket={bucket}
          id={id}
        />
      )}
    </>
  )
}