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
  onDataUpdate: (updatedData: PortfolioDataPoint[]) => void;
}

const PortfolioTable = ({ data: initialData, onDataUpdate }: PortfolioTableProps) => {
  const { toast } = useToast();

  const calculateUpdatedRow = (
    originalRow: PortfolioDataPoint,
    newValue: number,
    newNetFlow: number
  ): PortfolioDataPoint => {
    const previousValue = originalRow.value;
    const monthlyGain = newValue - previousValue - newNetFlow;
    const monthlyReturn = ((monthlyGain / previousValue) * 100).toFixed(2);

    // Find the first entry of the year for YTD calculations
    const currentYear = originalRow.month.split(" ")[1];
    const yearStart = initialData
      .filter(item => 
        item.month.includes("Jan") && 
        item.month.split(" ")[1] === currentYear
      )
      .reverse()[0];  // Get the last matching item

    const startYearValue = yearStart ? yearStart.value : previousValue;
    const ytdGain = newValue - startYearValue;
    const ytdReturn = ((ytdGain / startYearValue) * 100).toFixed(2);

    // Calculate new YTD Net Flow
    const [month, year] = originalRow.month.split(" ");
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const monthIndex = months.indexOf(month);
    const yearData = initialData.filter(d => d.month.split(" ")[1] === year);
    const ytdData = yearData
      .filter(d => months.indexOf(d.month.split(" ")[0]) <= monthIndex)
      .map(d => d.month === originalRow.month ? newNetFlow : d.netFlow);
    const ytdNetFlow = ytdData.reduce((sum, flow) => sum + flow, 0);

    return {
      ...originalRow,
      value: newValue,
      netFlow: newNetFlow,
      monthlyGain,
      monthlyReturn,
      ytdGain,
      ytdReturn,
      ytdNetFlow,
    };
  };

  const handleSave = (row: PortfolioDataPoint, values: { value: string; netFlow: string }) => {
    const newValue = Number(values.value);
    const newNetFlow = Number(values.netFlow);

    if (isNaN(newValue) || isNaN(newNetFlow)) {
      toast({
        title: "Invalid input",
        description: "Please enter valid numbers for Portfolio Value and Net Flows",
        variant: "destructive",
      });
      return;
    }

    const updatedRow = calculateUpdatedRow(row, newValue, newNetFlow);
    const updatedData = initialData.map((r) =>
      r.month === row.month ? updatedRow : r
    );

    onDataUpdate(updatedData);
    
    toast({
      title: "Success",
      description: "Portfolio data has been updated",
    });
  };

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
                <TableHead className="text-right">YTD Gain</TableHead>
                <TableHead className="text-right">YTD Return</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialData.map((row) => (
                <TableRow key={row.month} className="group">
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
                  <TableCell className={cn("text-right", getValueColor(row.ytdGain))}>
                    ${row.ytdGain.toLocaleString()}
                  </TableCell>
                  <TableCell className={cn("text-right", getValueColor(row.ytdReturn))}>
                    {row.ytdReturn}%
                  </TableCell>
                  <TableCell>
                    <EditRowSheet 
                      row={row} 
                      onSave={(values) => handleSave(row, values)} 
                    />
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