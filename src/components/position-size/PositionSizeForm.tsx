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
import { Control } from "react-hook-form"
import { TextField } from "./form-fields/TextField"
import { NumberField } from "./form-fields/NumberField"
import { SelectField } from "./form-fields/SelectField"
import { formatDate } from "./utils/formatters"
import { formatNumber } from "./utils/formatters"
import { useAuth } from "@/contexts/AuthContext"

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

interface PositionSizeFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  position?: any
}

export function PositionSizeForm({ open, onOpenChange, position }: PositionSizeFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  const form = useForm<PositionSizeFormValues>({
    defaultValues: position ? {
      ticker: position.ticker || "",
      nominal: position.nominal || null,
      expiration: position.expiration || "",
      bond_yield: position.bond_yield || null,
      strike_entry: position.strike_entry || null,
      strike_exit: position.strike_exit || null,
      action: position.action || ""
    } : {
      ticker: "",
      nominal: null,
      expiration: "",
      bond_yield: null,
      strike_entry: null,
      strike_exit: null,
      action: ""
    }
  })

  const onSubmit = async (data: PositionSizeFormValues) => {
    try {
      setIsLoading(true)

      if (!user) {
        toast.error("You must be logged in to save a dividend")
        setIsLoading(false)
        return
      }

      const { error } = await supabase.functions.invoke('submit_position_size', {
        body: {
          position: {
            ...data,
            id: position?.id,
            expiration: data.expiration || null,
          },
          profile_id: (await supabase.auth.getUser()).data.user?.id
        }
      })

      if (error) {
        toast.error(`Failed to save position size: ${error.message}`)
        return
      }

      toast.success(position ? 'Position size updated successfully' : 'Position size created successfully')
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

  // The Form fields go below
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>{position ? 'Edit' : 'New'} Position Size</SheetTitle>
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
              name="nominal"
              label="Nominal (total desired exposure) ($)"
            />
            <TextField
              control={form.control}
              name="expiration"
              label="Expiration (YYYY-MM-DD)"
            />
            <NumberField
              control={form.control}
              name="risk_free_yield"
              label="Risk Free Yield (%)"
            />
            <NumberField
                    control={form.control}
                    name="bond_yield"
                    label="Bond Yield (%)"
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
            <div className="flex justify-end space-x-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {position ? 'Update' : 'Create'} Position Size
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}