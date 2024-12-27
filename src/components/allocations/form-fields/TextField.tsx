import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Control } from "react-hook-form"
import { FormValues } from "@/types/forms"

interface TextFieldProps {
  control: Control<FormValues>
  name: keyof FormValues
  label: string
  type?: "text" | "number"
}

export function TextField({ control, name, label, type = "text" }: TextFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input 
              type={type}
              {...field}
              value={field.value || ''}
              onChange={e => {
                const value = type === "number" ? 
                  e.target.value ? Number(e.target.value) : null 
                  : e.target.value;
                field.onChange(value);
              }}
            />
          </FormControl>
        </FormItem>
      )}
    />
  )
}