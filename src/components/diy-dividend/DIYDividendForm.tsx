import { useForm } from "react-hook-form"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { TextField } from "@/components/diy-dividend/form-fields/TextField"
import { NumberField } from "@/components/diy-dividend/form-fields/NumberField"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Loader2 } from "lucide-react"

interface DIYDividendFormValues {
  ticker: string
  nominal: number | null
  expiration: string
  dividend_yield: number | null
  bond_yield: number | null
  strike_call: number | null
  strike_put: number | null
  wiggle: number | null
}

interface DIYDividendFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dividend?: any
}

export function DIYDividendForm({ open, onOpenChange, dividend }: DIYDividendFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()
  
  const form = useForm<DIYDividendFormValues>({
    defaultValues: dividend ? {
      ticker: dividend.ticker || "",
      nominal: dividend.nominal || null,
      expiration: dividend.expiration || "",
      dividend_yield: dividend.dividend_yield || null,
      bond_yield: dividend.bond_yield || null,
      strike_call: dividend.strike_call || null,
      strike_put: dividend.strike_put || null,
      wiggle: dividend.wiggle || null
    } : {
      ticker: "",
      nominal: null,
      expiration: "",
      dividend_yield: null,
      bond_yield: null,
      strike_call: null,
      strike_put: null,
      wiggle: null
    }
  })

  const onSubmit = async (data: DIYDividendFormValues) => {
    try {
      setIsLoading(true)

      const { error } = await supabase.functions.invoke('submit_diy_dividend', {
        body: {
          dividend: {
            ...data,
            id: dividend?.id,
            expiration: data.expiration || null,
          },
          profile_id: (await supabase.auth.getUser()).data.user?.id
        }
      })

      if (error) {
        toast.error(`Failed to save dividend: ${error.message}`)
        return
      }

      toast.success(dividend ? 'Dividend updated successfully' : 'Dividend created successfully')
      await queryClient.invalidateQueries({ queryKey: ['diy-dividend'] })
      form.reset()
      setIsLoading(false)
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
          <SheetTitle>{dividend ? 'Edit' : 'New'} DIY Dividend</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <TextField
              control={form.control}
              name="ticker"
              label="Ticker"
            />
            <NumberField
              control={form.control}
              name="nominal"
              label="Nominal ($)"
            />
            <TextField
              control={form.control}
              name="expiration"
              label="Expiration (YYYY-MM-DD)"
            />
            <NumberField
              control={form.control}
              name="dividend_yield"
              label="Dividend Yield after withholding tax (%)"
            />
            <NumberField
              control={form.control}
              name="bond_yield"
              label="Bond Yield (%)"
            />
            <NumberField
              control={form.control}
              name="strike_call"
              label="Strike Call"
            />
            <NumberField
              control={form.control}
              name="strike_put"
              label="Strike Put"
            />
            <NumberField
              control={form.control}
              name="wiggle"
              label="Wiggle (%)"
            />
            <div className="flex justify-end space-x-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {dividend ? 'Update' : 'Create'} Dividend
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
