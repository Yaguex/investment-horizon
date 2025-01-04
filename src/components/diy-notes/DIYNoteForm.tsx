import { useForm } from "react-hook-form"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { TextField } from "@/components/diy-notes/form-fields/TextField"
import { NumberField } from "@/components/diy-notes/form-fields/NumberField"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { useQueryClient } from "@tanstack/react-query"
import { LoadingOverlay } from "@/components/ui/loading-overlay"
import { useState } from "react"

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
      // First save the note
      if (note) {
        // Update existing note
        const { error } = await supabase
          .from('diy_notes')
          .update({
            ...data,
            expiration: data.expiration || null,
          })
          .eq('id', note.id)

        if (error) throw error
        toast.success('Note updated successfully')
      } else {
        // Create new note
        const { error } = await supabase
          .from('diy_notes')
          .insert([
            {
              ...data,
              expiration: data.expiration || null,
              profile_id: (await supabase.auth.getUser()).data.user?.id
            }
          ])

        if (error) throw error
        toast.success('Note created successfully')
      }
      
      // Close the form
      onOpenChange(false)
      form.reset()

      // Then fetch market data
      setIsLoading(true)
      const { data: marketData, error: marketDataError } = await supabase.functions.invoke('fetch_ticker_data', {
        body: { 
          ticker: data.ticker,
          expiration: data.expiration,
          strikes: {
            entry: data.strike_entry,
            target: data.strike_target,
            protection: data.strike_protection
          },
          profile_id: (await supabase.auth.getUser()).data.user?.id
        }
      })

      if (marketDataError) {
        console.error('Error fetching market data:', marketDataError)
        toast.error('Error fetching market data')
      }

      // Invalidate and refetch the notes query
      await queryClient.invalidateQueries({ queryKey: ['diy-notes'] })
    } catch (error) {
      console.error('Error saving note:', error)
      toast.error(`Error ${note ? 'updating' : 'creating'} note`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {isLoading && <LoadingOverlay />}
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
                label="Expiration"
                placeholder="Example: 19-12-2025"
                description="Use format: DD-MM-YYYY"
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
                <Button type="submit">{note ? 'Update' : 'Create'} Note</Button>
              </div>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    </>
  )
}