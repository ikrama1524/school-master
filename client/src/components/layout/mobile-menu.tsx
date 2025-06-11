import { Link, useLocation } from "wouter";
import { 
  Home, 
  Users, 
  GraduationCap, 
  Calendar, 
  DollarSign, 
  BarChart, 
  Settings,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  { href: "/", label: "Dashboard", icon: Home },

  { href: "/teachers", label: "Teachers", icon: GraduationCap },
  { href: "/attendance", label: "Attendance", icon: Calendar },
  { href: "/fees", label: "Fee Management", icon: DollarSign },
  { href: "/reports", label: "Reports", icon: BarChart },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [location] = useLocation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <aside className="relative w-64 bg-white h-full shadow-lg">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[var(--edu-primary)] rounded-lg flex items-center justify-center">
              <GraduationCap className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--edu-primary)]">EduManage</h1>
              <p className="text-sm text-gray-500">School Management</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="text-xl" />
          </button>
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
                    onClick={onClose}
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
    </div>
  );
}
