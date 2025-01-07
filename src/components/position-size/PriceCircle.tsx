import { Circle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface PriceCircleProps {
  position: number;
  price: number;
  label: string;
  description: string;
}

export function PriceCircle({ position, price, label, description }: PriceCircleProps) {
  return (
    <div 
      className="absolute -translate-x-1/2 -top-6 flex flex-col items-center z-10"
      style={{ left: `${position}%` }}
    >
      <Tooltip>
        <TooltipTrigger>
          <span className="text-sm text-black mb-1">${price}</span>
        </TooltipTrigger>
        <TooltipContent className="bg-black text-white">
          {description}: ${price}
        </TooltipContent>
      </Tooltip>
      <Circle className="h-4 w-4 fill-black text-black" />
    </div>
  );
}