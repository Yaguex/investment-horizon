import { useForm } from "react-hook-form"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { TextField } from "@/components/position-size/form-fields/TextField"
import { NumberField } from "@/components/position-size/form-fields/NumberField"
import { SelectField } from "@/components/position-size/form-fields/SelectField"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { useState } from "react"
import { Loader2 } from "lucide-react"

interface PositionSizeFormValues {
  ticker: string
  action: string
  exposure: number
  expiration: string
  risk_free_yield: number
  strike_entry: number
  strike_exit: number
}

interface PositionSizeFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  note?: any
}

const actionOptions = [
  { value: "Buy call", label: "Buy call" },
  { value: "Buy put", label: "Buy put" },
  { value: "Sell call", label: "Sell call" },
  { value: "Sell put", label: "Sell put" },
  { value: "Buy call spread", label: "Buy call spread" },
  { value: "Buy put spread", label: "Buy put spread" },
  { value: "Sell call spread", label: "Sell call spread" },
  { value: "Sell put spread", label: "Sell put spread" },
]

export function PositionSizeForm({ open, onOpenChange, note }: PositionSizeFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  const form = useForm<PositionSizeFormValues>({
    defaultValues: note ? {
      ticker: note.ticker || "",
      action: note.action || "",
      exposure: note.exposure || null,
      expiration: note.expiration || "",
      risk_free_yield: note.risk_free_yield || null,
      strike_entry: note.strike_entry || null,
      strike_exit: note.strike_exit || null
    } : {
      ticker: "",
      action: "",
      exposure: null,
      expiration: "",
      risk_free_yield: null,
      strike_entry: null,
      strike_exit: null
    }
  })

  const onSubmit = async (data: PositionSizeFormValues) => {
    try {
      setIsLoading(true)
      onOpenChange(false)

      if (note) {
        const { error } = await supabase
          .from('position_size')
          .update({
            ticker: data.ticker || null,
            action: data.action || null,
            exposure: data.exposure,
            expiration: data.expiration || null,
            risk_free_yield: data.risk_free_yield,
            strike_entry: data.strike_entry,
            strike_exit: data.strike_exit
          })
          .eq('id', note.id)

        if (error) {
          toast.error(`Failed to save position size: ${error.message}`)
          return
        }
        toast.success('Position size updated successfully')
      } else {
        const { error } = await supabase
          .from('position_size')
          .insert([{
            ticker: data.ticker || null,
            action: data.action || null,
            exposure: data.exposure,
            expiration: data.expiration || null,
            risk_free_yield: data.risk_free_yield,
            strike_entry: data.strike_entry,
            strike_exit: data.strike_exit,
            profile_id: (await supabase.auth.getUser()).data.user?.id
          }])

        if (error) {
          toast.error(`Failed to save position size: ${error.message}`)
          return
        }
        toast.success('Position size created successfully')
      }
      
      form.reset()
    } catch (error: any) {
      console.error('Error in form submission:', error)
      toast.error(`Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>{note ? 'Edit' : 'New'} Position Size</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <TextField
              control={form.control}
              name="ticker"
              label="Ticker"
            />
            <SelectField
              control={form.control}
              name="action"
              label="Action"
              options={actionOptions}
            />
            <NumberField
              control={form.control}
              name="exposure"
              label="Exposure"
            />
            <TextField
              control={form.control}
              name="expiration"
              label="Expiration (YYYY-MM-DD)"
            />
            <NumberField
              control={form.control}
              name="risk_free_yield"
              label="Risk-free yield"
            />
            <NumberField
              control={form.control}
              name="strike_entry"
              label="Strike entry"
            />
            <NumberField
              control={form.control}
              name="strike_exit"
              label="Strike exit"
            />
            <div className="flex justify-end space-x-2">
              <Button type="submit">{note ? 'Update' : 'Create'} Position Size</Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}