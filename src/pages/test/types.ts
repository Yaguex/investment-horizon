export interface TestFormValues {
  ticker: string
  expiration: string
  type: string
  strike_entry: number | null
  strike_target: number | null
  strike_protection: number | null
}

export interface MarketData {
  mid: number
  openInterest: number
  iv: number
  delta: number
  intrinsicValue: number
  extrinsicValue: number
}

export interface StrikeData {
  symbol: string
  marketData: MarketData | null
}

export interface ApiResponse {
  entry: StrikeData
  target: StrikeData
  protection: StrikeData
}