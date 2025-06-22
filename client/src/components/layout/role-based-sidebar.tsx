import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_LABELS, type ModuleName } from "@shared/roles";
import {
  Home,
  Users,
  GraduationCap,
  Calendar,
  ClipboardList,
  BookOpen,
  BarChart3,
  CreditCard,
  DollarSign,
  FileText,
  Settings,
  UserPlus,
  LogOut,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ModuleConfig {
  name: ModuleName;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

const MODULE_CONFIGS: ModuleConfig[] = [
  { name: 'dashboard', label: 'Dashboard', icon: Home, path: '/' },
  { name: 'students', label: 'Students', icon: Users, path: '/students' },
  { name: 'teachers', label: 'Teachers', icon: GraduationCap, path: '/teachers' },
  { name: 'attendance', label: 'Attendance', icon: ClipboardList, path: '/attendance' },
  { name: 'timetable', label: 'Timetable', icon: Calendar, path: '/timetable' },
  { name: 'homework', label: 'Homework', icon: BookOpen, path: '/homework' },
  { name: 'results', label: 'Results', icon: BarChart3, path: '/results' },
  { name: 'reports', label: 'Reports', icon: FileText, path: '/reports' },
  { name: 'fees', label: 'Fees', icon: CreditCard, path: '/fees' },
  { name: 'payroll', label: 'Payroll', icon: DollarSign, path: '/payroll' },
  { name: 'documents', label: 'Documents', icon: FileText, path: '/documents' },
  { name: 'calendar', label: 'Calendar', icon: Calendar, path: '/calendar' },
  { name: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  { name: 'admissions', label: 'Admissions', icon: UserPlus, path: '/admissions' },
];

export function RoleBasedSidebar() {
  const [location] = useLocation();
  const { user, hasModuleAccess, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const accessibleModules = MODULE_CONFIGS.filter(module => 
    hasModuleAccess(module.name)
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarFallback className="bg-blue-500 text-white">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {ROLE_LABELS[user.role]}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {accessibleModules.map((module) => {
          const Icon = module.icon;
          const isActive = location === module.path;
          
          return (
            <Link key={module.name} href={module.path}>
              <div
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {module.label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}