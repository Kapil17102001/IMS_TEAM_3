import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useUser } from "../../context/UserContext";
import {
  Menu,
  X,
  Sun,
  Moon,
  BarChart3,
  Users,
  BookOpen,
  CheckSquare,
  LogOut,
  Settings,
  User,
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
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

  const navItems =
    user?.role === "admin"
      ? allNavItems
      : user?.role === "intern"
        ? internNavItems
        : user?.role === "college"
          ? collegeNavItems
          : [];

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-16"
        } bg-card text-card-foreground border-r border-border transition-all duration-300 ease-in-out flex flex-col overflow-hidden`}
        // onMouseEnter={() => setSidebarOpen(true)}
        // onMouseLeave={() => setSidebarOpen(false)}
      >
        {/* Logo */}
        <div className="p-4 border-b border-border flex items-center justify-center h-16">
          <Link
            to="/"
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center group-hover:opacity-80 transition-opacity flex-shrink-0">
              <span className="text-primary-foreground font-bold text-lg">
                IMS
              </span>
            </div>
            <span className={`font-bold text-lg whitespace-nowrap transition-all duration-300 ease-in-out ${
              sidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
            }`}>
              IMS
            </span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-300 ease-in-out ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground text-card-foreground"
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${
                  sidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-background border-b border-border px-6 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-foreground">
                      {user?.role === "college" ? "College Portal" : "Intern Management System"}
            </h1>
            
            {/* Top Navigation Items */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              title={theme === "light" ? "Dark mode" : "Light mode"}
              className="rounded-lg"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </Button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                    {user?.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="font-semibold text-sm">{user?.username || "Guest"}</p>
                  <p className="text-xs text-muted-foreground">{user?.role || "User"}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive"
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
