import { useForm } from "react-hook-form"
import { format } from "date-fns"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { TradeData, PositionFormValues } from "./types"
import { supabase } from "@/integrations/supabase/client"
import { useQueryClient } from "@tanstack/react-query"
import { TextField } from "./form-fields/TextField"
import { DateField } from "./form-fields/DateField"
import { NumberField } from "./form-fields/NumberField"
import { Textarea } from "@/components/ui/textarea"

interface EditPositionSheetProps {
  isOpen: boolean
  onClose: () => void
  trade: TradeData
}

export function EditPositionSheet({ isOpen, onClose, trade }: EditPositionSheetProps) {
  const queryClient = useQueryClient()
  
  const form = useForm<PositionFormValues>({
    defaultValues: {
      ticker: trade.ticker || "",
      date_entry: trade.date_entry ? new Date(trade.date_entry) : null,
      date_exit: trade.date_exit ? new Date(trade.date_exit) : null,
      commission: trade.commission || null,
      pnl: trade.pnl || null,
      roi: trade.roi || null,
      roi_yearly: trade.roi_yearly || null,
      roi_portfolio: trade.roi_portfolio || null,
      be_0: trade.be_0 || null,
      be_1: trade.be_1 || null,
      be_2: trade.be_2 || null,
      notes: trade.notes || "",
      trade_status: trade.trade_status as "open" | "closed" || "open"
    }
  })

  const calculateDaysInTrade = (dateEntry: Date | null, dateExit: Date | null) => {
    if (!dateEntry) return 0
    const exitDate = dateExit || new Date()
    const diffTime = Math.abs(exitDate.getTime() - dateEntry.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const calculateYearlyROI = (roi: number | null, daysInTrade: number) => {
    if (!roi || daysInTrade === 0) return 0
    return Number(((roi / daysInTrade) * 365).toFixed(2))
  }

  const onSubmit = async (values: PositionFormValues) => {
    console.log('Submitting position update with values:', values)
    
    try {
      const daysInTrade = calculateDaysInTrade(values.date_entry, values.date_exit)
      const yearlyRoi = calculateYearlyROI(values.roi, daysInTrade)
      
      // Update parent row
      const { error: updateError } = await supabase
        .from('trade_log')
        .update({
          ticker: values.ticker,
          date_entry: values.date_entry ? format(values.date_entry, 'yyyy-MM-dd') : null,
          date_exit: values.date_exit ? format(values.date_exit, 'yyyy-MM-dd') : null,
          days_in_trade: daysInTrade,
          commission: values.commission,
          pnl: values.pnl,
          roi: values.roi,
          roi_yearly: yearlyRoi,
          roi_portfolio: values.roi_portfolio,
          be_0: values.be_0,
          be_1: values.be_1,
          be_2: values.be_2,
          notes: values.notes,
          trade_status: values.trade_status
        })
        .eq('id', trade.id)
      
      if (updateError) {
        console.error('Error updating position:', updateError)
        throw updateError
      }
      
      // Update all child rows' trade_status and yearly_roi if trade_id exists
      if (trade.trade_id) {
        const { error: childError } = await supabase
          .from('trade_log')
          .update({
            trade_status: values.trade_status,
            roi_yearly: yearlyRoi
          })
          .eq('trade_id', trade.trade_id)
          .eq('row_type', 'child')
        
        if (childError) {
          console.error('Error updating child trades:', childError)
          throw childError
        }
      }
      
      console.log('Position updated successfully')
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
          <SheetTitle>Edit Position</SheetTitle>
        </SheetHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <TextField control={form.control} name="ticker" label="Ticker" />
            <DateField control={form.control} name="date_entry" label="Date Entry (YYYY-MM-DD)" />
            <DateField control={form.control} name="date_exit" label="Date Exit (YYYY-MM-DD)" />
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