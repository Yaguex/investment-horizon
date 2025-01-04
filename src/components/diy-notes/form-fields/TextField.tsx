import { FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Control, FieldValues, Path } from "react-hook-form"

interface TextFieldProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label: string
  placeholder?: string
  description?: string
}

export function TextField<T extends FieldValues>({ 
  control, 
  name, 
  label,
  placeholder,
  description
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
              placeholder={placeholder} 
              value={field.value || ''} 
              type={name === 'expiration' ? 'date' : 'text'}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
        </FormItem>
      )}
    />
  )
}