import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Control, FieldValues, Path } from "react-hook-form"
import { Input } from "@/components/ui/input"

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
            <Input
              {...field}
              placeholder="DD-MM-YYYY"
            />
          </FormControl>
        </FormItem>
      )}
    />
  )
}