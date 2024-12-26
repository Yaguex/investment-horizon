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
import { TooltipProvider } from "@/components/ui/tooltip"
import { TableActions } from "./allocations/TableActions"
import { getRowBackground } from "./allocations/styles"
import { AllocationRow, generateDummyData } from "./allocations/data"

const AllocationsTable = () => {
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>(() => {
    // Initialize all rows as expanded
    const expanded: Record<number, boolean> = {}
    generateDummyData().forEach(row => {
      if (row.type === 'parent') {
        expanded[row.id] = true
      }
    })
    return expanded
  })
  
  const [data] = useState<AllocationRow[]>(generateDummyData())

  const toggleRow = (id: number) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const formatNumber = (value: number, decimals: number = 0) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${formatNumber(value, 2)}%`
  }

  return (
    <TooltipProvider>
      <Card>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 z-20 w-[100px] bg-white after:absolute after:right-0 after:top-0 after:h-full after:w-px after:bg-border">Actions</TableHead>
                  <TableHead className="min-w-[200px]">Bucket</TableHead>
                  <TableHead>Ticker</TableHead>
                  <TableHead className="min-w-[180px]">Vehicle</TableHead>
                  <TableHead>Weight target</TableHead>
                  <TableHead>Value target</TableHead>
                  <TableHead>Weight actual</TableHead>
                  <TableHead>Value actual</TableHead>
                  <TableHead>Delta</TableHead>
                  <TableHead>Risk profile</TableHead>
                  <TableHead>Dividend %</TableHead>
                  <TableHead>Dividend $</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => {
                  if (row.type === 'parent') {
                    const childRows = data.filter(r => r.parentId === row.id)
                    const isExpanded = expandedRows[row.id]

                    return (
                      <>
                        <TableRow key={row.id} className={getRowBackground(false)}>
                          <TableCell className="sticky left-0 z-10 w-[100px] bg-yellow-50">
                            <TableActions 
                              isExpanded={isExpanded}
                              onToggle={() => toggleRow(row.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{row.bucket}</TableCell>
                          <TableCell>{row.ticker}</TableCell>
                          <TableCell>{row.vehicle}</TableCell>
                          <TableCell>{formatPercentage(row.weightTarget)}</TableCell>
                          <TableCell>{formatCurrency(row.valueTarget)}</TableCell>
                          <TableCell>{formatPercentage(row.weightActual)}</TableCell>
                          <TableCell>{formatCurrency(row.valueActual)}</TableCell>
                          <TableCell>{formatCurrency(row.delta)}</TableCell>
                          <TableCell>{row.riskProfile}</TableCell>
                          <TableCell>{formatPercentage(row.dividendPercentage)}</TableCell>
                          <TableCell>{formatCurrency(row.dividendAmount)}</TableCell>
                        </TableRow>
                        {isExpanded && childRows.map((childRow) => (
                          <TableRow key={childRow.id} className={getRowBackground(true)}>
                            <TableCell className="sticky left-0 z-10 w-[100px] bg-white">
                              <TableActions isChild />
                            </TableCell>
                            <TableCell>{childRow.bucket}</TableCell>
                            <TableCell className="font-medium">{childRow.ticker}</TableCell>
                            <TableCell>{childRow.vehicle}</TableCell>
                            <TableCell>{formatPercentage(childRow.weightTarget)}</TableCell>
                            <TableCell>{formatCurrency(childRow.valueTarget)}</TableCell>
                            <TableCell>{formatPercentage(childRow.weightActual)}</TableCell>
                            <TableCell>{formatCurrency(childRow.valueActual)}</TableCell>
                            <TableCell>{formatCurrency(childRow.delta)}</TableCell>
                            <TableCell>{childRow.riskProfile}</TableCell>
                            <TableCell>{formatPercentage(childRow.dividendPercentage)}</TableCell>
                            <TableCell>{formatCurrency(childRow.dividendAmount)}</TableCell>
                          </TableRow>
                        ))}
                      </>
                    )
                  }
                  return null
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

export default AllocationsTable