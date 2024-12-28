import { useForm } from "react-hook-form"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { useQueryClient } from "@tanstack/react-query"
import { AllocationTradeFormValues } from "@/types/forms"
import { useToast } from "@/components/ui/use-toast"
import { Allocation } from "@/types/allocations"
import { AllocationFormFields } from "./form-fields/AllocationFormFields"

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
      const { error: updateError } = await supabase
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
      
      if (updateError) {
        console.error('Error updating allocation:', updateError)
        toast({
          title: "Error",
          description: "Failed to update allocation",
          variant: "destructive",
        })
        throw updateError
      }
      
      console.log('Allocation updated successfully, now recalculating values...')

      const { error: recalculateError } = await supabase
        .rpc('recalculate_allocations', {
          profile_id_param: allocation.profile_id
        })

      if (recalculateError) {
        console.error('Error recalculating allocations:', recalculateError)
        toast({
          title: "Error",
          description: "Failed to recalculate allocations",
          variant: "destructive",
        })
        throw recalculateError
      }

      console.log('Allocations recalculated successfully')
      
      // Invalidate both queries to ensure all components update
      await queryClient.invalidateQueries({ 
        queryKey: ['allocations']
      })
      await queryClient.invalidateQueries({ 
        queryKey: ['portfolioLatestData']
      })
      await queryClient.invalidateQueries({ 
        queryKey: ['allocationsMetrics']
      })
      
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
            <AllocationFormFields control={form.control} />
            
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