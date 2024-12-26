export interface TradeData {
  id: number
  profile_id?: string
  ticker: string
  // Trade-specific fields
  date_entry?: string | null
  date_exit?: string | null
  commission?: number | null
  pnl?: number | null
  roi?: number | null
  roi_yearly?: number | null
  roi_portfolio?: number | null
  be_0?: number | null
  be_1?: number | null
  be_2?: number | null
  notes: string | null
  trade_status: "open" | "closed"
  row_type: "parent" | "child"
  trade_id?: number
  vehicle?: string
  order?: string
  qty?: number
  date_expiration?: string | null
  days_in_trade?: number
  strike_start?: number
  strike_end?: number
  premium?: number
  stock_price?: number
  "risk_%"?: number
  "risk_$"?: number
  delta?: number
  iv?: number
  iv_percentile?: number
  // Allocation-specific fields
  bucket?: string
  weight_target?: number
  value_target?: number
  weight_actual?: number
  value_actual?: number
  risk_profile?: string
  "dividend_%"?: number
  "dividend_$"?: number
  subRows?: TradeData[]
}

export interface FormValues {
  ticker: string
  vehicle: string
  order: string
  qty: number | null
  date_entry: Date | null
  date_expiration: Date | null
  date_exit: Date | null
  days_in_trade: number | null
  strike_start: number | null
  strike_end: number | null
  premium: number | null
  stock_price: number | null
  "risk_%": number | null
  "risk_$": number | null
  commission: number | null
  pnl: number | null
  roi: number | null
  roi_yearly: number | null
  roi_portfolio: number | null
  be_0: number | null
  be_1: number | null
  be_2: number | null
  delta: number | null
  iv: number | null
  iv_percentile: number | null
  notes: string
  trade_status: "open" | "closed"
}