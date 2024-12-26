import Header from "@/components/Header"
import { Button } from "@/components/ui/button"

const Allocations = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Allocations</h1>
          <Button>Add Bucket</Button>
        </div>
      </main>
    </div>
  )
}

export default Allocations