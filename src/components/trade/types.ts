export interface TradeData {
  id: number
  ticker: string
  date_entry: string | null
  date_exit: string | null
  commission: number | null
  pnl: number | null
  roi: number | null
  roi_yearly: number | null
  roi_portfolio: number | null
  be_0: number | null
  be_1: number | null
  be_2: number | null
  notes: string | null
  trade_status: "open" | "closed"
  row_type: "parent" | "child"
  trade_id?: number
  vehicle?: string
  order?: string
  qty?: number
  date_expiration?: string
  days_in_trade?: number
  strike_start?: number
  strike_end?: number
  premium?: number
  stock_price?: number
  risk_?: number
  risk_$?: number
  delta?: number
  iv?: number
  iv_percentile?: number
  subRows?: TradeData[]
}

export interface FormValues {
  ticker: string
  date_entry: Date | null
  date_exit: Date | null
  commission: number | null
  pnl: number | null
  roi: number | null
  roi_yearly: number | null
  roi_portfolio: number | null
  be_0: number | null
  be_1: number | null
  be_2: number | null
  notes: string | null
  trade_status: "open" | "closed"
}