import { type Allocation } from "@/types/allocations";
import ChildAllocationWeightsChart from "./ChildAllocationWeightsChart";
import ParentAllocationWeightsChart from "./ParentAllocationWeightsChart";

interface AllocationWeightsChartsProps {
  data: Allocation[];
}

const AllocationWeightsCharts = ({ data }: AllocationWeightsChartsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <ParentAllocationWeightsChart data={data} />
      <ChildAllocationWeightsChart data={data} />
    </div>
  );
};

export default AllocationWeightsCharts;