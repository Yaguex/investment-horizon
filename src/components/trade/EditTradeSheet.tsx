import { useForm } from "react-hook-form"
import { format } from "date-fns"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { TradeData, FormValues } from "./types"
import { supabase } from "@/integrations/supabase/client"
import { useQueryClient } from "@tanstack/react-query"
import { TextField } from "./form-fields/TextField"
import { DateField } from "./form-fields/DateField"
import { NumberField } from "./form-fields/NumberField"
import { Textarea } from "@/components/ui/textarea"

interface EditTradeSheetProps {
  isOpen: boolean
  onClose: () => void
  trade: TradeData
}

export function EditTradeSheet({ isOpen, onClose, trade }: EditTradeSheetProps) {
  const queryClient = useQueryClient()
  
  const form = useForm<FormValues>({
    defaultValues: {
      ticker: trade.ticker || "",
      vehicle: trade.vehicle || "",
      order: trade.order || "",
      qty: trade.qty || null,
      date_entry: trade.date_entry ? new Date(trade.date_entry) : null,
      date_expiration: trade.date_expiration ? new Date(trade.date_expiration) : null,
      date_exit: trade.date_exit ? new Date(trade.date_exit) : null,
      days_in_trade: trade.days_in_trade || null,
      strike_start: trade.strike_start || null,
      strike_end: trade.strike_end || null,
      premium: trade.premium || null,
      stock_price: trade.stock_price || null,
      "risk_%": trade["risk_%"] || null,
      "risk_$": trade["risk_$"] || null,
      commission: trade.commission || null,
      pnl: trade.pnl || null,
      roi: trade.roi || null,
      roi_yearly: trade.roi_yearly || null,
      roi_portfolio: trade.roi_portfolio || null,
      be_0: trade.be_0 || null,
      be_1: trade.be_1 || null,
      be_2: trade.be_2 || null,
      delta: trade.delta || null,
      iv: trade.iv || null,
      iv_percentile: trade.iv_percentile || null,
      notes: trade.notes || "",
      trade_status: trade.trade_status as "open" | "closed" || "open",
      bucket: trade.bucket || "" // Adding bucket field
    }
  })

  const calculateDaysInTrade = (dateEntry: Date | null, dateExit: Date | null) => {
    if (!dateEntry || !dateExit) return null
    const diffTime = Math.abs(dateExit.getTime() - dateEntry.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const onSubmit = async (values: FormValues) => {
    console.log('Submitting trade update with values:', values)
    
    try {
      const daysInTrade = calculateDaysInTrade(values.date_entry, values.date_exit)
      
      const { error: updateError } = await supabase
        .from('trade_log')
        .update({
          ...(trade.row_type === 'parent' ? {
            ticker: values.ticker,
            date_entry: values.date_entry ? format(values.date_entry, 'yyyy-MM-dd') : null,
            date_exit: values.date_exit ? format(values.date_exit, 'yyyy-MM-dd') : null,
            days_in_trade: daysInTrade,
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
          } : {
            vehicle: values.vehicle,
            order: values.order,
            qty: values.qty,
            date_entry: values.date_entry ? format(values.date_entry, 'yyyy-MM-dd') : null,
            date_expiration: values.date_expiration ? format(values.date_expiration, 'yyyy-MM-dd') : null,
            date_exit: values.date_exit ? format(values.date_exit, 'yyyy-MM-dd') : null,
            days_in_trade: daysInTrade,
            strike_start: values.strike_start,
            strike_end: values.strike_end,
            premium: values.premium,
            stock_price: values.stock_price,
            "risk_%": values["risk_%"],
            "risk_$": values["risk_$"],
            commission: values.commission,
            pnl: values.pnl,
            roi: values.roi,
            roi_yearly: values.roi_yearly,
            roi_portfolio: values.roi_portfolio,
            be_0: values.be_0,
            be_1: values.be_1,
            be_2: values.be_2,
            delta: values.delta,
            iv: values.iv,
            iv_percentile: values.iv_percentile,
            notes: values.notes,
            trade_status: values.trade_status,
            bucket: values.bucket // Adding bucket field to update
          })
        })
        .eq('id', trade.id)
      
      if (updateError) {
        console.error('Error updating trade:', updateError)
        throw updateError
      }
      
      // For parent rows only, update all child rows' trade_status
      if (trade.row_type === 'parent' && values.trade_status !== trade.trade_status && trade.trade_id) {
        const { error: childError } = await supabase
          .from('trade_log')
          .update({
            trade_status: values.trade_status
          })
          .eq('trade_id', trade.trade_id)
          .eq('row_type', 'child')
        
        if (childError) {
          console.error('Error updating child trades:', childError)
          throw childError
        }
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
          <SheetTitle>Edit {trade.row_type === 'parent' ? 'Parent' : 'Child'} Trade</SheetTitle>
        </SheetHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            {trade.row_type === 'parent' ? (
              // Parent row fields
              <>
                <TextField control={form.control} name="ticker" label="Ticker" />
                <DateField control={form.control} name="date_entry" label="Date Entry" />
                <DateField control={form.control} name="date_exit" label="Date Exit" />
                <NumberField control={form.control} name="commission" label="Commission" />
                <NumberField control={form.control} name="pnl" label="PnL" />
                <NumberField control={form.control} name="roi" label="ROI" />
                <NumberField control={form.control} name="roi_yearly" label="ROI Yearly" />
                <NumberField control={form.control} name="roi_portfolio" label="ROI Portfolio" />
                <NumberField control={form.control} name="be_0" label="B/E 0" />
                <NumberField control={form.control} name="be_1" label="B/E 1" />
                <NumberField control={form.control} name="be_2" label="B/E 2" />
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea {...form.register("notes")} />
                </div>
              </>
            ) : (
              // Child row fields
              <>
                <TextField control={form.control} name="vehicle" label="Vehicle" />
                <TextField control={form.control} name="order" label="Order" />
                <TextField control={form.control} name="bucket" label="Bucket" />
                <NumberField control={form.control} name="qty" label="QTY" />
                <DateField control={form.control} name="date_entry" label="Date Entry" />
                <DateField control={form.control} name="date_expiration" label="Date Expiration" />
                <DateField control={form.control} name="date_exit" label="Date Exit" />
                <NumberField control={form.control} name="strike_start" label="Strike Start" />
                <NumberField control={form.control} name="strike_end" label="Strike End" />
                <NumberField control={form.control} name="premium" label="Premium" />
                <NumberField control={form.control} name="stock_price" label="Stock Price" />
                <NumberField control={form.control} name="risk_%" label="Risk %" />
                <NumberField control={form.control} name="risk_$" label="Risk $" />
                <NumberField control={form.control} name="commission" label="Commission" />
                <NumberField control={form.control} name="pnl" label="PnL" />
                <NumberField control={form.control} name="roi" label="ROI" />
                <NumberField control={form.control} name="roi_yearly" label="ROI Yearly" />
                <NumberField control={form.control} name="roi_portfolio" label="ROI Portfolio" />
                <NumberField control={form.control} name="be_0" label="B/E 0" />
                <NumberField control={form.control} name="be_1" label="B/E 1" />
                <NumberField control={form.control} name="be_2" label="B/E 2" />
                <NumberField control={form.control} name="delta" label="Delta" />
                <NumberField control={form.control} name="iv" label="IV" />
                <NumberField control={form.control} name="iv_percentile" label="IV Percentile" />
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea {...form.register("notes")} />
                </div>
              </>
            )}
            
            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <div className="text-base">Closed Trade</div>
              </div>
              <Switch
                checked={form.watch("trade_status") === "closed"}
                onCheckedChange={(checked) => form.setValue("trade_status", checked ? "closed" : "open")}
              />
            </div>
            
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