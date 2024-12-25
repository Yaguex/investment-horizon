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
      console.log('Fetching trades with status:', tradeStatus)
      
      if (!user) throw new Error('User not authenticated')
      
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
      
      console.log('Fetched trades:', data)
      
      // Group trades by trade_id
      const groupedTrades: Record<number, TradeData[]> = {}
      data?.forEach((trade: TradeData) => {
        if (!groupedTrades[trade.trade_id]) {
          groupedTrades[trade.trade_id] = []
        }
        groupedTrades[trade.trade_id].push(trade)
      })
      
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
          subRows: children
        }
      }).filter(Boolean)
      
      console.log('Processed trades:', processedTrades)
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
                <TableHead>Vehicle</TableHead>
                <TableHead>Order</TableHead>
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
                    row={{
                      ...trade,
                      riskPercentage: trade["risk_%"],
                      riskDollars: trade["risk_$"],
                      be0: trade.be_0,
                      be1: trade.be_1,
                      be2: trade.be_2,
                      dateEntry: trade.date_entry,
                      dateExpiration: trade.date_expiration,
                      dateExit: trade.date_exit,
                      daysInTrade: trade.days_in_trade,
                      stockPrice: trade.stock_price,
                      strikeStart: trade.strike_start,
                      strikeEnd: trade.strike_end,
                      roiYearly: trade.roi_yearly,
                      roiPortfolio: trade.roi_portfolio,
                      ivPercentile: trade.iv_percentile
                    }}
                    isExpanded={expandedRows[trade.id]}
                    onToggle={() => toggleRow(trade.id.toString())}
                  />
                  {expandedRows[trade.id] && trade.subRows?.map((subRow) => (
                    <TradeTableRow 
                      key={subRow.id}
                      row={{
                        ...subRow,
                        riskPercentage: subRow["risk_%"],
                        riskDollars: subRow["risk_$"],
                        be0: subRow.be_0,
                        be1: subRow.be_1,
                        be2: subRow.be_2,
                        dateEntry: subRow.date_entry,
                        dateExpiration: subRow.date_expiration,
                        dateExit: subRow.date_exit,
                        daysInTrade: subRow.days_in_trade,
                        stockPrice: subRow.stock_price,
                        strikeStart: subRow.strike_start,
                        strikeEnd: subRow.strike_end,
                        roiYearly: subRow.roi_yearly,
                        roiPortfolio: subRow.roi_portfolio,
                        ivPercentile: subRow.iv_percentile
                      }}
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
  )
}

export default TradeTable