export interface Allocation {
  id: number
  profile_id?: string
  portfolio_id?: number
  bucket?: string
  bucket_id?: number
  vehicle?: string
  weight_target?: number
  value_target?: number
  weight_actual?: number
  value_actual?: number
  delta?: number
  risk_profile?: string
  "dividend_%"?: number
  "dividend_$"?: number
  row_type?: "parent" | "child"
  subRows?: Allocation[]
}