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

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const getLastDayOfMonth = (year: number, month: number) => {
  // month is 0-based in JS Date
  return new Date(year, month + 1, 0).getDate();
};

const formatDate = (dateStr: string) => {
  console.log('Formatting date input:', dateStr);
  const date = new Date(dateStr);
  const month = MONTHS[date.getMonth()];
  const year = date.getFullYear();
  const formattedDate = `${month} ${year}`;
  console.log('Formatted date output:', formattedDate);
  return formattedDate;
};

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
    const formattedMonth = formatDate(item.month);
    console.log(`Processing month: ${item.month} -> ${formattedMonth}`);
    
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
  });
  
  // Sort in reverse chronological order for display
  const sortedResult = result.sort((a, b) => {
    const [monthA, yearA] = a.month.split(' ');
    const [monthB, yearB] = b.month.split(' ');
    const yearDiff = Number(yearB) - Number(yearA);
    if (yearDiff !== 0) return yearDiff;
    return MONTHS.indexOf(monthB) - MONTHS.indexOf(monthA);
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
      
      let queryResult = await supabase
        .from('portfolio_data')
        .select('*')
        .eq('profile_id', user.id)
        .order('month', { ascending: false });

      if (queryResult.error) {
        console.error('Error fetching portfolio data:', queryResult.error);
        throw queryResult.error;
      }

      console.log('Raw response from Supabase:', queryResult.data);
      console.log('Number of rows returned from query:', queryResult.data?.length);

      return calculatePortfolioMetrics(queryResult.data || []);
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
    const lastDay = getLastDayOfMonth(Number(year), monthIndex);
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