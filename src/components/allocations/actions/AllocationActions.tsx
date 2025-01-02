import { useState } from "react"
import { Edit, Plus, X } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { supabase } from "@/integrations/supabase/client"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { EditBucketSheet } from "@/components/allocations/EditBucketSheet"

interface AllocationActionsProps {
  id?: number
  profileId?: string
  bucket?: string
  bucketId?: number
}

export const AllocationActions = ({ 
  id,
  profileId,
  bucket,
  bucketId,
}: AllocationActionsProps) => {
  console.log('AllocationActions rendered with:', { id, bucket, bucketId })
  
  const [isEditBucketOpen, setIsEditBucketOpen] = useState(false)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const handleAddAllocation = async () => {
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
      console.error('Error in handleAddAllocation:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    }
  }

  const handleDeleteAllocation = async () => {
    if (!id) {
      console.error('No id found for allocation')
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
      console.error('Error in handleDeleteAllocation:', error)
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
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Plus className="h-4 w-4 cursor-pointer" onClick={handleAddAllocation} />
            </TooltipTrigger>
            <TooltipContent>
              <p>Add Allocation</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <X className="h-4 w-4 cursor-pointer" onClick={handleDeleteAllocation} />
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete Allocation</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Edit 
                className="h-4 w-4 cursor-pointer" 
                onClick={() => setIsEditBucketOpen(true)}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit Allocation</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {id && bucket && (
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