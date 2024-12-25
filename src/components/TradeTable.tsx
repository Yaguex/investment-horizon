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
import { TableRow as TradeTableRow } from "./trade/TableRow"
import { TradeData } from "./trade/types"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"

interface TradeTableProps {
  tradeStatus: "open" | "closed"
}

const TradeTable = ({ tradeStatus }: TradeTableProps) => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  const { user } = useAuth()

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const { data: trades = [], isLoading } = useQuery({
    queryKey: ['trades', tradeStatus, user?.id],
    queryFn: async () => {
      console.log('Starting trade fetch with params:', { tradeStatus, userId: user?.id })
      
      if (!user) {
        console.error('No user found')
        throw new Error('User not authenticated')
      }

      // Cast the user.id to UUID type in the query
      const { data, error } = await supabase
        .from('trade_log')
        .select('*')
        .eq('profile_id', user.id)
        .eq('trade_status', tradeStatus)
        .order('date_entry', { ascending: false })
      
      if (error) {
        console.error('Error fetching trades:', error)
        throw error
      }
      
      console.log('Raw trades data:', data)
      
      if (!data || data.length === 0) {
        console.log('No trades found for user')
        return []
      }
      
      // Group trades by trade_id
      const groupedTrades: Record<number, any[]> = {}
      data.forEach((trade) => {
        if (!groupedTrades[trade.trade_id]) {
          groupedTrades[trade.trade_id] = []
        }
        // Validate row_type before adding to grouped trades
        if (trade.row_type === 'parent' || trade.row_type === 'child') {
          groupedTrades[trade.trade_id].push(trade)
        } else {
          console.error('Invalid row_type found:', trade.row_type, 'for trade:', trade)
        }
      })
      
      console.log('Grouped trades:', groupedTrades)
      
      // Process each group to create parent-child structure
      const processedTrades = Object.values(groupedTrades).map(group => {
        const parent = group.find(trade => trade.row_type === 'parent')
        const children = group.filter(trade => trade.row_type === 'child')
        
        if (!parent) {
          console.error('No parent found for trade group:', group)
          return null
        }
        
        return {
          ...parent,
          row_type: parent.row_type as "parent",
          subRows: children.map(child => ({
            ...child,
            row_type: child.row_type as "child"
          }))
        } as TradeData
      }).filter(Boolean) as TradeData[]
      
      console.log('Final processed trades:', processedTrades)
      return processedTrades
    },
    enabled: !!user
  })

  if (isLoading) {
    return (
      <Card className="mt-6">
        <CardContent className="p-6">
          Loading trades...
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mt-6">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Actions</TableHead>
                <TableHead>Ticker</TableHead>
                <TableHead className="min-w-[140px]">Vehicle</TableHead>
                <TableHead className="min-w-[140px]">Order</TableHead>
                <TableHead>QTY</TableHead>
                <TableHead className="min-w-[140px]">Date Entry</TableHead>
                <TableHead className="min-w-[140px]">Date Expiration</TableHead>
                <TableHead className="min-w-[140px]">Date Exit</TableHead>
                <TableHead className="min-w-[140px]">Days in Trade</TableHead>
                <TableHead>Strike Start</TableHead>
                <TableHead>Strike End</TableHead>
                <TableHead>Premium</TableHead>
                <TableHead>Stock Price</TableHead>
                <TableHead className="min-w-[100px]">Risk %</TableHead>
                <TableHead className="min-w-[100px]">Risk $</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>PnL</TableHead>
                <TableHead>ROI</TableHead>
                <TableHead>Yearly ROI</TableHead>
                <TableHead>ROI Portfolio</TableHead>
                <TableHead className="min-w-[120px]">B/E 0</TableHead>
                <TableHead className="min-w-[120px]">B/E 1</TableHead>
                <TableHead className="min-w-[120px]">B/E 2</TableHead>
                <TableHead>Delta</TableHead>
                <TableHead>IV</TableHead>
                <TableHead>IV Percentile</TableHead>
                <TableHead className="min-w-[400px]">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades.map((trade) => (
                <>
                  <TradeTableRow 
                    key={trade.id}
                    row={trade}
                    isExpanded={expandedRows[trade.id]}
                    onToggle={() => toggleRow(trade.id.toString())}
                    tradeStatus={tradeStatus}
                  />
                  {expandedRows[trade.id] && trade.subRows?.map((subRow) => (
                    <TradeTableRow 
                      key={subRow.id}
                      row={subRow}
                      isExpanded={false}
                      isSubRow={true}
                      onToggle={() => {}}
                      tradeStatus={tradeStatus}
                    />
                  ))}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export default TradeTable