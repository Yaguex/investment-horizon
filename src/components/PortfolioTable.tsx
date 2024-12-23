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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePortfolio, PortfolioData } from "@/contexts/PortfolioContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const PortfolioTable = () => {
  const { portfolioData, setPortfolioData } = usePortfolio();
  const [editingRow, setEditingRow] = useState<PortfolioData | null>(null);
  const [editValues, setEditValues] = useState({ value: "", netFlow: "" });
  const [isOpen, setIsOpen] = useState(false);

  const handleEdit = (row: PortfolioData) => {
    setEditingRow(row);
    setEditValues({
      value: row.value.toString(),
      netFlow: row.netFlow.toString(),
    });
    setIsOpen(true);
  };

  const handleSave = () => {
    const updatedData = portfolioData.map((row) => {
      if (row.month === editingRow?.month) {
        return {
          ...row,
          value: Number(editValues.value),
          netFlow: Number(editValues.netFlow),
        };
      }
      return row;
    });
    setPortfolioData(updatedData);
    setEditingRow(null);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setEditingRow(null);
    setIsOpen(false);
  };

  const getValueColor = (value: number) => {
    if (value > 0) return "text-green-600";
    if (value < 0) return "text-red-600";
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
              {portfolioData.map((row) => (
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
                  <TableCell className={cn("text-right", getValueColor(Number(row.monthlyReturn)))}>
                    {row.monthlyReturn}%
                  </TableCell>
                  <TableCell className={cn("text-right", getValueColor(row.ytdGain))}>
                    ${row.ytdGain.toLocaleString()}
                  </TableCell>
                  <TableCell className={cn("text-right", getValueColor(Number(row.ytdReturn)))}>
                    {row.ytdReturn}%
                  </TableCell>
                  <TableCell>
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
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
                      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
                        <SheetHeader>
                          <SheetTitle>{editingRow?.month}</SheetTitle>
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
                          <Button variant="outline" onClick={handleCancel}>
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