import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useState } from "react";
import { type PortfolioDataPoint } from "@/utils/portfolioData";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface EditRowSheetProps {
  row: PortfolioDataPoint;
  onSave: (values: { value: string; netFlow: string }) => void;
}

export const EditRowSheet = ({ row, onSave }: EditRowSheetProps) => {
  const [editValues, setEditValues] = useState({ value: "", netFlow: "" });
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleEdit = () => {
    setEditValues({
      value: row.value.toString(),
      netFlow: row.netFlow.toString(),
    });
  };

  const handleSave = async () => {
    try {
      console.log('Saving row update to database:', {
        month: row.month,
        balance: editValues.value,
        flows: editValues.netFlow
      });

      const { error } = await supabase
        .from('portfolio_data')
        .update({
          balance: Number(editValues.value),
          flows: Number(editValues.netFlow)
        })
        .eq('month', row.month);

      if (error) {
        console.error('Error updating portfolio data:', error);
        toast({
          title: "Error",
          description: "Failed to save changes. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Call the original onSave to update local state
      onSave(editValues);

      // Invalidate and refetch the query to update the UI
      await queryClient.invalidateQueries({ queryKey: ['portfolioData'] });

      setIsOpen(false);
      
      toast({
        title: "Success",
        description: "Changes saved successfully",
      });
    } catch (error) {
      console.error('Error in save operation:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
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
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};