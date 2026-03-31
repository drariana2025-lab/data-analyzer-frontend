import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, Link } from "react-router-dom";
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
import TablesPage from "@/pages/TablesPage";
import ChartsPage from "@/pages/ChartsPage";
import ProfilePage from "@/pages/ProfilePage";
import AuthPage from "@/pages/AuthPage";
import NotFound from "./pages/NotFound.tsx";
import { Loader2 } from "lucide-react";
import QRCodeGenerator from "./components/QRCodeGenerator"; // ← ДОБАВЛЯЕМ ИМПОРТ

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
      <div className="min-h-screen flex w-full max-w-[100vw] min-w-0 bg-background selection:bg-primary/10">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-x-hidden">
          <header className="min-h-12 flex flex-wrap items-center gap-2 border-b bg-card/50 backdrop-blur-md px-2 sm:px-3 py-2 sm:py-0 sm:h-12 sm:flex-nowrap z-50">
            <SidebarTrigger className="hover:bg-primary/5 transition-colors shrink-0" />
            <div className="ml-0 sm:ml-4 flex items-center gap-3 hidden sm:flex min-w-0">
              <span className="text-sm font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent italic truncate">Ваш анализатор данных</span>
            </div>
            <div className="ml-auto flex flex-wrap items-center justify-end gap-2 min-w-0 max-w-full">
              <ThemeToggle />
              {user && (
                <Link to="/profile" className="flex items-center gap-2 p-1 px-2 sm:px-3 rounded-full bg-primary/5 hover:bg-primary/10 transition-all text-xs font-semibold text-primary border border-primary/10 max-w-[min(100%,14rem)] min-w-0">
                   <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                   <span className="truncate">{user.email}</span>
                </Link>
              )}
            </div>
          </header>
          <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto overflow-x-hidden min-w-0 max-w-full">
            <Routes>
              <Route path="/" element={<MainDashboard />} />
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
      <Sonner position="top-center" richColors />
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
                {/* ← ДОБАВЛЯЕМ QR-КОД ЗДЕСЬ, ПОСЛЕ ВСЕХ ROUTES */}
                <QRCodeGenerator />
              </BrowserRouter>
            </FilterProvider>
          </UserDataProvider>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;