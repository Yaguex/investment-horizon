import { useState } from "react"
import { useForm } from "react-hook-form"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

interface EditBucketDrawerProps {
  isOpen: boolean
  onClose: () => void
  bucket: string
  id: number
}

interface FormValues {
  bucket: string
}

export function EditBucketDrawer({ isOpen, onClose, bucket, id }: EditBucketDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const form = useForm<FormValues>({
    defaultValues: {
      bucket: bucket
    }
  })

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)
    try {
      console.log('Updating bucket with id:', id, 'New values:', values)
      
      const { error } = await supabase
        .from('allocations')
        .update({ bucket: values.bucket })
        .eq('id', id)

      if (error) {
        console.error('Error updating bucket:', error)
        toast({
          title: "Error",
          description: "Failed to update bucket",
          variant: "destructive"
        })
        return
      }

      console.log('Successfully updated bucket')
      queryClient.invalidateQueries({ queryKey: ['allocations'] })
      
      toast({
        title: "Success",
        description: "Bucket updated successfully"
      })
      
      onClose()
    } catch (error) {
      console.error('Error in onSubmit:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Edit Bucket</DrawerTitle>
          </DrawerHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-4">
              <FormField
                control={form.control}
                name="bucket"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bucket</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DrawerFooter>
                <div className="flex justify-end gap-4">
                  <DrawerClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DrawerClose>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save"}
                  </Button>
                </div>
              </DrawerFooter>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  )
}