
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, Users, UserCheck, Calendar, 
  Clock, BookOpen, Trophy, FileText, CreditCard, 
  Banknote, UserPlus, FileCheck, CalendarDays, 
  Settings, Users2, LogOut, User, Shield
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

const navigationItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/students", label: "Students", icon: Users },
  { href: "/teachers", label: "Teachers", icon: UserCheck },
  { href: "/attendance", label: "Attendance", icon: Calendar },
  { href: "/timetable", label: "Timetable", icon: Clock },
  { href: "/homework", label: "Homework", icon: BookOpen },
  { href: "/results", label: "Results", icon: Trophy },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/fees", label: "Fee Management", icon: CreditCard },
  { href: "/payroll", label: "Payroll", icon: Banknote },
  { href: "/admissions", label: "Admissions", icon: UserPlus },
  { href: "/documents", label: "Documents", icon: FileCheck },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/users", label: "User Management", icon: Users2 },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-card border-r border-border hidden md:block fixed h-full z-30">
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Shield className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">EduManage</h1>
            <p className="text-sm text-muted-foreground">School Management</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6 px-4 flex-1 overflow-y-auto">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 cursor-pointer",
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <Badge variant="outline" className="text-xs">{user?.role}</Badge>
          </div>
        </div>
        <Button onClick={logout} variant="outline" size="sm" className="w-full">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
