import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { InternsProvider } from "./context/InternsContext";
import { UserProvider, useUser } from "./context/UserContext";
import College from "./pages/College";
import Candidates from "./pages/Candidates";
import CandidateDetail from "./pages/CandidateDetail";

// Pages
import Index from "./pages/Index";
import Onboarding from "./pages/Onboarding";
import Performance from "./pages/Performance";
import Interns from "./pages/Interns";
import Planner from "./pages/Planner";
import NotFound from "./pages/NotFound";
import Registration from "./pages/Registration";
import Login from "./pages/Login";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/onboarding" element={<Onboarding />} />
    <Route path="/performance" element={<Performance />} />
    <Route path="/interns" element={<Interns />} />
    <Route path="/planner" element={<Planner />} />
    <Route path="/college" element={<College />} />
    <Route path="/candidates" element={<Candidates />} />
    <Route path="/candidate/:candidateId" element={<CandidateDetail />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const InternRoutes = () => (
  <Routes>
    <Route path="/planner" element={<Planner />} />
    <Route path="*" element={<Navigate to="/planner" replace />} />
  </Routes>
);

const PanelRoutes = () => (
  <Routes>
    <Route path="/candidates" element={<Candidates />} />
    <Route path="/candidate/:candidateId" element={<CandidateDetail />} />
    <Route path="*" element={<Navigate to="/candidates" replace />} />
  </Routes>
);

const AppContent = () => {
  const { user } = useUser();

  if (!user) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="*"
          element={
            user.role === "admin" ? (
              <AdminRoutes />
            ) : user.role === "intern" ? (
              <InternRoutes />
            ) : user.role === "panel" ? (
              <PanelRoutes />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <UserProvider>
    <ThemeProvider>
      <InternsProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppContent />
          </TooltipProvider>
        </QueryClientProvider>
      </InternsProvider>
    </ThemeProvider>
  </UserProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
