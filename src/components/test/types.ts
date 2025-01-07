export interface MarketData {
  ask: number;
  bid: number;
  mid: number;
  last: number;
  volume: number;
  openInterest: number;
  iv: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
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