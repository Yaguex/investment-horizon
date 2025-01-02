import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Control, FieldValues, Path } from "react-hook-form"

interface TextFieldProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label: string
  type?: "text" | "number"
}

export function TextField<T extends FieldValues>({ 
  control, 
  name, 
  label, 
  type = "text" 
}: TextFieldProps<T>) {
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
              value={field.value === null || field.value === undefined ? '' : field.value}
              onChange={e => {
                const value = type === "number" ? 
                  e.target.value === '' ? null : Number(e.target.value)
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