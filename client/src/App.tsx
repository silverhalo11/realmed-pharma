import { useEffect, useState } from "react";
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
import CallsPage from "./pages/CallsPage";
import NewCallPage from "./pages/NewCallPage";
import CallDetailPage from "./pages/CallDetailPage";
import NotFound from "./pages/NotFound";
import launchLogo from "@assets/realmed_bird_logo_white.png";

const queryClient = new QueryClient();

const LaunchScreen = () => (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
    <div className="flex flex-col items-center gap-6">
      <img
        src={launchLogo}
        alt="RealMed Pharma"
        className="w-44 h-44 md:w-56 md:h-56 object-contain animate-[pulse_1.6s_ease-in-out_infinite]"
      />
      <div className="h-1.5 w-28 rounded-full bg-gradient-to-r from-cyan-500/20 via-cyan-600 to-cyan-500/20 animate-pulse" />
    </div>
  </div>
);

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
  const [showLaunch, setShowLaunch] = useState(true);
  const showNav = isLoggedIn && pathname !== '/login' && pathname !== '/signup';

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowLaunch(false), 1600);
    return () => window.clearTimeout(timer);
  }, []);

  if (showLaunch) {
    return <LaunchScreen />;
  }

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
        <Route path="/calls" element={<ProtectedRoute><CallsPage /></ProtectedRoute>} />
        <Route path="/calls/new/:doctorId" element={<ProtectedRoute><NewCallPage /></ProtectedRoute>} />
        <Route path="/calls/:callId" element={<ProtectedRoute><CallDetailPage /></ProtectedRoute>} />
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
