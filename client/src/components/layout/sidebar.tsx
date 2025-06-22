import { Link, useLocation } from "wouter";
import { 
  Home, 
  Users, 
  GraduationCap, 
  Calendar, 
  DollarSign, 
  BarChart, 
  Settings,
  UserPlus,
  Wallet,
  BookOpen,
  Clock,
  CalendarDays,
  Award,
  LogOut,
  User,
  FileText,
  LayoutDashboard,
  UserCheck,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useModules } from "@/contexts/ModuleContext";
import { Button } from "@/components/ui/button";

// Icon mapping for dynamic modules
const iconMap: Record<string, any> = {
  LayoutDashboard: LayoutDashboard,
  Users: Users,
  UserCheck: UserCheck,
  Calendar: Calendar,
  Clock: Clock,
  BookOpen: BookOpen,
  Trophy: Award,
  FileText: FileText,
  CreditCard: CreditCard,
  DollarSign: DollarSign,
  UserPlus: UserPlus,
  Settings: Settings,
  Home: Home,
  GraduationCap: GraduationCap,
  CalendarDays: CalendarDays,
  Wallet: Wallet,
  BarChart: BarChart,
};

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { modules, isLoading: modulesLoading } = useModules();

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className="w-64 bg-card border-r border-border hidden md:block fixed h-full z-30 animate-fade-in flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
            <GraduationCap className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gradient">EduManage</h1>
            <p className="text-sm text-muted-foreground">School Management</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6 px-4 flex-1">
        <div className="space-y-1">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location === item.href || 
              (item.href !== "/" && location.startsWith(item.href));
            
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 cursor-pointer group",
                    "hover:bg-muted/60 hover:shadow-sm hover:translate-x-1",
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <Icon className={cn(
                    "mr-3 h-5 w-5 transition-all duration-200",
                    isActive ? "text-primary" : "group-hover:text-primary/80"
                  )} />
                  <span className="transition-all duration-200">
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-primary rounded-full animate-pulse" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile and Logout */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize truncate">{user?.role}</p>
          </div>
        </div>
        <Button 
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="w-full flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
