import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Control } from "react-hook-form"
import { FormValues } from "../types"

interface NumberFieldProps {
  control: Control<FormValues>
  name: keyof FormValues
  label: string
}

export function NumberField({ control, name, label }: NumberFieldProps) {
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
              value={field.value === null ? '' : typeof field.value === 'number' ? field.value : ''} 
              onChange={e => {
                const value = e.target.value ? Number(e.target.value) : null;
                field.onChange(value);
              }}
            />
          </FormControl>
        </FormItem>
      )}
    />
  )
}