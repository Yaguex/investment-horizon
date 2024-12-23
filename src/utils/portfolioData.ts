import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { parseDate, formatDate, compareMonths } from "./dateUtils";
import type { PortfolioDataPoint } from "./types";

const calculatePortfolioMetrics = (data: any[]): PortfolioDataPoint[] => {
  console.log('Raw data from DB:', data);
  console.log('Number of rows from DB:', data.length);
  
  // Sort data by date in ascending order for calculations
  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a.month);
    const dateB = new Date(b.month);
    return dateA.getTime() - dateB.getTime();
  });
  
  console.log('Sorted data:', sortedData);
  
  const result = sortedData.map((item) => {
    console.log(`Processing month: ${item.month}`);
    const parsedDate = parseDate(item.month);
    const formattedMonth = formatDate(parsedDate);
    
    if (!formattedMonth) {
      console.error('Failed to format month:', item.month);
      return null;
    }
    
    const dataPoint = {
      month: formattedMonth,
      value: Number(item.balance),
      netFlow: Number(item.flows),
      monthlyGain: Number(item.mom_gain),
      monthlyReturn: item.mom_return.toFixed(2),
      ytdGain: Number(item.ytd_gain),
      ytdReturn: item.ytd_return.toFixed(2),
      ytdNetFlow: Number(item.ytd_flows),
    };
    console.log('Processed data point:', dataPoint);
    return dataPoint;
  }).filter(Boolean) as PortfolioDataPoint[];
  
  // Sort in reverse chronological order for display
  const sortedResult = result.sort((a, b) => {
    const [monthA, yearA] = a.month.split(' ');
    const [monthB, yearB] = b.month.split(' ');
    
    const yearDiff = Number(yearB) - Number(yearA);
    if (yearDiff !== 0) return yearDiff;
    
    return compareMonths(monthA, monthB);
  });
  
  console.log('Final processed and sorted data:', sortedResult);
  console.log('Number of processed rows:', sortedResult.length);
  return sortedResult;
};

export const usePortfolioData = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { data = [], isLoading, error } = useQuery({
    queryKey: ['portfolioData', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Fetching portfolio data for user:', user.id);
      
      const { data: portfolioData, error } = await supabase
        .from('portfolio_data')
        .select('*')
        .eq('profile_id', user.id)
        .order('month', { ascending: false });
      
      if (error) {
        console.error('Error fetching portfolio data:', error);
        throw error;
      }
      
      console.log('Raw response from Supabase:', portfolioData);
      console.log('Number of rows returned from query:', portfolioData?.length);
      
      return calculatePortfolioMetrics(portfolioData || []);
    },
    enabled: !!user,
  });
  
  const updateData = async (newData: PortfolioDataPoint[]) => {
    if (!user) throw new Error('User not authenticated');
    
    // Find the updated row
    const updatedRow = newData[0];
    
    // Convert the month string back to a date format
    const [month, year] = updatedRow.month.split(' ');
    const monthIndex = MONTHS.indexOf(month);
    // Get the last day of the month
    const lastDay = new Date(Number(year), monthIndex + 1, 0).getDate();
    // Format as YYYY-MM-DD for Supabase
    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    
    console.log('Updating portfolio data:', {
      month: dateStr,
      balance: updatedRow.value,
      flows: updatedRow.netFlow,
      ytd_flows: updatedRow.ytdNetFlow,
      mom_gain: updatedRow.monthlyGain,
      mom_return: parseFloat(updatedRow.monthlyReturn),
      ytd_gain: updatedRow.ytdGain,
      ytd_return: parseFloat(updatedRow.ytdReturn),
    });
    
    const { error } = await supabase
      .from('portfolio_data')
      .update({
        balance: updatedRow.value,
        flows: updatedRow.netFlow,
        ytd_flows: updatedRow.ytdNetFlow,
        mom_gain: updatedRow.monthlyGain,
        mom_return: parseFloat(updatedRow.monthlyReturn),
        ytd_gain: updatedRow.ytdGain,
        ytd_return: parseFloat(updatedRow.ytdReturn),
      })
      .eq('month', dateStr)
      .eq('profile_id', user.id);
    
    if (error) {
      console.error('Error updating portfolio data:', error);
      throw error;
    }
    
    // Invalidate and refetch the query to update the UI
    await queryClient.invalidateQueries({ queryKey: ['portfolioData', user.id] });
  };
  
  return {
    data,
    latestData: data[0] || {
      month: '',
      value: 0,
      netFlow: 0,
      monthlyGain: 0,
      monthlyReturn: '0',
      ytdGain: 0,
      ytdReturn: '0',
      ytdNetFlow: 0,
    },
    updateData,
    isLoading,
    error,
  };
};