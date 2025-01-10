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

  const calculateDaysInTrade = (dateEntry: Date | null, dateExit: Date | null) => {
    if (!dateEntry || !dateExit) return null
    const diffTime = Math.abs(dateExit.getTime() - dateEntry.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const calculateYearlyRoi = (roi: number | null, daysInTrade: number) => {
    if (roi === null || daysInTrade === null) return null
    return Number((roi * (365.0 / Math.max(daysInTrade, 1))).toFixed(2))
  }

  const onSubmit = async (values: FormValues) => {
    console.log('Submitting trade update with values:', values)
    
    try {
      const { data: portfolioData, error: portfolioError } = await supabase
        .from('portfolio_data')
        .select('balance')
        .order('month', { ascending: false })
        .limit(1)

      if (portfolioError) {
        console.error('Error fetching portfolio balance:', portfolioError)
        throw portfolioError
      }

      const latestBalance = portfolioData?.[0]?.balance || 0
      console.log('Latest portfolio balance:', latestBalance)

      if (trade.row_type === 'parent') {
        const { data: childRows, error: fetchError } = await supabase
          .from('trade_log')
          .select('commission, pnl, date_entry')
          .eq('trade_id', trade.trade_id)
          .eq('row_type', 'child')
        
        if (fetchError) {
          console.error('Error fetching child rows:', fetchError)
          throw fetchError
        }

        let oldestDateEntry = '1999-01-01'
        if (childRows && childRows.length > 0) {
          const validDates = childRows
            .map(row => row.date_entry)
            .filter(date => date !== null) as string[]
          
          if (validDates.length > 0) {
            oldestDateEntry = validDates.reduce((oldest, current) => 
              current < oldest ? current : oldest
            )
          }
        }
        
        const totalCommission = childRows?.reduce((sum, row) => sum + (row.commission || 0), 0) || 0
        const totalPnl = childRows?.reduce((sum, row) => sum + (row.pnl || 0), 0) || 0
        
        const sumNegativePnl = childRows?.reduce((sum, row) => {
          const pnl = row.pnl || 0
          return sum + (pnl < 0 ? Math.abs(pnl) : 0)
        }, 0) || 0

        const roi = sumNegativePnl === 0 ? 0 : Number(((totalPnl / sumNegativePnl) * 100).toFixed(2))
        const yearlyRoi = calculateYearlyRoi(roi, 0) // Assuming daysInTrade is calculated elsewhere

        const dateExit = values.trade_status === 'closed' ? format(new Date(), 'yyyy-MM-dd') : null
        const daysInTrade = dateExit ? calculateDaysInTrade(new Date(oldestDateEntry), new Date(dateExit)) : null
        
        const roiPortfolio = latestBalance > 0 ? Number(((totalPnl / latestBalance) * 100).toFixed(2)) : 0
        console.log('Calculated parent ROI Portfolio:', roiPortfolio)

        const { error: updateError } = await supabase
          .from('trade_log')
          .update({
            ticker: values.ticker,
            date_entry: oldestDateEntry,
            date_exit: dateExit,
            days_in_trade: daysInTrade,
            commission: totalCommission,
            pnl: totalPnl,
            roi,
            roi_yearly: yearlyRoi,
            roi_portfolio: roiPortfolio,
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
        const daysInTrade = calculateDaysInTrade(values.date_entry, values.date_exit)
        
        const { data: siblingRows, error: siblingError } = await supabase
          .from('trade_log')
          .select('id, pnl')
          .eq('trade_id', trade.trade_id)
          .eq('row_type', 'child')

        if (siblingError) {
          console.error('Error fetching sibling rows:', siblingError)
          throw siblingError
        }

        const roi = sumNegativePnl === 0 ? 0 : Number(((values.pnl || 0) / sumNegativePnl * 100).toFixed(2))
        const yearlyRoi = calculateYearlyRoi(roi, daysInTrade || 0)

        const { error: updateError } = await supabase
          .from('trade_log')
          .update({
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
            roi,
            roi_yearly: yearlyRoi,
            roi_portfolio: roiPortfolio,
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

        for (const sibling of siblingRows) {
          if (sibling.id !== trade.id) {
            const siblingRoi = sumNegativePnl === 0 ? 0 : Number(((sibling.pnl || 0) / sumNegativePnl * 100).toFixed(2))
            const siblingYearlyRoi = calculateYearlyRoi(siblingRoi, daysInTrade || 0)
            
            const { error: siblingUpdateError } = await supabase
              .from('trade_log')
              .update({ roi: siblingRoi, roi_yearly: siblingYearlyRoi })
              .eq('id', sibling.id)

            if (siblingUpdateError) {
              console.error(`Error updating sibling row ${sibling.id}:`, siblingUpdateError)
              throw siblingUpdateError
            }
          }
        }
        
        if (trade.trade_id) {
          const { data: childRows, error: fetchError } = await supabase
            .from('trade_log')
            .select('commission, pnl, date_entry')
            .eq('trade_id', trade.trade_id)
            .eq('row_type', 'child')
          
          if (fetchError) {
            console.error('Error fetching child rows for parent update:', fetchError)
            throw fetchError
          }

          let oldestDateEntry = '1999-01-01'
          if (childRows && childRows.length > 0) {
            const validDates = childRows
              .map(row => row.date_entry)
              .filter(date => date !== null) as string[]
            
            if (validDates.length > 0) {
              oldestDateEntry = validDates.reduce((oldest, current) => 
                current < oldest ? current : oldest
              )
            }
          }
          
          const totalCommission = childRows?.reduce((sum, row) => sum + (row.commission || 0), 0) || 0
          const totalPnl = childRows?.reduce((sum, row) => sum + (row.pnl || 0), 0) || 0
          
          const sumNegativePnl = childRows?.reduce((sum, row) => {
            const pnl = row.pnl || 0
            return sum + (pnl < 0 ? Math.abs(pnl) : 0)
          }, 0) || 0

          const parentRoi = sumNegativePnl === 0 ? 0 : Number(((totalPnl / sumNegativePnl) * 100).toFixed(2))
          const parentRoiPortfolio = latestBalance > 0 ? Number(((totalPnl / latestBalance) * 100).toFixed(2)) : 0
          console.log('Updating parent with new totals:', { 
            totalCommission, 
            totalPnl, 
            oldestDateEntry, 
            parentRoiPortfolio,
            parentRoi,
            sumNegativePnl
          })
          
          const { error: parentUpdateError } = await supabase
            .from('trade_log')
            .update({
              commission: totalCommission,
              pnl: totalPnl,
              date_entry: oldestDateEntry,
              roi: parentRoi,
              roi_portfolio: parentRoiPortfolio
            })
            .eq('trade_id', trade.trade_id)
            .eq('row_type', 'parent')
          
          if (parentUpdateError) {
            console.error('Error updating parent trade totals:', parentUpdateError)
            throw parentUpdateError
          }
        }
      }
      
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
                <TextField control={form.control} name="vehicle" label="Vehicle (Ex: Sell put)" />
                <TextField control={form.control} name="order" label="Order (Ex: Sell to open)" />
                <NumberField control={form.control} name="qty" label="QTY" />
                <DateField control={form.control} name="date_entry" label="Date Entry (YYYY-MM-DD)" />
                <DateField control={form.control} name="date_expiration" label="Date Expiration (YYYY-MM-DD)" />
                <DateField control={form.control} name="date_exit" label="Date Exit (YYYY-MM-DD)" />
                <NumberField control={form.control} name="strike_start" label="Strike Start" />
                <NumberField control={form.control} name="strike_end" label="Strike End" />
                <NumberField control={form.control} name="premium" label="Premium" />
                <NumberField control={form.control} name="stock_price" label="Stock Price" />
                <NumberField control={form.control} name="risk_%" label="Risk %" />
                <NumberField control={form.control} name="risk_$" label="Risk $" />
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
