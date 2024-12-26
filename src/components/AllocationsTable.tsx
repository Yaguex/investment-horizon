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

const AllocationsTable = () => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  const { data: allocations, isLoading } = useQuery({
    queryKey: ['allocations'],
    queryFn: async () => {
      console.log('Fetching allocations...')
      const { data, error } = await supabase
        .from('allocations')
        .select('*')
        .order('bucket', { ascending: true })
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

      // Process data to create parent-child relationships
      const processedData = data.reduce((acc: Allocation[], curr) => {
        if (curr.row_type === 'parent') {
          const allocation: Allocation = {
            ...curr,
            row_type: curr.row_type as "parent" | "child",
            subRows: data
              .filter(row => row.row_type === 'child' && row.bucket === curr.bucket)
              .map(row => ({
                ...row,
                row_type: row.row_type as "parent" | "child"
              }))
          }
          acc.push(allocation)
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
      <Card className="mt-6">
        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-white">
                  <TableHead className="sticky left-0 z-20 w-[100px] bg-white after:absolute after:right-0 after:top-0 after:h-full after:w-px after:bg-border">Actions</TableHead>
                  <TableHead className="sticky left-[100px] z-20 min-w-[200px] bg-white after:absolute after:right-0 after:top-0 after:h-full after:w-px after:bg-border">Bucket</TableHead>
                  <TableHead className="min-w-[140px]">Ticker</TableHead>
                  <TableHead className="min-w-[140px]">Vehicle</TableHead>
                  <TableHead>Weight target</TableHead>
                  <TableHead className="min-w-[140px]">Value target</TableHead>
                  <TableHead className="min-w-[140px]">Weight actual</TableHead>
                  <TableHead className="min-w-[140px]">Value actual</TableHead>
                  <TableHead className="min-w-[140px]">Delta</TableHead>
                  <TableHead>Risk profile</TableHead>
                  <TableHead>Dividend %</TableHead>
                  <TableHead>Dividend $</TableHead>
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
  )
}

export default AllocationsTable