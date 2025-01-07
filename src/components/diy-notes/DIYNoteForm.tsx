import { useForm } from "react-hook-form"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { TextField } from "@/components/diy-notes/form-fields/TextField"
import { NumberField } from "@/components/diy-notes/form-fields/NumberField"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Loader2 } from "lucide-react"

interface DIYNoteFormValues {
  ticker: string
  nominal: number | null
  expiration: string
  bond_yield: number | null
  strike_entry: number | null
  strike_target: number | null
  strike_protection: number | null
  wiggle: number | null
  dividend_yield: number | null
}

interface DIYNoteFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  note?: any
}

export function DIYNoteForm({ open, onOpenChange, note }: DIYNoteFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()
  
  const form = useForm<DIYNoteFormValues>({
    defaultValues: note ? {
      ticker: note.ticker || "",
      nominal: note.nominal || null,
      expiration: note.expiration || "",
      bond_yield: note.bond_yield || null,
      strike_entry: note.strike_entry || null,
      strike_target: note.strike_target || null,
      strike_protection: note.strike_protection || null,
      wiggle: note.wiggle || null,
      dividend_yield: note.dividend_yield || null
    } : {
      ticker: "",
      nominal: null,
      expiration: "",
      bond_yield: null,
      strike_entry: null,
      strike_target: null,
      strike_protection: null,
      wiggle: null,
      dividend_yield: null
    }
  })

  const onSubmit = async (data: DIYNoteFormValues) => {
    try {
      setIsLoading(true)

      const { error } = await supabase.functions.invoke('submit_diy_notes', {
        body: {
          note: {
            ...data,
            id: note?.id,
            expiration: data.expiration || null,
          },
          profile_id: (await supabase.auth.getUser()).data.user?.id
        }
      })

      if (error) {
        toast.error(`Failed to save note: ${error.message}`)
        return
      }

      toast.success(note ? 'Note updated successfully' : 'Note created successfully')
      await queryClient.invalidateQueries({ queryKey: ['diy-notes'] })
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
          <SheetTitle>{note ? 'Edit' : 'New'} DIY Note</SheetTitle>
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
            <TextField
              control={form.control}
              name="expiration"
              label="Expiration (YYYY-MM-DD)"
            />
            <NumberField
              control={form.control}
              name="dividend_yield"
              label="Dividend Yield (after withholding tax)"
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
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {note ? 'Update' : 'Create'} Note
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}