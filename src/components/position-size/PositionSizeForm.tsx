import { useForm } from "react-hook-form"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { PositionSizeFormFields } from "./PositionSizeFormFields"
import { PositionSizeFormValues } from "./types"
import { supabase } from "@/integrations/supabase/client"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { fetchMarketData } from "./utils/formSubmission"

const ACTION_OPTIONS = [
  { value: "Buy call", label: "Buy call" },
  { value: "Buy put", label: "Buy put" },
  { value: "Sell call", label: "Sell call" },
  { value: "Sell put", label: "Sell put" },
  { value: "Buy call spread", label: "Buy call spread" },
  { value: "Buy put spread", label: "Buy put spread" },
  { value: "Sell call spread", label: "Sell call spread" },
  { value: "Sell put spread", label: "Sell put spread" },
]

interface PositionSizeFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  note?: any
}

export function PositionSizeForm({ open, onOpenChange, note }: PositionSizeFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()
  
  const form = useForm<PositionSizeFormValues>({
    defaultValues: note ? {
      ticker: note.ticker || "",
      exposure: note.exposure || null,
      expiration: note.expiration || "",
      risk_free_yield: note.risk_free_yield || null,
      strike_entry: note.strike_entry || null,
      strike_exit: note.strike_exit || null,
      action: note.action || ""
    } : {
      ticker: "",
      exposure: null,
      expiration: "",
      risk_free_yield: null,
      strike_entry: null,
      strike_exit: null,
      action: ""
    }
  })

  const onSubmit = async (data: PositionSizeFormValues) => {
    try {
      setIsLoading(true)

      // Save position size
      if (note) {
        // Update existing note
        const { error } = await supabase
          .from('position_size')
          .update({
            ...data,
            expiration: data.expiration || null,
          })
          .eq('id', note.id)

        if (error) {
          toast.error(`Failed to save position size: ${error.message}`)
          return
        }
        toast.success('Position size updated successfully')
      } else {
        // Create new note
        const { error } = await supabase
          .from('position_size')
          .insert([{
            ...data,
            expiration: data.expiration || null,
            profile_id: (await supabase.auth.getUser()).data.user?.id
          }])

        if (error) {
          toast.error(`Failed to save position size: ${error.message}`)
          return
        }
        toast.success('Position size created successfully')
      }

      // Fetch market data
      if (data.ticker && data.expiration && data.strike_entry) {
        const marketData = await fetchMarketData(data)
        if (!marketData) {
          toast.error('Failed to fetch market data')
        } else {
          toast.success('Market data updated successfully')
        }
      }

      // Refetch position sizes
      await queryClient.invalidateQueries({ queryKey: ['position-sizes'] })
      
      form.reset()
      onOpenChange(false)
    } catch (error: any) {
      console.error('Error in form submission:', error)
      toast.error(`Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>{note ? 'Edit' : 'New'} Position Size</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <PositionSizeFormFields 
              control={form.control}
              actionOptions={ACTION_OPTIONS}
            />
            <div className="flex justify-end space-x-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {note ? 'Update' : 'Create'} Position Size
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}