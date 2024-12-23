import React, { createContext, useContext, useState } from 'react';

export interface PortfolioData {
  month: string;
  value: number;
  netFlow: number;
  monthlyGain: number;
  monthlyReturn: string;
  ytdGain: number;
  ytdReturn: string;
}

interface PortfolioContextType {
  portfolioData: PortfolioData[];
  setPortfolioData: React.Dispatch<React.SetStateAction<PortfolioData[]>>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData[]>(generateTableData());
  return (
    <PortfolioContext.Provider value={{ portfolioData, setPortfolioData }}>
      {children}
    </PortfolioContext.Provider>
  );
};

const generateTableData = () => {
  const data = [];
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  
  let previousValue = 100000;
  let startYearValue = 100000;
  const startDate = new Date(2021, 6); // July 2021
  const endDate = new Date();
  let currentDate = startDate;
  
  while (currentDate <= endDate) {
    const month = months[currentDate.getMonth()];
    const year = currentDate.getFullYear();
    const value = previousValue * (1 + (Math.random() * 0.1 - 0.03));
    
    if (month === "Jan") {
      startYearValue = value;
    }
    
    const netFlow = Math.random() > 0.5 ? Math.round(Math.random() * 5000) : -Math.round(Math.random() * 5000);
    const monthlyGain = value - previousValue - netFlow;
    const monthlyReturn = (monthlyGain / previousValue) * 100;
    const ytdGain = value - startYearValue;
    const ytdReturn = (ytdGain / startYearValue) * 100;
    
    data.push({
      month: `${month} ${year}`,
      value: Math.round(value),
      netFlow: netFlow,
      monthlyGain: Math.round(monthlyGain),
      monthlyReturn: monthlyReturn.toFixed(2),
      ytdGain: Math.round(ytdGain),
      ytdReturn: ytdReturn.toFixed(2),
    });
    
    previousValue = value;
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return data.reverse(); // Return in descending order
};
