export interface MarketData {
  mid: number;
  openInterest: number;
  iv: number;
  delta: number;
  intrinsicValue: number;
  extrinsicValue: number;
  underlyingPrice: number;
}

export interface StrikeData {
  symbol: string;
  marketData: MarketData | null;
}

export interface RequestBody {
  ticker: string;
  expiration: string;
  strikes: {
    entry: number;
    target: number;
    protection: number;
  };
  profile_id: string;
}