
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import CreateEmployee from "./pages/CreateEmployee";
import EmployeeList from "./pages/EmployeeList";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected admin routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin" />}>
              <Route element={<AdminDashboard />}>
                <Route index element={<Index />} />
                <Route path="employee-list" element={<EmployeeList />} />
                <Route path="create-employee" element={<CreateEmployee />} />
                <Route path="report-scheduler" element={<Navigate to="/admin/dashboard" />} />
              </Route>
            </Route>
            
            {/* Protected user routes */}
            <Route path="/user/dashboard" element={<ProtectedRoute requiredRole="user" />}>
              <Route index element={<UserDashboard />} />
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
