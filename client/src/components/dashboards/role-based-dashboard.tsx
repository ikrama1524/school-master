import { useAuth } from "@/hooks/useAuth";
import { StudentParentDashboard } from "./student-parent-dashboard";
import { EnhancedTeacherDashboard } from "./enhanced-teacher-dashboard";
import { AdminDashboard } from "./admin-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, User, CreditCard, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

function NonTeachingStaffDashboard() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Staff Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Welcome to your dashboard. Check attendance and notices here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AccountantDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Fee Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹125,000</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹45,000</div>
            <p className="text-xs text-muted-foreground">Outstanding</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹85,000</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function RoleBasedDashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Please log in to access your dashboard.</p>
        </CardContent>
      </Card>
    );
  }

  switch (user.role) {
    case 'student':
    case 'parent':
      return <StudentDashboard />;
    
    case 'subject_teacher':
    case 'class_teacher':
      return <TeacherDashboard />;
    
    case 'non_teaching_staff':
      return <NonTeachingStaffDashboard />;
    
    case 'accountant':
      return <AccountantDashboard />;
    
    case 'principal':
    case 'super_admin':
      return <AdminDashboard />;
    
    default:
      return <AdminDashboard />;
  }
}