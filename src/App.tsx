import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/contexts/AuthContext"
import ProtectedRoute from "@/components/ProtectedRoute"
import Index from "./pages/Index"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import ResetPassword from "./pages/ResetPassword"
import TradeLog from "./pages/TradeLog"
import Allocations from "./pages/Allocations"
import EconomicCalendar from "./pages/EconomicCalendar"
import DIYNotes from "./pages/DIYNotes"

const queryClient = new QueryClient()

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trade-log"
              element={
                <ProtectedRoute>
                  <TradeLog />
                </ProtectedRoute>
              }
            />
            <Route
              path="/allocations"
              element={
                <ProtectedRoute>
                  <Allocations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/economic-calendar"
              element={
                <ProtectedRoute>
                  <EconomicCalendar />
                </ProtectedRoute>
              }
            />
            <Route
              path="/diy-notes"
              element={
                <ProtectedRoute>
                  <DIYNotes />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
)

export default App