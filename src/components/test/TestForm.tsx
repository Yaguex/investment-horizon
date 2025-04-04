import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { TextField } from "@/components/test/form-fields/TextField"
import { NumberField } from "@/components/test/form-fields/NumberField"
import { Loader } from "lucide-react"

export interface TestFormValues {
  ticker: string
  expiration: string
  strike_entry: number | null
  strike_target: number | null
  strike_protection: number | null
}

interface TestFormProps {
  onSubmit: (data: TestFormValues) => void
  isLoading: boolean
}

const TestForm = ({ onSubmit, isLoading }: TestFormProps) => {
  const form = useForm<TestFormValues>({
    defaultValues: {
      ticker: "SPY",
      expiration: "2025-12-19",
      strike_entry: 590,
      strike_target: 640,
      strike_protection: 560
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <TextField
          control={form.control}
          name="ticker"
          label="Ticker"
        />
        
        <TextField
          control={form.control}
          name="expiration"
          label="Expiration (YYYY-MM-DD)"
        />
        
        <NumberField
          control={form.control}
          name="strike_entry"
          label="Strike Entry"
        />

        <NumberField
          control={form.control}
          name="strike_target"
          label="Strike Target"
        />

        <NumberField
          control={form.control}
          name="strike_protection"
          label="Strike Protection"
        />
        
        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <Loader className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Generate Symbols"
          )}
        </Button>
      </form>
    </Form>
  )
}

export default TestForm