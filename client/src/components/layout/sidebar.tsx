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
  Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/students", label: "Students", icon: Users },
  { href: "/teachers", label: "Teachers", icon: GraduationCap },
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
    <aside className="w-64 bg-white shadow-lg hidden md:block fixed h-full z-30">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[var(--edu-primary)] rounded-lg flex items-center justify-center">
            <GraduationCap className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--edu-primary)]">EduManage</h1>
            <p className="text-sm text-gray-500">School Management</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6 px-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || 
              (item.href !== "/" && location.startsWith(item.href));
            
            return (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "flex items-center px-4 py-3 rounded-lg font-medium transition-colors",
                    isActive
                      ? "text-[var(--edu-primary)] bg-[var(--edu-light-blue)]"
                      : "text-gray-600 hover:text-[var(--edu-primary)] hover:bg-gray-50"
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </a>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
