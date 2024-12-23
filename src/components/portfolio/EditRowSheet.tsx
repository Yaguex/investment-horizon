import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useState } from "react";
import { type PortfolioDataPoint } from "@/utils/portfolioData";

interface EditRowSheetProps {
  row: PortfolioDataPoint;
  onSave: (values: { value: string; netFlow: string }) => void;
}

export const EditRowSheet = ({ row, onSave }: EditRowSheetProps) => {
  const [editValues, setEditValues] = useState({ value: "", netFlow: "" });

  const handleEdit = () => {
    setEditValues({
      value: row.value.toString(),
      netFlow: row.netFlow.toString(),
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100"
          onClick={handleEdit}
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
          <Button variant="outline" onClick={() => setEditValues({ value: "", netFlow: "" })}>
            Cancel
          </Button>
          <Button onClick={() => onSave(editValues)}>Save</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};