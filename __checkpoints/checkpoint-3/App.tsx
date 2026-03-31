import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { FilterProvider } from "@/contexts/FilterContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { UserDataProvider } from "@/contexts/UserDataContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import MainDashboard from "@/pages/MainDashboard";
import VaccinationPage from "@/pages/VaccinationPage";
import HealthcarePage from "@/pages/HealthcarePage";
import RiskFactorsPage from "@/pages/RiskFactorsPage";
import TablesPage from "@/pages/TablesPage";
import ChartsPage from "@/pages/ChartsPage";
import ProfilePage from "@/pages/ProfilePage";
import AuthPage from "@/pages/AuthPage";
import NotFound from "./pages/NotFound.tsx";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function SpaRedirectHandler() {
  const redirect = sessionStorage.getItem('redirect');
  if (redirect) {
    sessionStorage.removeItem('redirect');
    return <Navigate to={redirect} replace />;
  }
  return null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function AppLayout() {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b bg-card px-2">
            <SidebarTrigger />
            <div className="ml-3 flex items-center gap-3 hidden sm:flex">
              <span className="text-sm font-medium text-foreground">Мониторинг болезней</span>
              <span className="h-3 w-[1px] bg-border mx-1" />
              <span className="text-xs text-muted-foreground">Автор - Бродовская Ариана. email - drariana2025@gmail.com</span>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <ThemeToggle />
              {user && (
                <a href="/profile" className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground text-xs hidden sm:block">
                  {user.email}
                </a>
              )}
            </div>
          </header>
          <main className="flex-1 p-3 sm:p-6 overflow-auto">
            <Routes>
              <Route path="/" element={<MainDashboard />} />
              <Route path="/vaccination" element={<VaccinationPage />} />
              <Route path="/healthcare" element={<HealthcarePage />} />
              <Route path="/risk-factors" element={<RiskFactorsPage />} />
              <Route path="/tables" element={<TablesPage />} />
              <Route path="/charts" element={<ChartsPage />} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ThemeProvider>
        <AuthProvider>
          <UserDataProvider>
            <FilterProvider>
              <BrowserRouter>
                <SpaRedirectHandler />
                <Routes>
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/*" element={<AppLayout />} />
                </Routes>
              </BrowserRouter>
            </FilterProvider>
          </UserDataProvider>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
