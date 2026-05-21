import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/layout/AppLayout";
import Explore from "@/pages/Explore";
import MarketDetail from "@/pages/MarketDetail";
import Portfolio from "@/pages/Portfolio";
import Resolved from "@/pages/Resolved";
import Bookbuilding from "@/pages/Bookbuilding";
import Admin from "@/pages/Admin";
import Auth from "@/pages/Auth";
import WalletPage from "@/pages/Wallet";
import About from "@/pages/About";
import Landing from "@/pages/Landing";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<Landing />} />
          <Route
            path="*"
            element={
              <AppLayout>
                <Routes>
                  <Route path="/app" element={<Explore />} />
                  <Route path="/market/:id" element={<MarketDetail />} />
                  <Route path="/portfolio" element={<Portfolio />} />
                  <Route path="/wallet" element={<WalletPage />} />
                  <Route path="/resolved" element={<Resolved />} />
                  <Route path="/bookbuilding" element={<Bookbuilding />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/about" element={<About />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AppLayout>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
