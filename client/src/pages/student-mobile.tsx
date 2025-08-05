import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useMobile } from "@/hooks/use-mobile";
import MobileShare, { shareAttendanceReport, shareFeeReceipt } from "@/components/mobile/mobile-share";
import { Student, Fee, Attendance, Result, Notice } from "@shared/schema";
import { 
  User, 
  Calendar, 
  DollarSign, 
  BookOpen, 
  Bell,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react";

export default function StudentMobile() {
  const { user } = useAuth();
  const deviceInfo = useMobile();

  // Get student data based on logged-in user
  const { data: student } = useQuery<Student>({
    queryKey: ["/api/students/profile"],
  });

  const { data: fees = [] } = useQuery<Fee[]>({
    queryKey: ["/api/fees/student"],
  });

  const { data: attendance = [] } = useQuery<Attendance[]>({
    queryKey: ["/api/attendance/student"],
  });

  const { data: results = [] } = useQuery<Result[]>({
    queryKey: ["/api/results/student"],
  });

  const { data: notices = [] } = useQuery<Notice[]>({
    queryKey: ["/api/notices/student"],
  });

  // Calculate metrics
  const pendingFees = fees.filter(fee => fee.status === "pending");
  const totalFeeAmount = pendingFees.reduce((sum, fee) => sum + parseFloat(fee.amount.toString()), 0);
  const attendanceRate = attendance.length > 0 
    ? (attendance.filter(a => a.status === "present").length / attendance.length) * 100 
    : 0;
  const latestResult = results[0];
  const urgentNotices = notices.filter(n => n.priority === "high").slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-primary text-white p-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">{student?.name || user?.username}</h1>
            <p className="text-sm opacity-90">
              {student?.rollNumber ? `Roll: ${student.rollNumber}` : "Student Portal"}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Attendance</p>
                  <p className="text-xl font-bold">{attendanceRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Pending Fees</p>
                  <p className="text-xl font-bold">${totalFeeAmount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Attendance</span>
              </span>
              <MobileShare
                title="Attendance Report"
                text={`My attendance rate: ${attendanceRate.toFixed(1)}%`}
                className="text-sm"
              >
                <Button variant="ghost" size="sm">Share</Button>
              </MobileShare>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">This Month</span>
              <Badge variant={attendanceRate >= 75 ? "default" : "destructive"}>
                {attendanceRate.toFixed(1)}%
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${Math.min(attendanceRate, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Present: {attendance.filter(a => a.status === "present").length}</span>
              <span>Total: {attendance.length}</span>
            </div>
          </CardContent>
        </Card>

        {/* Fees Card */}
        {pendingFees.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center space-x-2">
                <DollarSign className="w-4 h-4" />
                <span>Pending Fees</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingFees.slice(0, 3).map((fee) => (
                <div key={fee.id} className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{fee.feeType}</p>
                    <p className="text-xs text-muted-foreground">
                      Due: {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : 'ASAP'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-600">${fee.amount}</p>
                    <MobileShare
                      title="Fee Payment Required"
                      text={`${fee.feeType}: $${fee.amount} due ${fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : 'ASAP'}`}
                    >
                      <Button variant="ghost" size="sm" className="text-xs h-6">
                        Share
                      </Button>
                    </MobileShare>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Latest Result */}
        {latestResult && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center space-x-2">
                <BookOpen className="w-4 h-4" />
                <span>Latest Result</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div>
                  <p className="font-medium">{latestResult.examType}</p>
                  <p className="text-sm text-muted-foreground">{latestResult.subject}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    {latestResult.marksObtained}/{latestResult.totalMarks}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {((latestResult.marksObtained / latestResult.totalMarks) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notices */}
        {urgentNotices.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center space-x-2">
                <Bell className="w-4 h-4" />
                <span>Important Notices</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {urgentNotices.map((notice) => (
                <div key={notice.id} className="p-3 border-l-4 border-red-500 bg-red-50 dark:bg-red-950">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{notice.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notice.content}
                      </p>
                    </div>
                    <Badge variant="destructive" className="ml-2 text-xs">
                      {notice.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-auto p-3 flex flex-col space-y-1">
                <Calendar className="w-5 h-5" />
                <span className="text-xs">View Timetable</span>
              </Button>
              
              <Button variant="outline" className="h-auto p-3 flex flex-col space-y-1">
                <BookOpen className="w-5 h-5" />
                <span className="text-xs">Homework</span>
              </Button>
              
              <MobileShare
                title="Student Performance Summary"
                text={`Attendance: ${attendanceRate.toFixed(1)}%, Pending Fees: $${totalFeeAmount}`}
                className="h-auto p-3 flex flex-col space-y-1 border rounded-lg cursor-pointer hover:bg-muted/50"
              >
                <TrendingUp className="w-5 h-5" />
                <span className="text-xs">Share Report</span>
              </MobileShare>
              
              <Button variant="outline" className="h-auto p-3 flex flex-col space-y-1">
                <Bell className="w-5 h-5" />
                <span className="text-xs">Notifications</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}