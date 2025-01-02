import { X } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

interface DeleteButtonProps {
  id: number
  isSubRow: boolean
}

export const DeleteButton = ({ id, isSubRow }: DeleteButtonProps) => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const handleDeleteTrade = async () => {
    try {
      console.log('Deleting trade with id:', id)
      const { error } = await supabase
        .from('trade_log')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting trade:', error)
        toast({
          title: "Error",
          description: "Failed to delete trade",
          variant: "destructive"
        })
        return
      }

      console.log('Successfully deleted trade')
      queryClient.invalidateQueries({ queryKey: ['trades'] })
      
      toast({
        title: "Success",
        description: "Trade deleted successfully"
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
    <Tooltip>
      <TooltipTrigger asChild>
        <X className="h-4 w-4 cursor-pointer" onClick={handleDeleteTrade} />
      </TooltipTrigger>
      <TooltipContent>
        <p>Delete Sub-position</p>
      </TooltipContent>
    </Tooltip>
  )
}