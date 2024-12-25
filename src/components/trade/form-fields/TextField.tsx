import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Control } from "react-hook-form"
import { FormValues } from "../types"

interface TextFieldProps {
  control: Control<FormValues>
  name: keyof Pick<FormValues, 
    "ticker" | 
    "notes" | 
    "vehicle" | 
    "order"
  >
  label: string
  type?: "text" | "textarea"
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
            <Input {...field} value={field.value || ''} />
          </FormControl>
        </FormItem>
      )}
    />
  )
}