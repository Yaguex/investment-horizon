import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { TextField } from "@/components/test/form-fields/TextField"
import { Loader } from "lucide-react"

export interface TestFormExpirationsValues {
  ticker: string
}

interface TestFormExpirationsProps {
  onSubmit: (data: TestFormExpirationsValues) => void
  isLoading: boolean
}

const TestFormExpirations = ({ onSubmit, isLoading }: TestFormExpirationsProps) => {
  const form = useForm<TestFormExpirationsValues>({
    defaultValues: {
      ticker: "SPY"
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
        
        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <Loader className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Fetch expirations"
          )}
        </Button>
      </form>
    </Form>
  )
}

export default TestFormExpirations