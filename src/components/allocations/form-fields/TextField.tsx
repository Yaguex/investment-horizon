import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Control } from "react-hook-form"
import { BucketFormValues } from "@/types/forms"

interface TextFieldProps {
  control: Control<BucketFormValues>
  name: keyof BucketFormValues
  label: string
}

export function TextField({ control, name, label }: TextFieldProps) {
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