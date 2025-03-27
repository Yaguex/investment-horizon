import { Copy, Edit, Trash } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatDate, formatNumber } from "./utils/formatters"
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

interface DividendHeaderProps {
  dividend: any
  onEdit: (dividend: any) => void
}

export function DividendHeader({ dividend, onEdit }: DividendHeaderProps) {
  const queryClient = useQueryClient()

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('diy_dividend')
        .delete()
        .eq('id', dividend.id)

      if (error) throw error

      toast.success('Dividend deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['diy-dividend'] })
    } catch (error) {
      console.error('Error deleting dividend:', error)
      toast.error('Error deleting dividend')
    }
  }

  const handleClone = async () => {
    try {
      // Create a new dividend object without the id
      const { id, ...dividendWithoutId } = dividend

      const { error } = await supabase
        .from('diy_dividend')
        .insert([dividendWithoutId])

      if (error) throw error

      toast.success('Dividend cloned successfully')
      queryClient.invalidateQueries({ queryKey: ['diy-dividend'] })
    } catch (error) {
      console.error('Error cloning dividend:', error)
      toast.error('Error cloning dividend')
    }
  }

  const protectionOTM = dividend.strike_entry ? Math.round(((dividend.strike_protection - dividend.strike_entry) * -1) / dividend.strike_entry * 100) : 0
  const targetOTM = dividend.strike_entry ? Math.round((dividend.strike_target - dividend.strike_entry) / dividend.strike_entry * 100) : 0

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center">
        <span className="font-bold text-lg mr-8">{dividend.ticker}</span>
        <span className="text-sm text-gray-500 mr-8">{formatDate(dividend.expiration)}</span>
        <span className="text-sm text-gray-500 mr-8">${formatNumber(dividend.nominal, 0)}</span>
        <span className="text-sm text-gray-500">Protection {protectionOTM}% OTM | Target {targetOTM}% OTM</span>
      </div>
      <TooltipProvider>
        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="cursor-pointer" onClick={handleClone}>
                <Copy className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy Dividend</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="cursor-pointer" onClick={() => onEdit(dividend)}>
                <Edit className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit Dividend</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="cursor-pointer" onClick={handleDelete}>
                <Trash className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete Dividend</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  )
}