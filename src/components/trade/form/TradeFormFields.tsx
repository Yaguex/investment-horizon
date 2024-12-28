import { Control } from "react-hook-form"
import { FormValues } from "../types"
import { TextField } from "../form-fields/TextField"
import { DateField } from "../form-fields/DateField"
import { NumberField } from "../form-fields/NumberField"
import { Textarea } from "@/components/ui/textarea"

interface TradeFormFieldsProps {
  control: Control<FormValues>
  register: any
}

export const TradeFormFields = ({ control, register }: TradeFormFieldsProps) => {
  return (
    <>
      <TextField control={control} name="vehicle" label="Vehicle" />
      <TextField control={control} name="order" label="Order" />
      <NumberField control={control} name="qty" label="QTY" />
      <DateField control={control} name="date_entry" label="Date Entry" />
      <DateField control={control} name="date_expiration" label="Date Expiration" />
      <DateField control={control} name="date_exit" label="Date Exit" />
      <NumberField control={control} name="strike_start" label="Strike Start" />
      <NumberField control={control} name="strike_end" label="Strike End" />
      <NumberField control={control} name="premium" label="Premium" />
      <NumberField control={control} name="stock_price" label="Stock Price" />
      <NumberField control={control} name="risk_%" label="Risk %" />
      <NumberField control={control} name="risk_$" label="Risk $" />
      <NumberField control={control} name="commission" label="Commission" />
      <NumberField control={control} name="pnl" label="PnL" />
      <NumberField control={control} name="roi" label="ROI" />
      <NumberField control={control} name="roi_yearly" label="ROI Yearly" />
      <NumberField control={control} name="roi_portfolio" label="ROI Portfolio" />
      <NumberField control={control} name="be_0" label="B/E 0" />
      <NumberField control={control} name="be_1" label="B/E 1" />
      <NumberField control={control} name="be_2" label="B/E 2" />
      <NumberField control={control} name="delta" label="Delta" />
      <NumberField control={control} name="iv" label="IV" />
      <NumberField control={control} name="iv_percentile" label="IV Percentile" />
      <div className="space-y-2">
        <label className="text-sm font-medium">Notes</label>
        <Textarea {...register("notes")} />
      </div>
    </>
  )
}