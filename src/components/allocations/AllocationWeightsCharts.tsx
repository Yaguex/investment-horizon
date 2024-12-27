import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Allocation } from "@/types/allocations";
import ChildAllocationWeightsChart from "./ChildAllocationWeightsChart";
import ParentAllocationWeightsChart from "./ParentAllocationWeightsChart";

interface AllocationWeightsChartsProps {
  data: Allocation[];
}

const AllocationWeightsCharts = ({ data }: AllocationWeightsChartsProps) => {
  return (
    <Card className="animate-fade-in mb-6">
      <CardHeader>
        <CardTitle>Weight Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Parent Buckets</h3>
            <ParentAllocationWeightsChart data={data} />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Child Allocations</h3>
            <ChildAllocationWeightsChart data={data} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AllocationWeightsCharts;