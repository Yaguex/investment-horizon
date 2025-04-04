import { Control } from "react-hook-form"
import { TextField } from "./form-fields/TextField"
import { NumberField } from "./form-fields/NumberField"
import { SelectField } from "./form-fields/SelectField"
import { PositionSizeFormValues } from "./types"

interface PositionSizeFormFieldsProps {
  control: Control<PositionSizeFormValues>
  actionOptions: { value: string; label: string }[]
}

export function PositionSizeFormFields({ control, actionOptions }: PositionSizeFormFieldsProps) {
  return (
    <>
      <TextField
        control={control}
        name="ticker"
        label="Ticker"
      />
      <SelectField
        control={control}
        name="action"
        label="Action"
        options={actionOptions}
      />
      <NumberField
        control={control}
        name="nominal"
        label="Nominal (total desired exposure) ($)"
      />
      <TextField
        control={control}
        name="expiration"
        label="Expiration (YYYY-MM-DD)"
      />
      <NumberField
        control={control}
        name="risk_free_yield"
        label="Risk Free Yield (%)"
      />
      <NumberField
              control={form.control}
              name="bond_yield"
              label="Bond Yield (%)"
            />
      <NumberField
        control={control}
        name="strike_entry"
        label="Strike Entry"
      />
      <NumberField
        control={control}
        name="strike_exit"
        label="Strike Exit"
      />
    </>
  )
}
