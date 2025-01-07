import { formatNumber } from "./utils/formatters";

interface PositionIndicatorProps {
  position: number;
  contracts: number;
  premium: number;
  isEntry: boolean;
  action: string;
}

export function PositionIndicator({ position, contracts, premium, isEntry, action }: PositionIndicatorProps) {
  const prefix = isEntry ? 
    (action === 'buy_call' ? '+' : '-') : 
    (action === 'buy_call' ? '-' : '+');
  
  const amount = formatNumber(contracts * premium * 100, 0);
  const colorClass = isEntry ? 'text-red-500' : 'text-green-500';

  return (
    <div 
      className="absolute -translate-x-1/2 top-8 flex flex-col items-center"
      style={{ left: `${position}%` }}
    >
      <span className="text-xs text-black">
        <span className="font-bold">
          {prefix}{contracts}
          {action?.includes('call') ? 'C' : 'P'}
        </span> 
        at ${premium}
      </span>
      <span className={`text-xs ${colorClass}`}>
        ${amount}
      </span>
    </div>
  );
}