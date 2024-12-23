import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  className?: string;
  trend?: "up" | "down";
}

const MetricCard = ({ title, value, className, trend }: MetricCardProps) => {
  return (
    <Card className={cn("animate-fade-in", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value}
          {trend && (
            <span
              className={cn(
                "ml-2 text-sm",
                trend === "up" ? "text-green-600" : "text-red-600"
              )}
            >
              {trend === "up" ? "↑" : "↓"}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;