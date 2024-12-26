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
import { Button } from "@/components/ui/button"
import { ArrowUp, Plus, Edit, X } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface AllocationRow {
  id: number
  type: 'parent' | 'child'
  bucket: string
  ticker: string
  vehicle: string
  weightTarget: number
  valueTarget: number
  weightActual: number
  valueActual: number
  delta: number
  riskProfile: string
  dividendPercentage: number
  dividendAmount: number
  parentId?: number
}

const generateDummyData = (): AllocationRow[] => {
  const data: AllocationRow[] = []
  let id = 1

  // Generate 8 parent rows
  for (let i = 1; i <= 8; i++) {
    // Add parent row
    data.push({
      id: id++,
      type: 'parent',
      bucket: `Bucket ${i}`,
      ticker: '',
      vehicle: '',
      weightTarget: Math.round(Math.random() * 100),
      valueTarget: Math.round(Math.random() * 10000),
      weightActual: Math.round(Math.random() * 100),
      valueActual: Math.round(Math.random() * 10000),
      delta: Math.round((Math.random() - 0.5) * 1000),
      riskProfile: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
      dividendPercentage: Math.round(Math.random() * 10 * 100) / 100,
      dividendAmount: Math.round(Math.random() * 1000),
    })

    // Add 3 child rows for each parent
    for (let j = 1; j <= 3; j++) {
      data.push({
        id: id++,
        type: 'child',
        parentId: id - j - 2,
        bucket: `Bucket ${i}`,
        ticker: `TICKER${i}${j}`,
        vehicle: ['Stock', 'ETF', 'Option'][Math.floor(Math.random() * 3)],
        weightTarget: Math.round(Math.random() * 100),
        valueTarget: Math.round(Math.random() * 10000),
        weightActual: Math.round(Math.random() * 100),
        valueActual: Math.round(Math.random() * 10000),
        delta: Math.round((Math.random() - 0.5) * 1000),
        riskProfile: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
        dividendPercentage: Math.round(Math.random() * 10 * 100) / 100,
        dividendAmount: Math.round(Math.random() * 1000),
      })
    }
  }

  return data
}

const AllocationsTable = () => {
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({})
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
                  <TableHead className="w-[100px]">Actions</TableHead>
                  <TableHead>Bucket</TableHead>
                  <TableHead>Ticker</TableHead>
                  <TableHead>Vehicle</TableHead>
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
                        <TableRow key={row.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleRow(row.id)}
                              >
                                <ArrowUp className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </Button>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Add ticker</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit bucket</TooltipContent>
                              </Tooltip>
                            </div>
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
                          <TableRow key={childRow.id}>
                            <TableCell>
                              <div className="flex items-center gap-2 ml-8">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete ticker</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Edit ticker</TooltipContent>
                                </Tooltip>
                              </div>
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