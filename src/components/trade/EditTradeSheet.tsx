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
import { SelectField } from "./form-fields/SelectField"
import { Textarea } from "@/components/ui/textarea"
import { recalculateChildMetrics, recalculateSiblingMetrics, recalculateParentMetrics } from "./utils/tradelogMetricsCalculation"

const vehicleOptions = [
  { label: "Stock", value: "Stock" },
  { label: "Fund", value: "Fund" },
  { label: "Buy call", value: "Buy call" },
  { label: "Buy put", value: "Buy put" },
  { label: "Sell call", value: "Sell call" },
  { label: "Sell put", value: "Sell put" },
  { label: "Buy call spread", value: "Buy call spread" },
  { label: "Buy put spread", value: "Buy put spread" },
  { label: "Sell call spread", value: "Sell call spread" },
  { label: "Sell put spread", value: "Sell put spread" },
  { label: "Roll over", value: "Roll over" },
  { label: "Exercise", value: "Exercise" }
]

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
      "risk_$": trade["risk_$"] || null,
      commission: trade.commission || null,
      pnl: trade.pnl || null,
      roi: trade.roi || null,
      be_0: trade.be_0 || null,
      be_1: trade.be_1 || null,
      be_2: trade.be_2 || null,
      delta: trade.delta || null,
      iv: trade.iv || null,
      iv_percentile: trade.iv_percentile || null,
      notes: trade.notes || "",
      trade_status: trade.trade_status as "open" | "closed" || "open"
    }
  })

  const onSubmit = async (values: FormValues) => {
    console.log('Submitting trade update with values:', values)
    
    try {
      if (trade.row_type === 'parent') {
        // For parent rows, get metrics from utility function
        const parentMetrics = await recalculateParentMetrics(
          trade.trade_id || 0,
          values.date_entry ? format(values.date_entry, 'yyyy-MM-dd') : null
        )
        
        if (!parentMetrics) {
          console.error('Failed to calculate parent metrics')
          throw new Error('Failed to calculate parent metrics')
        }

        const { error: updateError } = await supabase
          .from('trade_log')
          .update({
            ticker: values.ticker,
            date_entry: parentMetrics.oldestDateEntry,
            date_exit: parentMetrics.dateExit,
            days_in_trade: parentMetrics.daysInTrade,
            commission: parentMetrics.totalCommission,
            pnl: parentMetrics.totalPnl,
            roi: parentMetrics.parentRoi,
            roi_yearly: parentMetrics.parentYearlyRoi,
            roi_portfolio: parentMetrics.parentRoiPortfolio,
            be_0: values.be_0,
            be_1: values.be_1,
            be_2: values.be_2,
            notes: values.notes,
            trade_status: values.trade_status
          })
          .eq('id', trade.id)
        
        if (updateError) {
          console.error('Error updating parent trade:', updateError)
          throw updateError
        }
      } else {
        console.log('Starting child row update sequence')
        
        // Convert date strings to Date objects before calculations
        const dateEntry = values.date_entry ? new Date(values.date_entry) : null
        const dateExit = values.date_exit ? new Date(values.date_exit) : null
        const dateExpiration = values.date_expiration ? new Date(values.date_expiration) : null
        
        // 1. First calculate child metrics with converted dates
        const childMetrics = await recalculateChildMetrics(
          values,
          trade.trade_id || 0,
          trade.id,
          dateEntry,
          dateExit
        )
        
        console.log('Calculated child metrics:', childMetrics)
        
        // 2. Update child row with new metrics
        const { error: updateError } = await supabase
          .from('trade_log')
          .update({
            vehicle: values.vehicle,
            order: values.order,
            qty: values.qty,
            date_entry: dateEntry ? format(dateEntry, 'yyyy-MM-dd') : null,
            date_expiration: dateExpiration ? format(dateExpiration, 'yyyy-MM-dd') : null,
            date_exit: dateExit ? format(dateExit, 'yyyy-MM-dd') : null,
            days_in_trade: childMetrics.daysInTrade,
            strike_start: values.strike_start,
            strike_end: values.strike_end,
            premium: values.premium,
            stock_price: values.stock_price,
            "risk_%": childMetrics.riskPercentage,
            "risk_$": values["risk_$"],
            commission: values.commission,
            pnl: values.pnl,
            roi: childMetrics.roi,
            roi_yearly: childMetrics.roiYearly,
            roi_portfolio: childMetrics.roiPortfolio,
            be_0: values.be_0,
            be_1: values.be_1,
            be_2: values.be_2,
            delta: values.delta,
            iv: values.iv,
            iv_percentile: values.iv_percentile,
            notes: values.notes,
            trade_status: values.trade_status
          })
          .eq('id', trade.id)
        
        if (updateError) {
          console.error('Error updating child trade:', updateError)
          throw updateError
        }

        console.log('Child row updated successfully')

        // 3. If trade has siblings, update them
        if (trade.trade_id) {
          console.log('Calculating sibling metrics')
          const siblingMetrics = await recalculateSiblingMetrics(
            trade.trade_id,
            trade.id,
            values.pnl
          )
          
          console.log('Calculated sibling metrics:', siblingMetrics)
          
          // Get all sibling rows
          const { data: siblingRows, error: siblingFetchError } = await supabase
            .from('trade_log')
            .select('id')
            .eq('trade_id', trade.trade_id)
            .eq('row_type', 'child')
            .neq('id', trade.id)
          
          if (siblingFetchError) {
            console.error('Error fetching sibling rows:', siblingFetchError)
            throw siblingFetchError
          }
          
          // 4. Update each sibling sequentially
          console.log('Updating sibling rows')
          for (let i = 0; i < siblingRows.length; i++) {
            const { error: siblingUpdateError } = await supabase
              .from('trade_log')
              .update({ 
                roi: siblingMetrics[i].siblingRoi,
                roi_yearly: siblingMetrics[i].siblingYearlyRoi
              })
              .eq('id', siblingRows[i].id)

            if (siblingUpdateError) {
              console.error(`Error updating sibling row ${siblingRows[i].id}:`, siblingUpdateError)
              throw siblingUpdateError
            }
          }
          
          console.log('All sibling rows updated successfully')
          
          // 5. Finally calculate and update parent metrics
          console.log('Calculating parent metrics')
          const parentMetrics = await recalculateParentMetrics(
            trade.trade_id,
            values.date_entry ? format(values.date_entry, 'yyyy-MM-dd') : null
          )
          
          if (!parentMetrics) {
            console.error('Failed to calculate parent metrics')
            throw new Error('Failed to calculate parent metrics')
          }
          
          console.log('Calculated parent metrics:', parentMetrics)
          
          // 6. Update parent row
          const { error: parentUpdateError } = await supabase
            .from('trade_log')
            .update({
              commission: parentMetrics.totalCommission,
              pnl: parentMetrics.totalPnl,
              date_exit: parentMetrics.dateExit,
              days_in_trade: parentMetrics.daysInTrade,
              roi: parentMetrics.parentRoi,
              roi_yearly: parentMetrics.parentYearlyRoi,
              roi_portfolio: parentMetrics.parentRoiPortfolio
            })
            .eq('trade_id', trade.trade_id)
            .eq('row_type', 'parent')
          
          if (parentUpdateError) {
            console.error('Error updating parent trade totals:', parentUpdateError)
            throw parentUpdateError
          }
          
          console.log('Parent row updated successfully')
        }
      }
      
      console.log('Trade update completed successfully')
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
          <SheetTitle>Edit {trade.row_type === 'parent' ? 'Parent' : 'Sub-position'}</SheetTitle>
        </SheetHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            {trade.row_type === 'parent' ? (
              <>
                <TextField control={form.control} name="ticker" label="Ticker" />
                <NumberField control={form.control} name="be_0" label="B/E 0" />
                <NumberField control={form.control} name="be_1" label="B/E 1" />
                <NumberField control={form.control} name="be_2" label="B/E 2" />
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea {...form.register("notes")} />
                </div>
              </>
            ) : (
              <>
                <SelectField 
                  control={form.control} 
                  name="vehicle" 
                  label="Vehicle" 
                  options={vehicleOptions}
                />
                <TextField control={form.control} name="order" label="Order (Ex: Sell to open)" />
                <NumberField control={form.control} name="qty" label="QTY" />
                <DateField control={form.control} name="date_entry" label="Date Entry (YYYY-MM-DD)" />
                <DateField control={form.control} name="date_expiration" label="Date Expiration (YYYY-MM-DD)" />
                <DateField control={form.control} name="date_exit" label="Date Exit (YYYY-MM-DD)" />
                <NumberField control={form.control} name="strike_start" label="Strike Start" />
                <NumberField control={form.control} name="strike_end" label="Strike End" />
                <NumberField control={form.control} name="premium" label="Net Premium" />
                <NumberField control={form.control} name="stock_price" label="Stock Price" />
                <NumberField control={form.control} name="commission" label="Commission" />
                <NumberField control={form.control} name="pnl" label="PnL" />
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