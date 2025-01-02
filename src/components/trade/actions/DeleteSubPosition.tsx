import { X } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface DeleteSubPositionProps {
  id?: number
  profileId?: string
}

export const DeleteSubPosition = ({ id, profileId }: DeleteSubPositionProps) => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const handleDeleteSubPosition = async () => {
    if (!id || !profileId) {
      console.error('Missing required fields:', { id, profileId })
      toast({
        title: "Error",
        description: "Missing required fields for deleting sub-position",
        variant: "destructive"
      })
      return
    }

    try {
      console.log('Deleting sub-position with id:', id)
      const { error } = await supabase
        .from('trade_log')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting sub-position:', error)
        toast({
          title: "Error",
          description: "Failed to delete sub-position",
          variant: "destructive"
        })
        return
      }

      console.log('Successfully deleted sub-position')
      queryClient.invalidateQueries({ queryKey: ['trades'] })
      
      toast({
        title: "Success",
        description: "Sub-position deleted successfully"
      })
    } catch (error) {
      console.error('Error in handleDeleteSubPosition:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    }
  }

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <X className="h-4 w-4 cursor-pointer" onClick={handleDeleteSubPosition} />
        </TooltipTrigger>
        <TooltipContent>
          <p>Delete Sub-position</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}