import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface PortfolioDataPoint {
  month: string;
  value: number;
  netFlow: number;
  monthlyGain: number;
  monthlyReturn: string;
  ytdGain: number;
  ytdReturn: string;
  ytdNetFlow: number;
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();
  return `${month} ${year}`;
};

const calculatePortfolioMetrics = (data: any[]): PortfolioDataPoint[] => {
  // Sort data by date in ascending order for calculations
  const sortedData = [...data].sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  
  const result: PortfolioDataPoint[] = [];
  let previousValue = 0;
  let startYearValue = 0;
  let currentYear = '';
  
  sortedData.forEach((item) => {
    const itemDate = new Date(item.month);
    const year = itemDate.getFullYear().toString();
    
    // Reset start year value when year changes
    if (year !== currentYear) {
      startYearValue = previousValue;
      currentYear = year;
    }
    
    const value = Number(item.balance);
    const netFlow = Number(item.flows);
    const monthlyGain = value - previousValue - netFlow;
    const monthlyReturn = ((monthlyGain / (previousValue || 1)) * 100).toFixed(2);
    const ytdGain = value - startYearValue;
    const ytdReturn = ((ytdGain / (startYearValue || 1)) * 100).toFixed(2);
    
    result.push({
      month: formatDate(item.month),
      value,
      netFlow,
      monthlyGain,
      monthlyReturn,
      ytdGain,
      ytdReturn,
      ytdNetFlow: Number(item.ytd_flows),
    });
    
    previousValue = value;
  });
  
  // Return in descending order for display
  return result.reverse();
};

export const usePortfolioData = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { data = [], isLoading, error } = useQuery({
    queryKey: ['portfolioData', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Fetching portfolio data for user:', user.id);
      const { data, error } = await supabase
        .from('portfolio_data')
        .select('*')
        .eq('profile_id', user.id)
        .order('month', { ascending: false });
      
      if (error) {
        console.error('Error fetching portfolio data:', error);
        throw error;
      }
      
      console.log('Received portfolio data:', data);
      return calculatePortfolioMetrics(data);
    },
    enabled: !!user,
  });
  
  const updateData = async (newData: PortfolioDataPoint[]) => {
    if (!user) throw new Error('User not authenticated');
    
    // Find the updated row
    const updatedRow = newData[0]; // Since we're updating one row at a time
    
    // Convert the month string back to a date format
    const [month, year] = updatedRow.month.split(' ');
    const monthIndex = new Date(Date.parse(`${month} 1, ${year}`)).getMonth();
    const dateStr = new Date(Number(year), monthIndex, 1).toISOString().split('T')[0];
    
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