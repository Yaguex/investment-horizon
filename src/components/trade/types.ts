export interface TradeData {
  id: number
  profile_id?: string
  ticker: string
  vehicle?: string
  bucket?: string
  trade_status: "open" | "closed"
  row_type: "parent" | "child"
  notes: string | null
  subRows?: TradeData[]
  // Adding allocation-specific fields
  weight_target?: number
  value_target?: number
  weight_actual?: number
  value_actual?: number
  delta?: number
  risk_profile?: string
  dividend_percentage?: number
  dividend_amount?: number
  // Adding trade-specific fields
  trade_id?: number
  order?: string
  qty?: number
  date_entry?: string | null
  date_expiration?: string | null
  date_exit?: string | null
  days_in_trade?: number
  strike_start?: number
  strike_end?: number
  premium?: number
  stock_price?: number
  "risk_%"?: number
  "risk_$"?: number
  commission?: number
  pnl?: number
  roi?: number
  roi_yearly?: number
  roi_portfolio?: number
  be_0?: number
  be_1?: number
  be_2?: number
  iv?: number
  iv_percentile?: number
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
  be_0: number | null
  be_1: number | null
  be_2: number | null
  delta: number | null
  iv: number | null
  iv_percentile: number | null
  notes: string
  trade_status: "open" | "closed"
}

export interface PositionFormValues {
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
  notes: string
  trade_status: "open" | "closed"
}