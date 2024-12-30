export interface SeriesData {
  id: string;
  description: string;
}

export interface FredObservation {
  date: string;
  value: string;
}

export interface FredResponse {
  observations: FredObservation[];
}

export interface MacroDataRecord {
  series_id: string;
  series_id_description: string;
  date: string;
  value: number;
  last_update: string;
}