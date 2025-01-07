export const getOptionTypes = (action: string) => {
  const isCall = action.toLowerCase().includes('call');
  const type = isCall ? 'call' : 'put';
  const isSpread = action.includes('spread');

  return {
    entry: type,
    target: type,
    protection: type
  };
};