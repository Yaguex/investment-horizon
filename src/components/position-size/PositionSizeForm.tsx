import { useForm } from "react-hook-form"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { TextField } from "@/components/position-size/form-fields/TextField"
import { NumberField } from "@/components/position-size/form-fields/NumberField"
import { SelectField } from "@/components/position-size/form-fields/SelectField"
import { toast } from "sonner"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"

interface PositionSizeFormValues {
  ticker: string
  action: string
  exposure: number | null
  expiration: string
  risk_free_yield: number | null
  strike_entry: number | null
  strike_exit: number | null
}

interface PositionSizeFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  note?: any
}

const actionOptions = [
  { label: "Buy call", value: "Buy call" },
  { label: "Buy put", value: "Buy put" },
  { label: "Sell call", value: "Sell call" },
  { label: "Sell put", value: "Sell put" },
  { label: "Buy call spread", value: "Buy call spread" },
  { label: "Buy put spread", value: "Buy put spread" },
  { label: "Sell call spread", value: "Sell call spread" },
  { label: "Sell put spread", value: "Sell put spread" },
]

export function PositionSizeForm({ open, onOpenChange, note }: PositionSizeFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  
  const form = useForm<PositionSizeFormValues>({
    defaultValues: note ? {
      ticker: note.ticker || "",
      action: note.action || "",
      exposure: note.exposure || null,
      expiration: note.expiration || "",
      risk_free_yield: note.risk_free_yield || null,
      strike_entry: note.strike_entry || null,
      strike_exit: note.strike_exit || null,
    } : {
      ticker: "",
      action: "",
      exposure: null,
      expiration: "",
      risk_free_yield: null,
      strike_entry: null,
      strike_exit: null,
    }
  })

  const onSubmit = async (data: PositionSizeFormValues) => {
    try {
      setIsLoading(true)
      console.log('Submitting position size data:', data)

      if (!user) {
        throw new Error('User must be logged in to save position size')
      }

      const { error } = await supabase
        .from('position_size')
        .insert([
          {
            ...data,
            profile_id: user.id
          }
        ])

      if (error) throw error

      console.log('Position size saved successfully')
      onOpenChange(false)
      toast.success('Position size saved')
      form.reset()
    } catch (error: any) {
      console.error('Error in form submission:', error)
      toast.error(error.message || 'Error saving position size')
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