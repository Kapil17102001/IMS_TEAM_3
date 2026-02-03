import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useUser } from "../../context/UserContext";
import {
  BarChart3,
  Users,
  BookOpen,
  CheckSquare,
  User,
  Sun,
  Moon,
  MoreVertical,
  ChevronRight,
  ChevronLeft,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const { user, logout } = useUser();

  const allNavItems = [
    { label: "Onboarding", href: "/onboarding", icon: Users },
    { label: "Performance", href: "/performance", icon: BarChart3 },
    { label: "Intern Views", href: "/interns", icon: BookOpen },
    { label: "Planner", href: "/planner", icon: CheckSquare },
    { label: "Colleges", href: "/college", icon: Users },
  ];

  const collegeNavItems = [
    { label: "Selected Students", href: "/selected-students", icon: Users },
    { label: "Resumes Upload", href: "/resumes-upload", icon: BookOpen },
  ];

  const internNavItems = [
    { label: "Planner", href: "/planner", icon: CheckSquare },
  ];

  const panelNavItems = [
    { label: "Candidates", href: "/candidates", icon: Users },
  ];

  const navItems =
    user?.role === "admin"
      ? allNavItems
      : user?.role === "intern"
        ? internNavItems
        : user?.role === "college"
          ? collegeNavItems
          : user?.role === "panel"
            ? panelNavItems
            : [];
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebarCollapsed");
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const isActive = (href: string) => location.pathname === href;
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex h-screen bg-background text-foreground font-sans text-sidebar-foreground">
      {/* Sidebar - Dynamically Collapsible */}
      <aside
        className={`${isCollapsed ? "w-20" : "w-64"} h-screen flex flex-col border-r border-sidebar-border bg-sidebar backdrop-blur-xl flex-shrink-0 transition-all duration-300 ease-in-out`}
      >

        {/* Logo Area */}
        <div className={`flex items-center justify-between px-6 py-8 transition-all ${isCollapsed ? "px-0 justify-center flex-col gap-4" : ""}`}>
          <Link to="/" className={`flex items-center gap-3 hover:opacity-80 transition-opacity ${isCollapsed ? "justify-center" : ""}`}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-bold text-xl">W</span>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden animate-in fade-in slide-in-from-left-2 duration-300">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60 whitespace-nowrap">
                  Wissen IMS
                </span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest -mt-1 whitespace-nowrap">
                  {user?.role === "admin" ? "Admin" : user?.role === "college" ? "College" : user?.role === "intern" ? "Intern" : user?.role === "panel" ? "Panel" : "Panel"}
                </span>
              </div>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all"
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isCollapsed ? "justify-center px-0 mx-auto w-12" : ""} ${active
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.1)]"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                  }`}
              >
                {active && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent opacity-50" />
                )}
                <Icon className={`w-5 h-5 z-10 flex-shrink-0 ${active ? "text-primary" : "group-hover:text-sidebar-foreground transition-colors"}`} />
                {!isCollapsed && (
                  <span className="font-medium z-10 whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions & User Profile */}
        <div className="mt-auto space-y-4 p-4 border-t border-sidebar-border bg-sidebar-accent/20">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-sidebar-accent transition-all text-muted-foreground hover:text-foreground ${isCollapsed ? "justify-center px-0" : "justify-start"}`}
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="animate-in fade-in slide-in-from-left-2 duration-300">Light Mode</span>}
              </>
            ) : (
              <>
                <Moon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="animate-in fade-in slide-in-from-left-2 duration-300">Dark Mode</span>}
              </>
            )}
          </Button>

          {/* User Profile Section */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-sidebar-accent transition-all text-left group ${isCollapsed ? "justify-center px-0" : ""}`}>
                <div className="w-10 h-10 bg-primary/10 rounded-full flex-shrink-0 flex items-center justify-center text-primary font-semibold border border-primary/20 group-hover:border-primary/40 transition-colors">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </div>
                {!isCollapsed && (
                  <>
                    <div className="flex-1 min-w-0 text-sidebar-foreground animate-in fade-in slide-in-from-left-2 duration-300">
                      <p className="font-semibold text-sm truncate">{user?.username || "Guest"}</p>
                      <p className="text-xs opacity-60 truncate capitalize">{user?.role || "User"}</p>
                    </div>
                    <Settings className="w-4 h-4 text-sidebar-foreground/40 group-hover:text-sidebar-foreground transition-colors" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="right" className="w-56 bg-card border-border text-card-foreground ml-2">
              <div className="px-2 py-1.5">
                <p className="font-semibold text-sm">{user?.username || "Guest"}</p>
                <p className="text-xs text-muted-foreground">{user?.email || "No email provided"}</p>
              </div>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem className="cursor-pointer focus:bg-accent focus:text-accent-foreground">
                <User className="w-4 h-4 mr-2" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-400"
                onClick={logout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Page Content */}
        <main className="flex-1 overflow-auto relative custom-scrollbar">
          <div className="absolute inset-0 bg-grid-foreground/[0.02] pointer-events-none" />
          <div className="p-8 h-full relative z-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
