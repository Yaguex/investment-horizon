import { useForm } from "react-hook-form"
import { format } from "date-fns"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { TradeData } from "./types"
import { supabase } from "@/integrations/supabase/client"
import { useQueryClient } from "@tanstack/react-query"

interface EditTradeSheetProps {
  isOpen: boolean
  onClose: () => void
  trade: TradeData
}

interface FormValues {
  ticker: string
  date_entry: Date | null
  date_exit: Date | null
  days_in_trade: number | null
  commission: number | null
  pnl: number | null
  roi: number | null
  roi_yearly: number | null
  roi_portfolio: number | null
  be_0: number | null
  be_1: number | null
  be_2: number | null
  notes: string | null
  trade_status: "open" | "closed"
}

export function EditTradeSheet({ isOpen, onClose, trade }: EditTradeSheetProps) {
  const queryClient = useQueryClient()
  
  const form = useForm<FormValues>({
    defaultValues: {
      ticker: trade.ticker || "",
      date_entry: trade.date_entry ? new Date(trade.date_entry) : null,
      date_exit: trade.date_exit ? new Date(trade.date_exit) : null,
      days_in_trade: trade.days_in_trade || null,
      commission: trade.commission || null,
      pnl: trade.pnl || null,
      roi: trade.roi || null,
      roi_yearly: trade.roi_yearly || null,
      roi_portfolio: trade.roi_portfolio || null,
      be_0: trade.be_0 || null,
      be_1: trade.be_1 || null,
      be_2: trade.be_2 || null,
      notes: trade.notes || null,
      trade_status: trade.trade_status as "open" | "closed" || "open"
    }
  })

  const onSubmit = async (values: FormValues) => {
    console.log('Submitting trade update with values:', values)
    
    try {
      const { error } = await supabase
        .from('trade_log')
        .update({
          ticker: values.ticker,
          date_entry: values.date_entry ? format(values.date_entry, 'yyyy-MM-dd') : null,
          date_exit: values.date_exit ? format(values.date_exit, 'yyyy-MM-dd') : null,
          days_in_trade: values.days_in_trade,
          commission: values.commission,
          pnl: values.pnl,
          roi: values.roi,
          roi_yearly: values.roi_yearly,
          roi_portfolio: values.roi_portfolio,
          be_0: values.be_0,
          be_1: values.be_1,
          be_2: values.be_2,
          notes: values.notes,
          trade_status: values.trade_status
        })
        .eq('id', trade.id)
      
      if (error) {
        console.error('Error updating trade:', error)
        throw error
      }
      
      console.log('Trade updated successfully')
      await queryClient.invalidateQueries({ queryKey: ['trades'] })
      onClose()
    } catch (error) {
      console.error('Error in onSubmit:', error)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Trade</SheetTitle>
        </SheetHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="ticker"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ticker</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="date_entry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date Entry</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="date_exit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date Exit</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="days_in_trade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Days in Trade</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value || ''} onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="commission"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Commission</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value || ''} onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="pnl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PnL</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value || ''} onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="roi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ROI</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value || ''} onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="roi_yearly"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ROI Yearly</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value || ''} onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="roi_portfolio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ROI Portfolio</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value || ''} onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="be_0"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>B/E 0</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value || ''} onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="be_1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>B/E 1</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value || ''} onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="be_2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>B/E 2</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value || ''} onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value || ''} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="trade_status"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Trade Status</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value === "closed"}
                      onCheckedChange={(checked) => field.onChange(checked ? "closed" : "open")}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-4 pt-4">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}