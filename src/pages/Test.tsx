import { Button } from "@/components/ui/button"
import { TestTube } from "lucide-react"
import { toast } from "sonner"
import Header from "@/components/Header"

const Test = () => {
  const handleTest = async () => {
    try {
      const response = await fetch('/api/test')
      const data = await response.json()
      toast.success('Test successful!')
      console.log('Test response:', data)
    } catch (error) {
      console.error('Test error:', error)
      toast.error('Test failed. Check console for details.')
    }
  }

  return (
    <div className="min-h-screen pt-16 bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Test Page</h1>
        <Button 
          onClick={handleTest}
          className="flex items-center gap-2"
        >
          <TestTube className="h-4 w-4" />
          Test Function
        </Button>
      </main>
    </div>
  )
}

export default Test