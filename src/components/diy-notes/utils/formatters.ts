export const formatDate = (dateString?: string | Date | null) => {
  if (!dateString) return ""
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  return date.toLocaleDateString('en-GB', {
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