import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import DoctorsPage from "./pages/DoctorsPage";
import ProductsPage from "./pages/ProductsPage";
import RemindersPage from "./pages/RemindersPage";
import VisitsPage from "./pages/VisitsPage";
import OrdersPage from "./pages/OrdersPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/reminders" element={<RemindersPage />} />
          <Route path="/visits" element={<VisitsPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
