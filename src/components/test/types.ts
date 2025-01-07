export interface MarketData {
  mid: number;
  openInterest: number;
  iv: number;
  delta: number;
  intrinsicValue: number;
  extrinsicValue: number;
  underlyingPrice: number;
}

export interface StrikeResponse {
  symbol: string;
  marketData: MarketData | null;
}

export interface ApiResponse {
  responses: StrikeResponse[];
}