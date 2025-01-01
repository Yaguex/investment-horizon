import { useForm } from "react-hook-form"
import { format } from "date-fns"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { TextField } from "@/components/trade/form-fields/TextField"
import { NumberField } from "@/components/trade/form-fields/NumberField"
import { DateField } from "@/components/trade/form-fields/DateField"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"

interface DIYNoteFormValues {
  ticker: string
  nominal: number
  expiration: Date
  bond_yield: number
  strike_entry: number
  strike_target: number
  strike_protection: number
  wiggle: number
  dividend_yield: number
}

interface DIYNoteFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DIYNoteForm({ open, onOpenChange }: DIYNoteFormProps) {
  const form = useForm<DIYNoteFormValues>()

  const onSubmit = async (data: DIYNoteFormValues) => {
    try {
      const { error } = await supabase
        .from('diy_notes')
        .insert([
          {
            ...data,
            expiration: data.expiration ? format(data.expiration, 'yyyy-MM-dd') : null,
            profile_id: (await supabase.auth.getUser()).data.user?.id
          }
        ])

      if (error) throw error

      toast.success('Note created successfully')
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error('Error creating note:', error)
      toast.error('Error creating note')
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>New DIY Note</SheetTitle>
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
              label="Nominal"
            />
            <DateField
              control={form.control}
              name="expiration"
              label="Expiration"
            />
            <NumberField
              control={form.control}
              name="dividend_yield"
              label="Dividend Yield"
            />
            <NumberField
              control={form.control}
              name="bond_yield"
              label="Bond Yield"
            />
            <NumberField
              control={form.control}
              name="strike_entry"
              label="Strike Entry"
            />
            <NumberField
              control={form.control}
              name="strike_target"
              label="Strike Target"
            />
            <NumberField
              control={form.control}
              name="strike_protection"
              label="Strike Protection"
            />
            <NumberField
              control={form.control}
              name="wiggle"
              label="Wiggle"
            />
            <div className="flex justify-end space-x-2">
              <Button type="submit">Create Note</Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}