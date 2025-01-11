import { format } from "date-fns"
import { supabase } from "@/integrations/supabase/client"
import { FormValues, PositionFormValues } from "../types"
import { QueryClient } from "@tanstack/react-query"

export const calculateDaysInTrade = (dateEntry: Date | null, dateExit: Date | null): number | null => {
  if (!dateEntry || !dateExit) return null
  const diffTime = Math.abs(dateExit.getTime() - dateEntry.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export const calculateYearlyROI = (roi: number | null, daysInTrade: number): number => {
  if (!roi || daysInTrade === 0) return 0
  return Number(((roi / daysInTrade) * 365).toFixed(2))
}

const calculateRiskPercentage = async (values: FormValues): Promise<number | null> => {
  console.log('Calculating risk percentage with values:', values)
  
  // Get latest portfolio balance
  const { data: portfolioData, error: portfolioError } = await supabase
    .from('portfolio_data')
    .select('balance')
    .order('month', { ascending: false })
    .limit(1)

  if (portfolioError) {
    console.error('Error fetching portfolio balance:', portfolioError)
    return null
  }

  const latestBalance = portfolioData?.[0]?.balance
  if (!latestBalance || latestBalance <= 0) {
    console.log('No valid portfolio balance found')
    return null
  }

  const { vehicle, qty, stock_price, strike_start, strike_end, premium } = values
  
  // Check if we have qty as it's required for all calculations
  if (!qty) {
    console.log('Missing qty, cannot calculate risk %')
    return null
  }

  let riskPercentage: number | null = null

  // Stock or Fund calculation
  if (vehicle === 'Stock' || vehicle === 'Fund') {
    if (!stock_price) {
      console.log('Missing stock price for Stock/Fund calculation')
      return null
    }
    riskPercentage = Math.abs((qty * stock_price) / latestBalance * 100)
  } 
  // Sell options and Exercise calculation
  else if (['Sell call', 'Sell put', 'Sell call spread', 'Sell put spread', 'Exercise'].includes(vehicle)) {
    if (!strike_start) {
      console.log('Missing strike_start for sell options calculation')
      return null
    }
    riskPercentage = Math.abs((qty * (strike_start - (strike_end || 0)) * 100) / latestBalance * 100)
  }
  // Buy options and Roll over calculation
  else if (['Buy call', 'Buy put', 'Buy call spread', 'Buy put spread', 'Roll over'].includes(vehicle)) {
    if (!premium) {
      console.log('Missing premium for buy options calculation')
      return null
    }
    riskPercentage = Math.abs((qty * premium * 100) / latestBalance * 100)
  }

  console.log('Calculated risk percentage:', riskPercentage)
  return riskPercentage ? Number(riskPercentage.toFixed(2)) : null
}

export const invalidateTradeMetrics = async (queryClient: QueryClient) => {
  console.log('Invalidating trade metrics caches')
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['trades'] }),
    queryClient.invalidateQueries({ queryKey: ['tradeMetrics'] })
  ])
}

export const recalculateParentRowMetrics = async (
  values: PositionFormValues,
  trade: any,
  queryClient: QueryClient
): Promise<{
  daysInTrade: number
  yearlyRoi: number
}> => {
  console.log('Starting parent row metrics recalculation for trade:', trade.id)
  
  // Calculate days in trade
  const daysInTrade = calculateDaysInTrade(values.date_entry, values.date_exit)
  console.log('Calculated days in trade:', daysInTrade)
  
  // Calculate yearly ROI
  const yearlyRoi = calculateYearlyROI(values.roi, daysInTrade || 0)
  console.log('Calculated yearly ROI:', yearlyRoi)
  
  await invalidateTradeMetrics(queryClient)
  
  return {
    daysInTrade: daysInTrade || 0,
    yearlyRoi
  }
}

