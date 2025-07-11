import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  Clock,
  BookOpen,
  Trophy,
  FileText,
  CreditCard,
  Banknote,
  UserPlus,
  FileCheck,
  CalendarDays,
  Settings,
  Users2,
  LogOut,
  User,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Define all possible navigation items with their module mappings
const allNavigationItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, module: "dashboard" },
  { href: "/students", label: "Students", icon: Users, module: "students" },
  { href: "/teachers", label: "Teachers", icon: UserCheck, module: "teachers" },
  { href: "/attendance", label: "Attendance", icon: Calendar, module: "attendance" },
  { href: "/timetable", label: "Timetable", icon: Clock, module: "timetable" },
  { href: "/homework", label: "Homework", icon: BookOpen, module: "homework" },
  { href: "/results", label: "Results", icon: Trophy, module: "results" },
  { href: "/reports", label: "Reports", icon: FileText, module: "reports" },
  { href: "/fees", label: "Fee Management", icon: CreditCard, module: "fees" },
  { href: "/payroll", label: "Payroll", icon: Banknote, module: "payroll" },
  { href: "/admissions", label: "Admissions", icon: UserPlus, module: "admissions" },
  { href: "/documents", label: "Documents", icon: FileCheck, module: "documents" },
  { href: "/calendar", label: "Calendar", icon: CalendarDays, module: "calendar" },
  { href: "/settings", label: "Settings", icon: Settings, module: "settings" },
  { href: "/users", label: "User Management", icon: Users2, module: "users" },
];

// Role-based permission system
const ROLE_PERMISSIONS = {
  student: ["dashboard", "timetable", "homework", "results", "reports"],
  parent: ["dashboard", "timetable", "homework", "results", "reports"],
  subject_teacher: ["dashboard", "timetable", "homework", "results", "reports"],
  class_teacher: ["dashboard", "attendance", "timetable", "homework", "results", "reports", "fees"],
  non_teaching_staff: ["dashboard"],
  accountant: ["fees", "payroll", "attendance"],
  principal: ["dashboard", "students", "teachers", "attendance", "timetable", "homework", "results", "reports", "fees", "payroll", "admissions", "documents", "calendar", "settings"],
  admin: ["dashboard", "students", "teachers", "attendance", "timetable", "homework", "results", "reports", "fees", "payroll", "admissions", "documents", "calendar", "settings"],
  super_admin: ["dashboard", "students", "teachers", "attendance", "timetable", "homework", "results", "reports", "fees", "payroll", "admissions", "documents", "calendar", "settings", "users"],
};

const getRoleBadgeColor = (role: string) => {
  const colors = {
    super_admin: "bg-red-100 text-red-800 border-red-200",
    admin: "bg-purple-100 text-purple-800 border-purple-200",
    principal: "bg-blue-100 text-blue-800 border-blue-200",
    accountant: "bg-green-100 text-green-800 border-green-200",
    class_teacher: "bg-orange-100 text-orange-800 border-orange-200",
    subject_teacher: "bg-yellow-100 text-yellow-800 border-yellow-200",
    non_teaching_staff: "bg-gray-100 text-gray-800 border-gray-200",
    parent: "bg-pink-100 text-pink-800 border-pink-200",
    student: "bg-indigo-100 text-indigo-800 border-indigo-200",
  };
  return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200";
};

const getRoleLabel = (role: string) => {
  const labels = {
    super_admin: "Super Admin",
    admin: "Admin",
    principal: "Principal",
    accountant: "Accountant",
    class_teacher: "Class Teacher",
    subject_teacher: "Subject Teacher",
    non_teaching_staff: "Staff",
    parent: "Parent",
    student: "Student",
  };
  return labels[role as keyof typeof labels] || role;
};

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  // Filter navigation items based on user role
  const getVisibleNavigationItems = () => {
    if (!user) return [];
    const userRole = user.role || 'student';
    const allowedModules = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS] || [];
    return allNavigationItems.filter(item => allowedModules.includes(item.module));
  };

  const navigationItems = getVisibleNavigationItems();

  return (
    <aside className="w-64 bg-card border-r border-border hidden md:block fixed h-full z-30 animate-fade-in flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
            <Shield className="text-white text-xl" />
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
            <Badge variant="outline" className={`text-xs ${getRoleBadgeColor(user?.role || 'student')}`}>
              {getRoleLabel(user?.role || 'student')}
            </Badge>
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
