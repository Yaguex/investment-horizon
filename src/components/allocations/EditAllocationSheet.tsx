import { useForm } from "react-hook-form"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { useQueryClient } from "@tanstack/react-query"
import { TextField } from "./form-fields/TextField"
import { SelectField } from "./form-fields/SelectField"
import { useToast } from "@/components/ui/use-toast"
import { AllocationTradeFormValues } from "@/types/forms"
import { Allocation } from "@/types/allocations"

interface EditAllocationSheetProps {
  isOpen: boolean
  onClose: () => void
  allocation: Allocation
}

export function EditAllocationSheet({ isOpen, onClose, allocation }: EditAllocationSheetProps) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  const form = useForm<AllocationTradeFormValues>({
    defaultValues: {
      bucket: allocation.bucket || "",
      vehicle: allocation.vehicle || "",
      value_actual: allocation.value_actual || 0,
      weight_target: allocation.weight_target || 0,
      risk_profile: allocation.risk_profile || "",
      "dividend_%": allocation["dividend_%"] || 0,
    }
  })

  const onSubmit = async (values: AllocationTradeFormValues) => {
    console.log('Submitting allocation update with values:', values)
    
    try {
      const { error } = await supabase
        .from('allocations')
        .update({
          bucket: values.bucket,
          vehicle: values.vehicle,
          value_actual: values.value_actual,
          weight_target: values.weight_target,
          risk_profile: values.risk_profile,
          "dividend_%": values["dividend_%"],
        })
        .eq('id', allocation.id)
      
      if (error) {
        console.error('Error updating allocation:', error)
        toast({
          title: "Error",
          description: "Failed to update allocation",
          variant: "destructive",
        })
        throw error
      }
      
      console.log('Allocation updated successfully')
      await queryClient.invalidateQueries({ queryKey: ['allocations'] })
      toast({
        title: "Success",
        description: "Allocation updated successfully",
      })
      onClose()
    } catch (error) {
      console.error('Error in onSubmit:', error)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Allocation</SheetTitle>
        </SheetHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <TextField control={form.control} name="bucket" label="Bucket" />
            <SelectField 
              control={form.control} 
              name="vehicle" 
              label="Vehicle"
              options={[
                { value: "Stock", label: "Stock" },
                { value: "Note", label: "Note" },
                { value: "Fund", label: "Fund" },
                { value: "Bond", label: "Bond" },
                { value: "Options", label: "Options" },
              ]}
            />
            <TextField control={form.control} name="value_actual" label="Value actual" type="number" />
            <TextField control={form.control} name="weight_target" label="Weight target" type="number" />
            <SelectField 
              control={form.control} 
              name="risk_profile" 
              label="Risk profile"
              options={[
                { value: "High", label: "High" },
                { value: "Medium", label: "Medium" },
                { value: "Low", label: "Low" },
              ]}
            />
            <TextField control={form.control} name="dividend_%" label="Dividend %" type="number" />
            
            <div className="flex justify-end space-x-4 pt-4">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}