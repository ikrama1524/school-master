import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Calendar, Users, BookOpen, BarChart3, Clock, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

interface Notice {
  id: number;
  title: string;
  content: string;
  priority: string;
  createdAt: string;
}

interface TimetableEntry {
  id: number;
  day: string;
  period: string;
  subject: string;
  teacher: string;
  startTime: string;
  endTime: string;
  class: string;
  section: string;
}

interface Attendance {
  id: number;
  studentId: number;
  date: string;
  status: string;
}

export function EnhancedTeacherDashboard() {
  const { user } = useAuth();
  
  const { data: timetable = [] } = useQuery<TimetableEntry[]>({
    queryKey: ["/api/timetables"],
  });

  const { data: attendance = [] } = useQuery<Attendance[]>({
    queryKey: ["/api/attendance"],
  });

  const { data: notices = [] } = useQuery<Notice[]>({
    queryKey: ["/api/notices"],
  });

  // Get today's timetable for this teacher
  const today = format(new Date(), 'EEEE').toLowerCase();
  const todayClasses = timetable.filter(t => 
    t.day.toLowerCase() === today && t.teacher === user?.name
  );

  // Calculate attendance statistics for today
  const todayDate = format(new Date(), 'yyyy-MM-dd');
  const todayAttendance = attendance.filter(a => a.date === todayDate);
  const presentToday = todayAttendance.filter(a => a.status === 'present').length;
  const totalStudentsToday = todayAttendance.length;

  // Calculate overall attendance rate
  const totalAttendance = attendance.length;
  const totalPresent = attendance.filter(a => a.status === 'present').length;
  const attendanceRate = totalAttendance > 0 ? Math.round((totalPresent / totalAttendance) * 100) : 0;

  // Get recent notices (last 3)
  const recentNotices = notices.slice(0, 3);

  // Mock data for assignments and grades
  const pendingAssignments = 3;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Classes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayClasses.length}</div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(), 'EEEE, MMM d')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{presentToday}/{totalStudentsToday}</div>
            <p className="text-xs text-muted-foreground">Present today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Assignments</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAssignments}</div>
            <p className="text-xs text-muted-foreground">To be graded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">Overall rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayClasses.length > 0 ? (
              <div className="space-y-3">
                {todayClasses.map((classItem) => (
                  <div key={classItem.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{classItem.subject} - Grade {classItem.class}{classItem.section}</p>
                      <p className="text-sm text-muted-foreground">{classItem.period}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{classItem.startTime} - {classItem.endTime}</p>
                      <Badge variant="outline">{classItem.period}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No classes scheduled for today</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              School Notices
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentNotices.length > 0 ? (
              <div className="space-y-3">
                {recentNotices.map((notice) => (
                  <div key={notice.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{notice.title}</h4>
                      <Badge variant={notice.priority === 'high' ? 'destructive' : notice.priority === 'medium' ? 'default' : 'secondary'}>
                        {notice.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {notice.content.substring(0, 100)}...
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(new Date(notice.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No recent notices</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {user?.role === 'class_teacher' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Class Teacher Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{totalStudentsToday}</div>
                <p className="text-sm text-muted-foreground">Students in Class</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">{attendanceRate}%</div>
                <p className="text-sm text-muted-foreground">Class Attendance</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{pendingAssignments}</div>
                <p className="text-sm text-muted-foreground">Pending Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}