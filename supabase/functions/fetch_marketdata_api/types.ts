export interface MarketData {
  mid: number;
  openInterest: number;
  iv: number;
  delta: number;
  intrinsicValue: number;
  extrinsicValue: number;
  underlyingPrice: number;
}

export interface StrikeRequest {
  ticker: string;
  expiration: string;
  type: 'call' | 'put';
  strike: number;
}

export interface StrikeResponse {
  symbol: string;
  marketData: MarketData | null;
}