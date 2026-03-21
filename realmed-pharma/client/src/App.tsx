import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAppStore } from "./store/useAppStore";
import BottomNav from "./components/BottomNav";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import Dashboard from "./pages/Dashboard";
import DoctorsPage from "./pages/DoctorsPage";
import ProductsPage from "./pages/ProductsPage";
import RemindersPage from "./pages/RemindersPage";
import VisitsPage from "./pages/VisitsPage";
import OrdersPage from "./pages/OrdersPage";
import CatalogPage from "./pages/CatalogPage";
import DoctorDetailPage from "./pages/DoctorDetailPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = useAppStore((s) => s.isLoggedIn);
  const authChecked = useAppStore((s) => s._authChecked);
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppLayout = () => {
  const { pathname } = useLocation();
  const isLoggedIn = useAppStore((s) => s.isLoggedIn);
  const checkAuth = useAppStore((s) => s.checkAuth);
  const showNav = isLoggedIn && pathname !== '/login' && pathname !== '/signup';

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/doctors" element={<ProtectedRoute><DoctorsPage /></ProtectedRoute>} />
        <Route path="/doctors/:id" element={<ProtectedRoute><DoctorDetailPage /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
        <Route path="/reminders" element={<ProtectedRoute><RemindersPage /></ProtectedRoute>} />
        <Route path="/visits" element={<ProtectedRoute><VisitsPage /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path="/catalog" element={<ProtectedRoute><CatalogPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {showNav && <BottomNav />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
