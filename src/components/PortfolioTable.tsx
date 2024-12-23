import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type PortfolioDataPoint } from "@/utils/portfolioData";
import { useToast } from "@/components/ui/use-toast";

interface PortfolioTableProps {
  data: PortfolioDataPoint[];
  onDataUpdate: (updatedData: PortfolioDataPoint[]) => void;
}

const PortfolioTable = ({ data: initialData, onDataUpdate }: PortfolioTableProps) => {
  const [editingRow, setEditingRow] = useState<PortfolioDataPoint | null>(null);
  const [editValues, setEditValues] = useState({ value: "", netFlow: "" });
  const { toast } = useToast();

  const handleEdit = (row: PortfolioDataPoint) => {
    setEditingRow(row);
    setEditValues({
      value: row.value.toString(),
      netFlow: row.netFlow.toString(),
    });
  };

  const calculateUpdatedRow = (
    originalRow: PortfolioDataPoint,
    newValue: number,
    newNetFlow: number
  ): PortfolioDataPoint => {
    const previousValue = originalRow.value;
    const monthlyGain = newValue - previousValue - newNetFlow;
    const monthlyReturn = ((monthlyGain / previousValue) * 100).toFixed(2);

    // Find the first entry of the year for YTD calculations
    // Instead of using findLast, we'll filter and get the last January entry
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

    return {
      ...originalRow,
      value: newValue,
      netFlow: newNetFlow,
      monthlyGain,
      monthlyReturn,
      ytdGain,
      ytdReturn,
    };
  };

  const handleSave = () => {
    if (!editingRow) return;

    const newValue = Number(editValues.value);
    const newNetFlow = Number(editValues.netFlow);

    if (isNaN(newValue) || isNaN(newNetFlow)) {
      toast({
        title: "Invalid input",
        description: "Please enter valid numbers for Portfolio Value and Net Flows",
        variant: "destructive",
      });
      return;
    }

    const updatedRow = calculateUpdatedRow(editingRow, newValue, newNetFlow);
    const updatedData = initialData.map((row) =>
      row.month === editingRow.month ? updatedRow : row
    );

    onDataUpdate(updatedData);
    setEditingRow(null);
    
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
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100"
                          onClick={() => handleEdit(row)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent>
                        <SheetHeader>
                          <SheetTitle>{row.month}</SheetTitle>
                        </SheetHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <label htmlFor="value">Portfolio Value</label>
                            <Input
                              id="value"
                              type="number"
                              value={editValues.value}
                              onChange={(e) =>
                                setEditValues({ ...editValues, value: e.target.value })
                              }
                            />
                          </div>
                          <div className="grid gap-2">
                            <label htmlFor="netFlow">Net Flows</label>
                            <Input
                              id="netFlow"
                              type="number"
                              value={editValues.netFlow}
                              onChange={(e) =>
                                setEditValues({ ...editValues, netFlow: e.target.value })
                              }
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                          <Button variant="outline" onClick={() => setEditingRow(null)}>
                            Cancel
                          </Button>
                          <Button onClick={handleSave}>Save</Button>
                        </div>
                      </SheetContent>
                    </Sheet>
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