import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type PortfolioDataPoint } from "@/utils/portfolioData";
import { EditRowSheet } from "./portfolio/EditRowSheet";
import { cn } from "@/lib/utils";

interface PortfolioTableProps {
  data: PortfolioDataPoint[];
}

const PortfolioTable = ({ data: initialData }: PortfolioTableProps) => {
  const getValueColor = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (numValue > 0) return "text-green-600";
    if (numValue < 0) return "text-red-600";
    return "text-foreground";
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Monthly Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">Net Flows</TableHead>
                <TableHead className="text-right">YTD Net Flows</TableHead>
                <TableHead className="text-right">Monthly Gain</TableHead>
                <TableHead className="text-right">Monthly Return</TableHead>
                <TableHead className="text-right">Accumulated Return</TableHead>
                <TableHead className="text-right">YTD Gain</TableHead>
                <TableHead className="text-right">YTD Return</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialData.map((row) => (
                <TableRow 
                  key={row.month} 
                  className="group hover:bg-muted/50"
                >
                  <TableCell className="font-medium">{row.month}</TableCell>
                  <TableCell className="text-right">
                    ${row.value.toLocaleString()}
                  </TableCell>
                  <TableCell className={cn("text-right", getValueColor(row.netFlow))}>
                    ${row.netFlow.toLocaleString()}
                  </TableCell>
                  <TableCell className={cn("text-right", getValueColor(row.ytdNetFlow))}>
                    ${row.ytdNetFlow.toLocaleString()}
                  </TableCell>
                  <TableCell className={cn("text-right", getValueColor(row.monthlyGain))}>
                    ${row.monthlyGain.toLocaleString()}
                  </TableCell>
                  <TableCell className={cn("text-right", getValueColor(row.monthlyReturn))}>
                    {row.monthlyReturn}%
                  </TableCell>
                  <TableCell className={cn("text-right", getValueColor(row.monthlyReturnAccumulated))}>
                    {row.monthlyReturnAccumulated.toFixed(2)}%
                  </TableCell>
                  <TableCell className={cn("text-right", getValueColor(row.ytdGain))}>
                    ${row.ytdGain.toLocaleString()}
                  </TableCell>
                  <TableCell className={cn("text-right", getValueColor(row.ytdReturn))}>
                    {row.ytdReturn}%
                  </TableCell>
                  <TableCell>
                    <EditRowSheet row={row} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioTable;