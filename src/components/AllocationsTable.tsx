import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { TableRow as AllocationTableRow } from "./allocations/TableRow"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Allocation } from "@/types/allocations"
import { useToast } from "@/components/ui/use-toast"
import AllocationWeightsCharts from "./allocations/AllocationWeightsCharts"

const AllocationsTable = () => {
  // Initialize all rows as expanded by default
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {}
    // We'll populate this in the useQuery's onSuccess callback
    return initialState
  })
  const { toast } = useToast()

  const { data: allocations, isLoading } = useQuery({
    queryKey: ['allocations'],
    queryFn: async () => {
      console.log('Fetching allocations...')
      const { data, error } = await supabase
        .from('allocations')
        .select('*')
        .order('bucket_id', { ascending: true })
        .order('row_type', { ascending: true })

      if (error) {
        console.error('Error fetching allocations:', error)
        toast({
          title: "Error",
          description: "Failed to load allocations",
          variant: "destructive",
        })
        throw error
      }

      // Process data to create parent-child relationships using bucket_id
      const processedData = data.reduce((acc: Allocation[], curr) => {
        if (curr.row_type === 'parent') {
          const allocation: Allocation = {
            ...curr,
            row_type: curr.row_type as "parent" | "child",
            subRows: data
              .filter(row => row.row_type === 'child' && row.bucket_id === curr.bucket_id)
              .map(row => ({
                ...row,
                row_type: row.row_type as "parent" | "child"
              }))
          }
          acc.push(allocation)
          // Set this row as expanded by default
          setExpandedRows(prev => ({
            ...prev,
            [allocation.id]: true
          }))
        }
        return acc
      }, [])

      console.log('Processed allocations:', processedData)
      return processedData
    }
  })

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  if (isLoading) {
    return <div className="mt-6 p-4">Loading allocations...</div>
  }

  return (
    <TooltipProvider>
      {allocations && <AllocationWeightsCharts data={allocations} />}
      <Card className="mt-6">
        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-white">
                  <TableHead className="sticky left-0 z-20 w-[100px] bg-white after:absolute after:right-0 after:top-0 after:h-full after:w-px after:bg-border">Actions</TableHead>
                  <TableHead className="sticky left-[100px] z-20 min-w-[200px] bg-white after:absolute after:right-0 after:top-0 after:h-full after:w-px after:bg-border">Bucket</TableHead>
                  <TableHead className="min-w-[120px]">Vehicle</TableHead>
                  <TableHead className="min-w-[140px]">Value target</TableHead>
                  <TableHead className="min-w-[140px]">Value actual</TableHead>
                  <TableHead className="min-w-[140px]">Weight target</TableHead>
                  <TableHead className="min-w-[140px]">Weight actual</TableHead>
                  <TableHead className="min-w-[100px]">Delta</TableHead>
                  <TableHead className="min-w-[160px]">Risk profile</TableHead>
                  <TableHead className="min-w-[140px]">Dividend %</TableHead>
                  <TableHead className="min-w-[160px]">Dividend $</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allocations?.map((allocation) => (
                  <>
                    <AllocationTableRow 
                      key={allocation.id}
                      row={allocation}
                      isExpanded={expandedRows[allocation.id]}
                      onToggle={() => toggleRow(allocation.id.toString())}
                    />
                    {expandedRows[allocation.id] && allocation.subRows?.map((subRow) => (
                      <AllocationTableRow 
                        key={subRow.id}
                        row={subRow}
                        isExpanded={false}
                        isSubRow={true}
                        onToggle={() => {}}
                      />
                    ))}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default AllocationsTable;