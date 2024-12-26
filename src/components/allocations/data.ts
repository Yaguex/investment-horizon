export interface AllocationRow {
  id: number
  type: 'parent' | 'child'
  bucket: string
  ticker: string
  vehicle: string
  weightTarget: number
  valueTarget: number
  weightActual: number
  valueActual: number
  delta: number
  riskProfile: string
  dividendPercentage: number
  dividendAmount: number
  parentId?: number
}

export const generateDummyData = (): AllocationRow[] => {
  const data: AllocationRow[] = []
  let id = 1

  // Generate 8 parent rows
  for (let i = 1; i <= 8; i++) {
    const parentId = id
    
    // Add parent row
    data.push({
      id: parentId,
      type: 'parent',
      bucket: `Bucket ${i}`,
      ticker: '',
      vehicle: '',
      weightTarget: Math.round(Math.random() * 100),
      valueTarget: Math.round(Math.random() * 10000),
      weightActual: Math.round(Math.random() * 100),
      valueActual: Math.round(Math.random() * 10000),
      delta: Math.round((Math.random() - 0.5) * 1000),
      riskProfile: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
      dividendPercentage: Math.round(Math.random() * 10 * 100) / 100,
      dividendAmount: Math.round(Math.random() * 1000),
    })
    id++

    // Add exactly 3 child rows for each parent
    for (let j = 1; j <= 3; j++) {
      data.push({
        id: id++,
        type: 'child',
        parentId: parentId,
        bucket: `Bucket ${i}`,
        ticker: `TICKER${i}${j}`,
        vehicle: ['Stock', 'ETF', 'Option'][Math.floor(Math.random() * 3)],
        weightTarget: Math.round(Math.random() * 100),
        valueTarget: Math.round(Math.random() * 10000),
        weightActual: Math.round(Math.random() * 100),
        valueActual: Math.round(Math.random() * 10000),
        delta: Math.round((Math.random() - 0.5) * 1000),
        riskProfile: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
        dividendPercentage: Math.round(Math.random() * 10 * 100) / 100,
        dividendAmount: Math.round(Math.random() * 1000),
      })
    }
  }

  return data
}