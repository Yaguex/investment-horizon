import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/integrations/supabase/client"

export const useDeleteTrade = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const handleDeleteTrade = async (id: number) => {
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

  return { handleDeleteTrade }
}