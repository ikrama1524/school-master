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
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/students", label: "Students", icon: Users },
  { href: "/teachers", label: "Teachers", icon: GraduationCap },
  { href: "/homework", label: "Homework", icon: BookOpen },
  { href: "/attendance", label: "Attendance", icon: Calendar },
  { href: "/fees", label: "Fee Management", icon: DollarSign },
  { href: "/admissions", label: "Admissions", icon: UserPlus },
  { href: "/payroll", label: "Payroll", icon: Wallet },
  { href: "/reports", label: "Reports", icon: BarChart },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-card border-r border-border hidden md:block fixed h-full z-30 animate-fade-in">
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
      
      <nav className="mt-6 px-4">
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
    </aside>
  );
}
