import { useAuth } from "@/hooks/useAuth";
import { StudentParentDashboard } from "./student-parent-dashboard";
import { EnhancedTeacherDashboard } from "./enhanced-teacher-dashboard";
import { AdminDashboard } from "./admin-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, User, CreditCard, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

function NonTeachingStaffDashboard() {
  const { data: notices = [] } = useQuery<any[]>({
    queryKey: ["/api/notices"],
  });

  const { data: attendance = [] } = useQuery<any[]>({
    queryKey: ["/api/attendance"],
  });

  const recentNotices = Array.isArray(notices) ? notices.slice(0, 4) : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Attendance</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Present</div>
            <p className="text-xs text-muted-foreground">Today's status</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Notices</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.isArray(notices) ? notices.length : 0}</div>
            <p className="text-xs text-muted-foreground">Total announcements</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Recent Notices
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentNotices.length > 0 ? (
            <div className="space-y-3">
              {recentNotices.map((notice: any) => (
                <div key={notice.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{notice.title}</h4>
                    <span className={`px-2 py-1 rounded text-xs ${
                      notice.priority === 'high' ? 'bg-red-100 text-red-700' :
                      notice.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {notice.priority}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{notice.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No recent notices</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AccountantDashboard() {
  const { data: fees = [] } = useQuery<any[]>({
    queryKey: ["/api/fees"],
  });

  const { data: teachers = [] } = useQuery<any[]>({
    queryKey: ["/api/teachers"],
  });

  // Calculate fee statistics
  const totalFees = fees.reduce((sum: number, fee: any) => sum + fee.amount, 0);
  const pendingFees = fees.filter((fee: any) => fee.status === 'pending' || fee.status === 'overdue');
  const pendingAmount = pendingFees.reduce((sum: number, fee: any) => sum + fee.amount, 0);
  const collectedFees = totalFees - pendingAmount;
  const totalPayroll = teachers.reduce((sum: number, teacher: any) => sum + (teacher.salary || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fee Collection</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{collectedFees.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{pendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{pendingFees.length} outstanding</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalPayroll.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{teachers.length} teachers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teacher Count</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachers.length}</div>
            <p className="text-xs text-muted-foreground">Active teachers</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Recent Fee Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {fees.slice(0, 5).map((fee: any) => (
              <div key={fee.id} className="flex items-center justify-between p-3 border rounded-lg mb-3">
                <div>
                  <p className="font-medium">{fee.feeType}</p>
                  <p className="text-sm text-muted-foreground">Student ID: {fee.studentId}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">₹{fee.amount.toLocaleString()}</p>
                  <span className={`px-2 py-1 rounded text-xs ${
                    fee.status === 'paid' ? 'bg-green-100 text-green-700' :
                    fee.status === 'overdue' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {fee.status}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Teacher Payroll
            </CardTitle>
          </CardHeader>
          <CardContent>
            {teachers.slice(0, 5).map((teacher: any) => (
              <div key={teacher.id} className="flex items-center justify-between p-3 border rounded-lg mb-3">
                <div>
                  <p className="font-medium">{teacher.name}</p>
                  <p className="text-sm text-muted-foreground">{teacher.subject}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">₹{teacher.salary?.toLocaleString() || '0'}</p>
                  <p className="text-xs text-muted-foreground">Monthly</p>
                </div>
              </div>
            ))}
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
      return <StudentParentDashboard />;
    
    case 'subject_teacher':
    case 'class_teacher':
      return <EnhancedTeacherDashboard />;
    
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