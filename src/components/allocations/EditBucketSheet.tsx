import { useForm } from "react-hook-form"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { useQueryClient } from "@tanstack/react-query"
import { TextField } from "../trade/form-fields/TextField"
import { useToast } from "@/components/ui/use-toast"

interface EditBucketSheetProps {
  isOpen: boolean
  onClose: () => void
  bucket: string
  id: number
}

interface FormValues {
  bucket: string
}

export function EditBucketSheet({ isOpen, onClose, bucket, id }: EditBucketSheetProps) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  const form = useForm<FormValues>({
    defaultValues: {
      bucket: bucket || "",
    }
  })

  const onSubmit = async (values: FormValues) => {
    console.log('Submitting bucket update with values:', values)
    
    try {
      const { error: updateError } = await supabase
        .from('allocations')
        .update({
          bucket: values.bucket,
        })
        .eq('id', id)
      
      if (updateError) {
        console.error('Error updating bucket:', updateError)
        toast({
          title: "Error",
          description: "Failed to update bucket",
          variant: "destructive",
        })
        throw updateError
      }
      
      console.log('Bucket updated successfully')
      toast({
        title: "Success",
        description: "Bucket updated successfully",
      })
      await queryClient.invalidateQueries({ queryKey: ['allocations'] })
      onClose()
    } catch (error) {
      console.error('Error in onSubmit:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Bucket</SheetTitle>
        </SheetHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <TextField control={form.control} name="bucket" label="Bucket" />
            
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