import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Control, FieldValues, Path } from "react-hook-form"
import DatePicker from "react-date-picker"
import "react-date-picker/dist/DatePicker.css"
import "react-calendar/dist/Calendar.css"
import { format } from "date-fns"

interface DateFieldProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label: string
  maxDate?: Date
}

export function DateField<T extends FieldValues>({ control, name, label, maxDate }: DateFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col space-y-2">
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <DatePicker
              value={field.value}
              onChange={(value) => {
                // Handle the Value type from react-date-picker
                if (value instanceof Date) {
                  console.log('DateField selected date:', value)
                  field.onChange(value)
                } else if (Array.isArray(value)) {
                  // If somehow we get a range, use the first date
                  const date = value[0]
                  if (date instanceof Date) {
                    console.log('DateField selected date from range:', date)
                    field.onChange(date)
                  } else {
                    console.log('DateField clearing value')
                    field.onChange(null)
                  }
                } else {
                  console.log('DateField clearing value')
                  field.onChange(null)
                }
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              format="dd-MM-y"
              clearIcon={null}
              maxDate={maxDate}
              minDate={new Date("1900-01-01")}
            />
          </FormControl>
        </FormItem>
      )}
    />
  )
}