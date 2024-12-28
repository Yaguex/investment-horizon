import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  className?: string;
  trend?: "up" | "down";
  isNumeric?: boolean;
}

const MetricCard = ({ title, value, className, trend, isNumeric = false }: MetricCardProps) => {
  const getValueColor = (value: string, title: string) => {
    // To Add should be red, To Trim should be green
    if (title === "To Add") return "text-red-600";
    if (title === "To Trim") return "text-green-600";
    
    // For other metrics, keep the existing color logic
    if (!isNumeric) return "text-foreground";
    const numValue = parseFloat(value.replace(/[^0-9.-]+/g, ""));
    if (numValue > 0) return "text-green-600";
    if (numValue < 0) return "text-red-600";
    return "text-foreground";
  };

  return (
    <Card className={cn("animate-fade-in", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", getValueColor(value, title))}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;