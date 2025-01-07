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
    entry: {
      strike: number;
      type: string;
    };
    target: {
      strike: number;
      type: string;
    };
    protection: {
      strike: number;
      type: string;
    };
  };
  profile_id: string;
}