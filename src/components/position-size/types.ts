export interface PositionSizeFormValues {
  ticker: string
  exposure: number | null
  expiration: string
  risk_free_yield: number | null
  strike_entry: number | null
  strike_exit: number | null
  action: string
}