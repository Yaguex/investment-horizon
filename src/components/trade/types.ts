export interface TradeData {
  id: number
  trade_id: number
  row_type: 'parent' | 'child'
  trade_status: 'open' | 'closed'
  ticker: string
  vehicle: string
  order: string
  qty: number
  date_entry: string
  date_expiration: string
  date_exit: string
  days_in_trade: number
  strike_start: number
  strike_end: number
  premium: number
  stock_price: number
  "risk_%": number
  "risk_$": number
  commission: number
  pnl: number
  roi: number
  roi_yearly: number
  roi_portfolio: number
  be_0: number
  be_1: number
  be_2: number
  delta: number
  iv: number
  iv_percentile: number
  notes: string
}