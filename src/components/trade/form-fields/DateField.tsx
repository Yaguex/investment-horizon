import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Control, FieldValues, Path } from "react-hook-form"
import ReactDatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

interface DateFieldProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label: string
}

export function DateField<T extends FieldValues>({ control, name, label }: DateFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col space-y-2">
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <ReactDatePicker
              selected={field.value}
              onChange={(date) => field.onChange(date)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              dateFormat="MMMM d, yyyy"
              isClearable
              placeholderText="Select a date"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              maxDate={new Date()}
              minDate={new Date("1900-01-01")}
            />
          </FormControl>
        </FormItem>
      )}
    />
  )
}