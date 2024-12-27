export interface BucketFormValues {
  bucket: string
}

export interface AllocationTradeFormValues {
  bucket: string
  vehicle: string
  value_actual: number
  weight_target: number
  risk_profile: string
  "dividend_%": number
}

export type FormValues = BucketFormValues | AllocationTradeFormValues