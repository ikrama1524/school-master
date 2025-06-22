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

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col fixed inset-y-0 z-50 bg-card border-r border-border shadow-lg">
      {/* Header */}
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
      
      {/* Navigation */}
      <nav className="mt-6 px-4 flex-1">
        <div className="space-y-1">
          {modulesLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            modules.map((module, index) => {
              const Icon = iconMap[module.icon] || Home;
              const href = module.route || `/${module.name}`;
              const isActive = location === href || 
                (href !== "/" && location.startsWith(href));
              
              return (
                <Link key={module.id} href={href}>
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
                      "w-5 h-5 mr-3 transition-colors duration-200",
                      isActive 
                        ? "text-primary" 
                        : "text-muted-foreground group-hover:text-foreground"
                    )} />
                    <span>{module.displayName}</span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border mt-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.role || 'Role'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}