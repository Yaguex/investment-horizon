export const formatDate = (dateString?: string) => {
  if (!dateString) return ""
  return new Date(dateString).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

export const formatNumber = (value: number | undefined | null, decimals: number = 0) => {
  if (value === undefined || value === null) return ""
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value)
}