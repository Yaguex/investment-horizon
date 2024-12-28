import { Control } from "react-hook-form"
import { FormValues } from "../types"
import { TextField } from "./TextField"
import { DatePickerField } from "./DatePickerField"
import { NumberField } from "./NumberField"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { FormItem, FormLabel } from "@/components/ui/form"

interface ParentTradeFieldsProps {
  control: Control<FormValues>
  register: any
  watch: any
  setValue: any
}

export function ParentTradeFields({ control, register, watch, setValue }: ParentTradeFieldsProps) {
  return (
    <div className="space-y-4">
      <TextField control={control} name="ticker" label="Ticker" />
      <DatePickerField control={control} name="date_entry" label="Date Entry" />
      <DatePickerField control={control} name="date_exit" label="Date Exit" />
      <NumberField control={control} name="commission" label="Commission" />
      <NumberField control={control} name="pnl" label="PnL" />
      <NumberField control={control} name="roi" label="ROI" />
      <NumberField control={control} name="roi_yearly" label="ROI Yearly" />
      <NumberField control={control} name="roi_portfolio" label="ROI Portfolio" />
      <NumberField control={control} name="be_0" label="B/E 0" />
      <NumberField control={control} name="be_1" label="B/E 1" />
      <NumberField control={control} name="be_2" label="B/E 2" />
      <div className="space-y-2">
        <FormLabel>Notes</FormLabel>
        <Textarea {...register("notes")} />
      </div>
      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <FormLabel>Closed Trade</FormLabel>
        </div>
        <Switch
          checked={watch("trade_status") === "closed"}
          onCheckedChange={(checked) => setValue("trade_status", checked ? "closed" : "open")}
        />
      </FormItem>
    </div>
  )
}