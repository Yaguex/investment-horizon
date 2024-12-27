import Header from "@/components/Header"
import AllocationsTable from "@/components/AllocationsTable"
import { NewBucketButton } from "@/components/allocations/NewBucketButton"

const Allocations = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Allocations</h1>
          <NewBucketButton />
        </div>
        
        <AllocationsTable />
      </main>
    </div>
  )
}

export default Allocations