export const recalculateChildMetrics = async (
  values: FormValues,
  tradeId: number,
  currentTradeId: number,
  dateEntry: Date | null,
  dateExit: Date | null,
  queryClient: QueryClient
): Promise<{
  daysInTrade: number | null
  riskPercentage: number | null
  roi: number
  roiYearly: number
  roiPortfolio: number
}> => {
  console.log('Starting child metrics recalculation for trade:', tradeId)
  
  // Calculate days in trade
  const daysInTrade = calculateDaysInTrade(dateEntry, dateExit)
  console.log('Calculated days in trade:', daysInTrade)

  // Calculate risk percentage
  const riskPercentage = await calculateRiskPercentage(values)
  console.log('Calculated risk percentage:', riskPercentage)

  // Get latest portfolio balance for ROI Portfolio calculation
  const { data: portfolioData, error: portfolioError } = await supabase
    .from('portfolio_data')
    .select('balance')
    .order('month', { ascending: false })
    .limit(1)

  if (portfolioError) {
    console.error('Error fetching portfolio balance:', portfolioError)
    throw portfolioError
  }

  const latestBalance = portfolioData?.[0]?.balance || 0
  console.log('Latest portfolio balance:', latestBalance)

  // Get all sibling rows to calculate ROI
  const { data: siblingRows, error: siblingError } = await supabase
    .from('trade_log')
    .select('id, pnl')
    .eq('trade_id', tradeId)
    .eq('row_type', 'child')

  if (siblingError) {
    console.error('Error fetching sibling rows:', siblingError)
    throw siblingError
  }

  // Calculate sum of negative PnLs
  const sumNegativePnl = siblingRows.reduce((sum, row) => {
    const pnl = row.pnl || 0
    return sum + (pnl < 0 ? Math.abs(pnl) : 0)
  }, 0)

  console.log('Sum of negative PnLs:', sumNegativePnl)

  // Calculate ROI
  const roi = sumNegativePnl === 0 ? 0 : Number(((values.pnl || 0) / sumNegativePnl * 100).toFixed(2))
  const roiYearly = calculateYearlyROI(roi, daysInTrade || 0)
  
  // Calculate ROI Portfolio
  const pnl = values.pnl || 0
  const roiPortfolio = latestBalance > 0 ? Number(((pnl / latestBalance) * 100).toFixed(2)) : 0

  console.log('Calculated ROI metrics:', { roi, roiYearly, roiPortfolio })

  await invalidateTradeMetrics(queryClient)

  return {
    daysInTrade,
    riskPercentage,
    roi,
    roiYearly,
    roiPortfolio
  }
}

export const recalculateSiblingMetrics = async (
  tradeId: number,
  currentTradeId: number,
  pnl: number | null,
  queryClient: QueryClient
): Promise<{
  siblingRoi: number
  siblingYearlyRoi: number
}[]> => {
  console.log('Starting sibling metrics recalculation for trade:', tradeId)
  
  // Get all sibling rows
  const { data: siblingRows, error: siblingError } = await supabase
    .from('trade_log')
    .select('id, pnl, date_entry, date_exit')
    .eq('trade_id', tradeId)
    .eq('row_type', 'child')
  
  if (siblingError) {
    console.error('Error fetching sibling rows:', siblingError)
    throw siblingError
  }
  
  // Calculate sum of negative PnLs including the current trade's PnL
  const sumNegativePnl = siblingRows.reduce((sum, row) => {
    const tradePnl = row.id === currentTradeId ? (pnl || 0) : (row.pnl || 0)
    return sum + (tradePnl < 0 ? Math.abs(tradePnl) : 0)
  }, 0)
  
  console.log('Sum of negative PnLs:', sumNegativePnl)
  
  // Calculate metrics for each sibling
  const siblingMetrics = siblingRows.map(sibling => {
    const siblingPnl = sibling.id === currentTradeId ? (pnl || 0) : (sibling.pnl || 0)
    const siblingRoi = sumNegativePnl === 0 ? 0 : Number(((siblingPnl / sumNegativePnl) * 100).toFixed(2))
    
    const daysInTrade = calculateDaysInTrade(
      sibling.date_entry ? new Date(sibling.date_entry) : null,
      sibling.date_exit ? new Date(sibling.date_exit) : null
    )
    
    const siblingYearlyRoi = calculateYearlyROI(siblingRoi, daysInTrade || 0)
    
    return {
      siblingRoi,
      siblingYearlyRoi
    }
  })
  
  console.log('Calculated sibling metrics:', siblingMetrics)

  await invalidateTradeMetrics(queryClient)

  return siblingMetrics
}

