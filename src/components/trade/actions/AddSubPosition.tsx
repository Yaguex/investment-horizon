import { Plus } from "lucide-react"
import { format } from "date-fns"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface AddSubPositionProps {
  tradeId: number | undefined
  profileId: string | undefined
  ticker: string | undefined
}

export const AddSubPosition = ({ tradeId, profileId, ticker }: AddSubPositionProps) => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const handleAddSubPosition = async () => {
    console.log('Adding sub-position for:', { tradeId, profileId, ticker })
    
    if (!tradeId || !profileId) {
      console.error('Missing required fields:', { tradeId, profileId })
      toast({
        title: "Error",
        description: "Missing required fields for adding sub-position",
        variant: "destructive"
      })
      return
    }

    try {
      const { data: maxIdResult } = await supabase
        .from('trade_log')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .single()

      const newId = (maxIdResult?.id || 0) + 1
      console.log('Generated new id:', newId)

      const today = format(new Date(), 'yyyy-MM-dd')

      const { error } = await supabase
        .from('trade_log')
        .insert({
          id: newId,
          profile_id: profileId,
          trade_id: tradeId,
          row_type: 'child',
          trade_status: 'open',
          ticker: ticker,
          date_entry: today
        })

      if (error) {
        console.error('Error adding sub-position:', error)
        toast({
          title: "Error",
          description: "Failed to add sub-position",
          variant: "destructive"
        })
        return
      }

      console.log('Successfully added sub-position')
      await queryClient.invalidateQueries({ queryKey: ['trades'] })
      
      toast({
        title: "Success",
        description: "New sub-position added successfully"
      })
    } catch (error) {
      console.error('Error in handleAddSubPosition:', error)
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
          <Plus className="h-4 w-4 cursor-pointer" onClick={handleAddSubPosition} />
        </TooltipTrigger>
        <TooltipContent>
          <p>Add Sub-position</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}