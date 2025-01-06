import { useForm } from "react-hook-form"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { TextField } from "@/components/position-size/form-fields/TextField"
import { NumberField } from "@/components/position-size/form-fields/NumberField"
import { toast } from "sonner"
import { useState } from "react"
import { Loader2 } from "lucide-react"

interface PositionSizeFormValues {
  ticker: string
  exposure: number | null
  expiration: string
  risk_free_yield: number | null
  strike_entry: number | null
  strike_exit: number | null
  premium: number | null
  action: string
  underlying_price: number | null
  delta: number | null
  iv: number | null
}

interface PositionSizeFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  note?: any
}

export function PositionSizeForm({ open, onOpenChange, note }: PositionSizeFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  const form = useForm<PositionSizeFormValues>({
    defaultValues: note ? {
      ticker: note.ticker || "",
      exposure: note.exposure || null,
      expiration: note.expiration || "",
      risk_free_yield: note.risk_free_yield || null,
      strike_entry: note.strike_entry || null,
      strike_exit: note.strike_exit || null,
      premium: note.premium || null,
      action: note.action || "",
      underlying_price: note.underlying_price || null,
      delta: note.delta || null,
      iv: note.iv || null
    } : {
      ticker: "",
      exposure: null,
      expiration: "",
      risk_free_yield: null,
      strike_entry: null,
      strike_exit: null,
      premium: null,
      action: "",
      underlying_price: null,
      delta: null,
      iv: null
    }
  })

  const onSubmit = async (data: PositionSizeFormValues) => {
    try {
      setIsLoading(true)
      onOpenChange(false)
      // We'll implement the actual submission logic later
      // When we do, we'll convert empty strings to null like this:
      // expiration: data.expiration || null,
      // action: data.action || null,
      // ticker: data.ticker || null,
      toast.success('Position size saved')
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
            <TextField
              control={form.control}
              name="action"
              label="Action"
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
              label="Risk Free Yield"
            />
            <NumberField
              control={form.control}
              name="strike_entry"
              label="Strike Entry"
            />
            <NumberField
              control={form.control}
              name="strike_exit"
              label="Strike Exit"
            />
            <NumberField
              control={form.control}
              name="premium"
              label="Premium"
            />
            <NumberField
              control={form.control}
              name="underlying_price"
              label="Underlying Price"
            />
            <NumberField
              control={form.control}
              name="delta"
              label="Delta"
            />
            <NumberField
              control={form.control}
              name="iv"
              label="IV"
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