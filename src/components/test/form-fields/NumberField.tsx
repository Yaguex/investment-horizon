import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Control, FieldValues, Path } from "react-hook-form"

interface NumberFieldProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label: string
}

export function NumberField<T extends FieldValues>({ 
  control, 
  name, 
  label 
}: NumberFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input 
              type="number"
              {...field}
              onChange={(e) => {
                const value = e.target.value === '' ? null : Number(e.target.value);
                field.onChange(value);
              }}
            />
          </FormControl>
        </FormItem>
      )}
    />
  )
}