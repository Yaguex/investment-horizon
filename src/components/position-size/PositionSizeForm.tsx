import { useForm } from "react-hook-form"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { PositionSizeFormFields } from "./PositionSizeFormFields"
import { PositionSizeFormValues } from "./types"
import { getOptionTypes } from "./utils/optionTypes"

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
    console.log('[fetchMarketData] Starting to fetch market data for:', data)
    
    const isSpread = data.action.includes('spread')
    const optionTypes = getOptionTypes(data.action)
    
    try {
      const { data: user } = await supabase.auth.getUser()
      console.log('[fetchMarketData] Current user:', user?.id)

      const { data: marketData, error } = await supabase.functions.invoke('fetch_ticker_data', {
        body: {
          ticker: data.ticker,
          expiration: data.expiration,
          strikes: {
            entry: {
              strike: data.strike_entry,
              type: optionTypes.entry
            },
            target: {
              strike: isSpread ? data.strike_exit : data.strike_entry,
              type: optionTypes.target
            },
            protection: {
              strike: data.strike_entry,
              type: optionTypes.protection
            }
          },
          profile_id: user?.id
        }
      })

      if (error) {
        console.error('[fetchMarketData] Error fetching market data:', error)
        throw new Error(`Failed to fetch market data: ${error.message}`)
      }

      console.log('[fetchMarketData] Market data received:', marketData)
      return marketData
    } catch (error: any) {
      console.error('[fetchMarketData] Error in fetchMarketData:', error)
      throw new Error(`Failed to fetch market data: ${error.message}`)
    }
  }

  const onSubmit = async (data: PositionSizeFormValues) => {
    try {
      console.log('[onSubmit] Starting form submission with data:', data)
      setIsLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      console.log('[onSubmit] Current user:', user?.id)
      
      if (!user) {
        console.error('[onSubmit] No authenticated user found')
        toast.error('User not authenticated')
        return
      }

      let marketData
      if (data.ticker && data.expiration && data.strike_entry) {
        try {
          marketData = await fetchMarketData(data)
          console.log('[onSubmit] Market data fetched successfully:', marketData)
        } catch (error: any) {
          console.error('[onSubmit] Failed to fetch market data:', error)
          toast.error(`Failed to fetch market data: ${error.message}`)
          return
        }
      }

      const formDataToSave = {
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
      }

      console.log('[onSubmit] Attempting to save form data:', formDataToSave)

      if (note) {
        const { error } = await supabase
          .from('position_size')
          .update(formDataToSave)
          .eq('id', note.id)

        if (error) {
          console.error('[onSubmit] Error updating position size:', error)
          toast.error(`Failed to update position size: ${error.message}`)
          return
        }
        console.log('[onSubmit] Position size updated successfully')
        toast.success('Position size updated successfully')
      } else {
        const { error } = await supabase
          .from('position_size')
          .insert([formDataToSave])

        if (error) {
          console.error('[onSubmit] Error creating position size:', error)
          toast.error(`Failed to save position size: ${error.message}`)
          return
        }
        console.log('[onSubmit] Position size created successfully')
        toast.success('Position size saved successfully')
      }

      onOpenChange(false)
      form.reset()
    } catch (error: any) {
      console.error('[onSubmit] Unexpected error in form submission:', error)
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
            <PositionSizeFormFields 
              control={form.control}
              actionOptions={ACTION_OPTIONS}
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
