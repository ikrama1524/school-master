import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Calendar, BarChart3, CreditCard, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Notice {
  id: number;
  title: string;
  content: string;
  priority: string;
  createdAt: string;
}

interface Fee {
  id: number;
  feeType: string;
  amount: number;
  dueDate: string;
  status: string;
}

interface Attendance {
  id: number;
  date: string;
  status: string;
}

interface TimetableEntry {
  id: number;
  day: string;
  period: string;
  subject: string;
  teacher: string;
  startTime: string;
  endTime: string;
}

export function StudentParentDashboard() {
  const { data: notices = [] } = useQuery<Notice[]>({
    queryKey: ["/api/notices"],
  });

  const { data: fees = [] } = useQuery<Fee[]>({
    queryKey: ["/api/fees"],
  });

  const { data: attendance = [] } = useQuery<Attendance[]>({
    queryKey: ["/api/attendance"],
  });

  const { data: timetable = [] } = useQuery<TimetableEntry[]>({
    queryKey: ["/api/timetables"],
  });

  // Calculate attendance rate
  const totalDays = attendance.length;
  const presentDays = attendance.filter(a => a.status === 'present').length;
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  // Get pending fees
  const pendingFees = fees.filter(f => f.status === 'pending' || f.status === 'overdue');
  const totalPendingAmount = pendingFees.reduce((sum, fee) => sum + fee.amount, 0);

  // Get today's timetable
  const today = format(new Date(), 'EEEE').toLowerCase();
  const todayTimetable = timetable.filter(t => t.day.toLowerCase() === today);

  // Get recent notices
  const recentNotices = notices.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Attendance Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">
              {presentDays} out of {totalDays} days
            </p>
          </CardContent>
        </Card>

        {/* Pending Fees */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalPendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {pendingFees.length} pending payments
            </p>
          </CardContent>
        </Card>

        {/* Today's Classes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Classes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayTimetable.length}</div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(), 'EEEE, MMM d')}
            </p>
          </CardContent>
        </Card>

        {/* Notices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Notices</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notices.length}</div>
            <p className="text-xs text-muted-foreground">
              Total announcements
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Timetable */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayTimetable.length > 0 ? (
              <div className="space-y-3">
                {todayTimetable.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{entry.subject}</p>
                      <p className="text-sm text-muted-foreground">{entry.teacher}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{entry.startTime} - {entry.endTime}</p>
                      <p className="text-xs text-muted-foreground">{entry.period}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No classes scheduled for today</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Notices */}
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
                {recentNotices.map((notice) => (
                  <div key={notice.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{notice.title}</h4>
                      <Badge variant={notice.priority === 'high' ? 'destructive' : notice.priority === 'medium' ? 'default' : 'secondary'}>
                        {notice.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{notice.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(new Date(notice.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No recent notices</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Fees Details */}
      {pendingFees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Pending Fee Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingFees.map((fee) => (
                <div key={fee.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{fee.feeType}</p>
                    <p className="text-sm text-muted-foreground">
                      Due: {format(new Date(fee.dueDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">₹{fee.amount.toLocaleString()}</p>
                    <Badge variant={fee.status === 'overdue' ? 'destructive' : 'secondary'}>
                      {fee.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}