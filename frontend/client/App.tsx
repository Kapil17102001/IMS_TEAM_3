import "./global.css";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
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
import ResumeUpload from "./pages/ResumeUpload";
import CollegePortal from "./pages/CollegePortal";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminRoutes = ({ lastPath }: { lastPath: string | null }) => {
  const validPaths = ["/", "/onboarding", "/performance", "/interns", "/planner", "/college"];
  const defaultPath = lastPath && validPaths.includes(lastPath) ? lastPath : "/";
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/performance" element={<Performance />} />
      <Route path="/interns" element={<Interns />} />
      <Route path="/planner" element={<Planner />} />
      <Route path="/college" element={<College />} />
      <Route path="*" element={<Navigate to={defaultPath} replace />}  />
    </Routes>
  );
};

const CollegeRoutes = ({ lastPath }: { lastPath: string | null }) => {
  const validPaths = ["/selected-students", "/resumes-upload"];
  const defaultPath = lastPath && validPaths.includes(lastPath) ? lastPath : "/selected-students";
  
  return (
    <Routes>
      <Route path="/selected-students" element={<CollegePortal />} />
      <Route path="/resumes-upload" element={<ResumeUpload />} />
      <Route path="*" element={<Navigate to={defaultPath} replace />} />
    </Routes>
  );
};

const InternRoutes = ({ lastPath }: { lastPath: string | null }) => {
  const defaultPath = lastPath === "/planner" ? lastPath : "/planner";
  
  return (
    <Routes>
      <Route path="/planner" element={<Planner />} />
      <Route path="*" element={<Navigate to={defaultPath} replace />} />
    </Routes>
  );
};

const PanelRoutes = ({ lastPath }: { lastPath: string | null }) => {
  const validPathPatterns = ["/candidates", "/candidate/"];
  const isValidPath = lastPath && validPathPatterns.some(pattern => lastPath.startsWith(pattern));
  const defaultPath = isValidPath ? lastPath : "/candidates";
  
  return (
    <Routes>
      <Route path="/candidates" element={<Candidates />} />
      <Route path="/candidate/:candidateId" element={<CandidateDetail />} />
      <Route path="*" element={<Navigate to={defaultPath} replace />} />
    </Routes>
  );
};

const PathTracker = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Store current path in localStorage whenever it changes
    localStorage.setItem("lastPath", location.pathname);
  }, [location.pathname]);
  
  return null;
};

const AppContent = () => {
  const { user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [hasRestored, setHasRestored] = useState(false);

  useEffect(() => {
    // Only restore path once on initial load
    if (!hasRestored && user) {
      const savedPath = localStorage.getItem("lastPath");
      const currentPath = location.pathname;
      
      // If we're on the root or a generic path and have a saved path, navigate to it
      if (savedPath && currentPath !== savedPath && (currentPath === "/" || currentPath === "/login")) {
        navigate(savedPath, { replace: true });
      }
      setHasRestored(true);
    }
  }, [user, hasRestored, location.pathname, navigate]);

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const lastPath = localStorage.getItem("lastPath");

  return (
    <>
      <PathTracker />
      <Routes>
        <Route
          path="*"
          element={
            user.role === "admin" ? (
              <AdminRoutes lastPath={lastPath} />
            ) : user.role === "intern" ? (
              <InternRoutes lastPath={lastPath} />
            ) : user.role === "panel" ? (
              <PanelRoutes lastPath={lastPath} />
            ) : user.role === "college" ? (
              <CollegeRoutes lastPath={lastPath} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </>
  );
};

const App = () => (
  <UserProvider>
    <ThemeProvider>
      <InternsProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <BrowserRouter>
              <Toaster />
              <Sonner />
              <AppContent />
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </InternsProvider>
    </ThemeProvider>
  </UserProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
