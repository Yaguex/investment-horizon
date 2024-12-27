import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/components/ui/use-toast"

export function NewBucketButton() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const handleNewBucket = async () => {
    if (!user) {
      console.error('No user found')
      toast({
        title: "Error",
        description: "You must be logged in to create a bucket",
        variant: "destructive"
      })
      return
    }

    try {
      console.log('Starting new bucket creation for user:', user.id)
      
      // First get the max bucket_id from the allocations table
      const { data: maxBucketIdResult } = await supabase
        .from('allocations')
        .select('bucket_id')
        .order('bucket_id', { ascending: false })
        .limit(1)
        .single()

      const newBucketId = (maxBucketIdResult?.bucket_id || 0) + 1
      console.log('Generated new bucket_id:', newBucketId)

      // Then get the max id
      const { data: maxIdResult } = await supabase
        .from('allocations')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .single()

      const newId = (maxIdResult?.id || 0) + 1
      console.log('Generated new id:', newId)
      
      const { error } = await supabase
        .from('allocations')
        .insert({
          id: newId,
          profile_id: user.id,
          bucket_id: newBucketId,
          row_type: 'parent',
          bucket: 'New bucket'
        })

      if (error) {
        console.error('Error creating new bucket:', error)
        toast({
          title: "Error",
          description: "Failed to create new bucket",
          variant: "destructive"
        })
        return
      }

      console.log('Successfully created new bucket')
      queryClient.invalidateQueries({ queryKey: ['allocations'] })
      
      toast({
        title: "Success",
        description: "New bucket created successfully"
      })
    } catch (error) {
      console.error('Error in handleNewBucket:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    }
  }

  return (
    <Button onClick={handleNewBucket}>Add Bucket</Button>
  )
}