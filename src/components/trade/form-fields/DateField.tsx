import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { Control } from "react-hook-form"
import { FormValues } from "../types"

interface DateFieldProps {
  control: Control<FormValues>
  name: "date_entry" | "date_exit"
  label: string
}

export function DateField({ control, name, label }: DateFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <DatePicker
              selected={field.value}
              onChange={field.onChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              dateFormat="MMM dd, yyyy"
              isClearable
              placeholderText="Select date"
            />
          </FormControl>
        </FormItem>
      )}
    />
  )
}