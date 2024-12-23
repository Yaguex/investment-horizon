export interface PortfolioDataPoint {
  month: string;
  value: number;
  netFlow: number;
  monthlyGain: number;
  monthlyReturn: string;
  ytdGain: number;
  ytdReturn: string;
}

export const generatePortfolioData = () => {
  const data: PortfolioDataPoint[] = [];
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
    const monthlyReturn = ((monthlyGain / previousValue) * 100).toFixed(2);
    const ytdGain = value - startYearValue;
    const ytdReturn = ((ytdGain / startYearValue) * 100).toFixed(2);
    
    data.push({
      month: `${month} ${year}`,
      value: Math.round(value),
      netFlow: netFlow,
      monthlyGain: Math.round(monthlyGain),
      monthlyReturn: monthlyReturn,
      ytdGain: Math.round(ytdGain),
      ytdReturn: ytdReturn,
    });
    
    previousValue = value;
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return data.reverse(); // Return in descending order
};

export const usePortfolioData = () => {
  const data = generatePortfolioData();
  const latestData = data[0]; // First item since data is in descending order
  
  return {
    data,
    latestData,
  };
};