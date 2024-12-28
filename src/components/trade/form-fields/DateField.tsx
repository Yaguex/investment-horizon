import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Control, FieldValues, Path } from "react-hook-form"
import { DatePicker } from "@/components/ui/date-picker"

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
            <DatePicker
              value={field.value}
              onChange={(date) => {
                field.onChange(date)
              }}
            />
          </FormControl>
        </FormItem>
      )}
    />
  )
}