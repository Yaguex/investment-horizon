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

interface PositionSizeFormValues {
  ticker: string
  exposure: number | null
  expiration: string
  risk_free_yield: number | null
  strike_entry: number | null
  strike_exit: number | null
  action: string
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

  const fetchMarketData = async (data: PositionSizeFormValues) => {
    console.log('Fetching market data for:', data)
    
    const isSpread = data.action.includes('spread')
    const optionType = data.action.toLowerCase().includes('call') ? 'C' : 'P'
    
    try {
      const { data: marketData, error } = await supabase.functions.invoke('fetch_ticker_data', {
        body: {
          ticker: data.ticker,
          expiration: data.expiration,
          strikes: {
            entry: data.strike_entry,
            target: isSpread ? data.strike_exit : data.strike_entry,
            protection: data.strike_entry
          },
          profile_id: (await supabase.auth.getUser()).data.user?.id
        }
      })

      if (error) {
        console.error('Error fetching market data:', error)
        throw new Error(`Failed to fetch market data: ${error.message}`)
      }

      console.log('Market data received:', marketData)
      return marketData
    } catch (error: any) {
      console.error('Error in fetchMarketData:', error)
      throw new Error(`Failed to fetch market data: ${error.message}`)
    }
  }

  const onSubmit = async (data: PositionSizeFormValues) => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('User not authenticated')
        return
      }

      // Only fetch market data if we have all required fields
      let marketData
      if (data.ticker && data.expiration && data.strike_entry) {
        try {
          marketData = await fetchMarketData(data)
          console.log('Market data fetched successfully:', marketData)
        } catch (error: any) {
          toast.error(`Failed to fetch market data: ${error.message}`)
          return
        }
      }

      if (note) {
        const { error } = await supabase
          .from('position_size')
          .update({
            ...data,
            expiration: data.expiration || null,
            action: data.action || null,
            ticker: data.ticker || null,
            ...(marketData?.marketData?.entry && {
              delta_entry: marketData.marketData.entry.marketData?.delta,
              iv_entry: marketData.marketData.entry.marketData?.iv,
              premium_entry: marketData.marketData.entry.marketData?.mid,
              underlying_price_entry: marketData.marketData.entry.marketData?.underlyingPrice
            }),
            ...(marketData?.marketData?.target && {
              delta_exit: marketData.marketData.target.marketData?.delta,
              iv_exit: marketData.marketData.target.marketData?.iv,
              premium_exit: marketData.marketData.target.marketData?.mid,
              underlying_price_exit: marketData.marketData.target.marketData?.underlyingPrice
            })
          })
          .eq('id', note.id)

        if (error) {
          toast.error(`Failed to update position size: ${error.message}`)
          return
        }
        toast.success('Position size updated successfully')
      } else {
        const { error } = await supabase
          .from('position_size')
          .insert([{
            ...data,
            expiration: data.expiration || null,
            action: data.action || null,
            ticker: data.ticker || null,
            profile_id: user.id,
            ...(marketData?.marketData?.entry && {
              delta_entry: marketData.marketData.entry.marketData?.delta,
              iv_entry: marketData.marketData.entry.marketData?.iv,
              premium_entry: marketData.marketData.entry.marketData?.mid,
              underlying_price_entry: marketData.marketData.entry.marketData?.underlyingPrice
            }),
            ...(marketData?.marketData?.target && {
              delta_exit: marketData.marketData.target.marketData?.delta,
              iv_exit: marketData.marketData.target.marketData?.iv,
              premium_exit: marketData.marketData.target.marketData?.mid,
              underlying_price_exit: marketData.marketData.target.marketData?.underlyingPrice
            })
          }])

        if (error) {
          toast.error(`Failed to save position size: ${error.message}`)
          return
        }
        toast.success('Position size saved successfully')
      }

      onOpenChange(false)
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
              options={ACTION_OPTIONS}
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
            <div className="flex justify-end space-x-2">
              <Button type="submit">{note ? 'Update' : 'Create'} Position Size</Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}