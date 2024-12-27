import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Control } from "react-hook-form"
import { AllocationTradeFormValues } from "@/types/forms"

interface TextFieldProps {
  control: Control<AllocationTradeFormValues>
  name: keyof AllocationTradeFormValues
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
              {...field} 
              type={type}
              value={field.value || ''} 
              onChange={e => {
                const value = type === "number" ? 
                  e.target.value ? Number(e.target.value) : 0 
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