export const recalculateParentMetrics = async (
  tradeId: number,
  oldestDateEntry: string | null,
  queryClient: QueryClient
): Promise<{
  totalCommission: number
  totalPnl: number
  parentRoi: number
  parentYearlyRoi: number
  parentRoiPortfolio: number
  dateExit: string | null
  daysInTrade: number | null
  oldestDateEntry: string | null
}> => {
  console.log('Starting parent metrics recalculation for trade:', tradeId)
  
  // Get all child rows
  const { data: childRows, error: childError } = await supabase
    .from('trade_log')
    .select('commission, pnl, date_exit, date_entry')
    .eq('trade_id', tradeId)
    .eq('row_type', 'child')
  
  if (childError) {
    console.error('Error fetching child rows:', childError)
    throw childError
  }
  
  // Calculate totals
  const totalCommission = childRows?.reduce((sum, row) => sum + (row.commission || 0), 0) || 0
  const totalPnl = childRows?.reduce((sum, row) => sum + (row.pnl || 0), 0) || 0
  
  // Calculate sum of negative PnLs for ROI calculation
  const sumNegativePnl = childRows?.reduce((sum, row) => {
    const pnl = row.pnl || 0
    return sum + (pnl < 0 ? Math.abs(pnl) : 0)
  }, 0) || 0
  
  // Get latest portfolio balance
  const { data: portfolioData, error: portfolioError } = await supabase
    .from('portfolio_data')
    .select('balance')
    .order('month', { ascending: false })
    .limit(1)
  
  if (portfolioError) {
    console.error('Error fetching portfolio balance:', portfolioError)
    throw portfolioError
  }
  
  const latestBalance = portfolioData?.[0]?.balance || 0

  // Find oldest date_entry from child rows
  const oldestDate = childRows
    .reduce((oldest, row) => {
      if (!row.date_entry) return oldest
      if (!oldest) return row.date_entry
      return row.date_entry < oldest ? row.date_entry : oldest
    }, null as string | null)
  
  // Find latest date_exit among child rows that have a date_exit
  const dateExit = childRows
    .reduce((latest, row) => {
      if (!row.date_exit) return latest
      if (!latest) return row.date_exit
      return row.date_exit > latest ? row.date_exit : latest
    }, null as string | null)
  
  // Calculate days in trade
  const daysInTrade = oldestDate && dateExit
    ? calculateDaysInTrade(new Date(oldestDate), new Date(dateExit))
    : null
  
  // Calculate ROIs
  const parentRoi = sumNegativePnl === 0 ? 0 : Number(((totalPnl / sumNegativePnl) * 100).toFixed(2))
  const parentYearlyRoi = calculateYearlyROI(parentRoi, daysInTrade || 0)
  const parentRoiPortfolio = latestBalance > 0 ? Number(((totalPnl / latestBalance) * 100).toFixed(2)) : 0
  
  console.log('Calculated parent metrics:', {
    totalCommission,
    totalPnl,
    parentRoi,
    parentYearlyRoi,
    parentRoiPortfolio,
    dateExit,
    daysInTrade,
    oldestDateEntry: oldestDate
  })
  
  await invalidateTradeMetrics(queryClient)

  return {
    totalCommission,
    totalPnl,
    parentRoi,
    parentYearlyRoi,
    parentRoiPortfolio,
    dateExit,
    daysInTrade,
    oldestDateEntry: oldestDate
  }
}
