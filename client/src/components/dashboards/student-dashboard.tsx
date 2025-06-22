import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ClipboardList, BarChart3, CreditCard, Bell } from "lucide-react";

export function StudentDashboard() {
  const { data: stats } = useQuery({ queryKey: ['/api/stats'] });
  const { data: notices } = useQuery({ queryKey: ['/api/notices'] });
  const { data: fees } = useQuery({ queryKey: ['/api/fees'] });
  const { data: timetable } = useQuery({ queryKey: ['/api/timetables'] });

  const todayTimetable = timetable?.filter((entry: any) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return entry.day === today;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Classes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayTimetable?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Scheduled for today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.attendanceRate || 0}%</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats?.pendingFees || 0}</div>
            <p className="text-xs text-muted-foreground">Due this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Result</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">Last exam average</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Notices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notices?.slice(0, 5).map((notice: any) => (
                <div key={notice.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{notice.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{notice.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notice.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground">No notices available</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Timetable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayTimetable?.map((entry: any) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h4 className="font-medium text-sm">{entry.subject}</h4>
                    <p className="text-xs text-muted-foreground">{entry.teacher}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{entry.startTime} - {entry.endTime}</p>
                    <p className="text-xs text-muted-foreground">{entry.room}</p>
                  </div>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground">No classes scheduled for today</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}