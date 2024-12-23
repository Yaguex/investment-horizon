const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const parseDate = (dateStr: string) => {
  console.log('Parsing date input:', dateStr);
  // Split YYYY-MM-DD format from Supabase
  const [year, month, day] = dateStr.split('-').map(Number);
  
  // Validate date components
  if (!month || !day || !year || 
      month < 1 || month > 12 || 
      day < 1 || day > 31 || 
      year < 2000 || year > 2024) {
    console.error('Invalid date components:', { year, month, day });
    return null;
  }
  
  const date = new Date(year, month - 1, day);
  console.log('Parsed date:', date.toISOString());
  return date;
};

export const formatDate = (date: Date | null) => {
  if (!date) return '';
  const month = MONTHS[date.getMonth()];
  const year = date.getFullYear();
  const formattedDate = `${month} ${year}`;
  console.log('Formatted date output:', formattedDate);
  return formattedDate;
};

export const compareMonths = (monthA: string, monthB: string) => {
  const monthIndexA = MONTHS.indexOf(monthA);
  const monthIndexB = MONTHS.indexOf(monthB);
  
  if (monthIndexA === -1 || monthIndexB === -1) {
    console.error('Invalid month comparison:', { monthA, monthB });
    return 0;
  }
  
  return monthIndexB - monthIndexA;
};

export { MONTHS };