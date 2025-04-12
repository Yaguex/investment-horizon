
export interface MarketData {
  mid: number | null;
  ask: number | null;
  openInterest: number | null;
  bid: number | null;
  iv: number | null;
  delta: number | null;
  last: number | null;
  intrinsicValue: number | null;
  volume: number | null;
  extrinsicValue: number | null;
  underlyingPrice: number | null;
  gamma: number | null;
  theta: number | null;
  vega: number | null;
  rho: number | null;
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
  error?: APIError;
}

export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  API_ERROR = 'API_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}

export interface APIError {
  type: ErrorType;
  status?: number;
  message: string;
  retryable: boolean;
}
