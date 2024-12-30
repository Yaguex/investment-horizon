export interface FredResponse {
  realtime_start: string;
  realtime_end: string;
  observation_start: string;
  observation_end: string;
  units: string;
  output_type: number;
  file_type: string;
  order_by: string;
  sort_order: string;
  count: number;
  offset: number;
  limit: number;
  observations: Array<{
    realtime_start: string;
    realtime_end: string;
    date: string;
    value: string;
  }>;
}

export const SERIES_IDS = [
  { id: 'FEDFUNDS', description: 'Fed Funds' },
  { id: 'GFDEGDQ188S', description: 'Debt to GDP' },
  { id: 'FYFSGDA188S', description: 'Deficit to GDP' },
  { id: 'WALCL', description: "Fed's balance sheet" },
  { id: 'TOTRESNS', description: 'Reserves at Fed' },
  { id: 'RRPONTSYD', description: 'Fed at Repo' },
  { id: 'WTREGEN', description: 'TGA' },
  { id: 'CPIAUCSL', description: 'CPI' },
  { id: 'CPILFESL', description: 'CPI core' },
  { id: 'PCEPI', description: 'PCE' },
  { id: 'PCEPILFE', description: 'PCE core' },
  { id: 'PPIFIS', description: 'PPI' },
  { id: 'PAYEMS', description: 'Non-Farm Payrolls' },
  { id: 'UNRATE', description: 'Unemployment' },
  { id: 'CES0500000003', description: 'Hourly earnings' },
  { id: 'GDPC1', description: 'GDP' },
  { id: 'INDPRO', description: 'Industrial Production' },
  { id: 'CP', description: 'Corporate profits' },
  { id: 'DGORDER', description: 'Durable goods' },
  { id: 'MRTSSM44000USS', description: 'Retail sales' },
  { id: 'UMCSENT', description: 'Consumer sentiment' },
  { id: 'PCE', description: 'Personal consumption' },
  { id: 'HSN1F', description: 'New home sales' },
  { id: 'EXSFHSUSM495S', description: 'Existing home sales' },
  { id: 'PERMIT', description: 'Building permits' },
  { id: 'HOUST', description: 'Housing starts' },
  { id: 'BAMLH0A0HYM2', description: 'High Yield spread' },
  { id: 'BAMLC0A0CM', description: 'Investment Grade spread' },
  { id: 'T10YIE', description: '10yr breakeven inflation' },
  { id: 'MORTGAGE30US', description: 'Mortgage rate' },
  { id: 'VIXCLS', description: 'VIX' },
  { id: 'T10Y2Y', description: '10yr - 2yr' },
  { id: 'T10Y3M', description: '10yr - 3mo' },
  { id: 'MSPUS', description: 'Median home price' }
];