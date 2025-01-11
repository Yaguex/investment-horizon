import { supabase } from "@/integrations/supabase/client"
import { FormValues } from "../types"

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

export const recalculateChildMetrics = async (
  values: FormValues,
  tradeId: number,
  currentTradeId: number,
  dateEntry: Date | null,
  dateExit: Date | null
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

  // If we have a trade ID, get all sibling rows to calculate ROI
  let roi = 0
  let roiYearly = 0
  let roiPortfolio = 0

  if (tradeId) {
    // Get all sibling rows (including this one)
    const { data: siblingRows, error: siblingError } = await supabase
      .from('trade_log')
      .select('id, pnl')
      .eq('trade_id', tradeId)
      .eq('row_type', 'child')

    if (siblingError) {
      console.error('Error fetching sibling rows:', siblingError)
      throw siblingError
    }

    // Update current row's PnL in sibling rows for accurate calculation
    const updatedSiblingRows = siblingRows.map(row => 
      row.id === currentTradeId ? { ...row, pnl: values.pnl } : row
    )

    // Calculate sum of negative PnLs
    const sumNegativePnl = updatedSiblingRows.reduce((sum, row) => {
      const pnl = row.pnl || 0
      return sum + (pnl < 0 ? Math.abs(pnl) : 0)
    }, 0)

    console.log('Sum of negative PnLs:', sumNegativePnl)

    // Calculate ROI
    roi = sumNegativePnl === 0 ? 0 : Number(((values.pnl || 0) / sumNegativePnl * 100).toFixed(2))
    roiYearly = calculateYearlyROI(roi, daysInTrade || 0)
    
    // Calculate ROI Portfolio
    const pnl = values.pnl || 0
    roiPortfolio = latestBalance > 0 ? Number(((pnl / latestBalance) * 100).toFixed(2)) : 0

    console.log('Calculated ROI metrics:', { roi, roiYearly, roiPortfolio })
  }

  return {
    daysInTrade,
    riskPercentage,
    roi,
    roiYearly,
    roiPortfolio
  }
}