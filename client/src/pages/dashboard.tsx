import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, GraduationCap, BookOpen, Calendar, 
  CreditCard, TrendingUp, Bell, CheckCircle, 
  AlertTriangle, Clock, DollarSign, FileText,
  UserPlus, CalendarCheck, BookMarked, Receipt
} from "lucide-react";
import { Student, Notice, Fee, Teacher } from "@shared/schema";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: stats = {}, isLoading: statsLoading } = useQuery<{
    totalStudents: number;
    totalTeachers: number;
    attendanceRate: number;
    feeCollection: number;
    pendingFees: number;
  }>({
    queryKey: ["/api/stats"],
  });

  const { data: students = [], isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const { data: teachers = [], isLoading: teachersLoading } = useQuery<Teacher[]>({
    queryKey: ["/api/teachers"],
  });

  const { data: noticesResponse = { notices: [] }, isLoading: noticesLoading } = useQuery<{ notices: Notice[] } | Notice[]>({
    queryKey: ["/api/notices"],
  });
  
  // Extract notices array from response
  const notices: Notice[] = Array.isArray(noticesResponse) ? noticesResponse : (noticesResponse.notices || []);

  const { data: fees = [], isLoading: feesLoading } = useQuery<Fee[]>({
    queryKey: ["/api/fees"],
  });

  // Calculate dashboard metrics
  const pendingFees = fees.filter(fee => fee.status === "pending").length;
  const paidFees = fees.filter(fee => fee.status === "paid").length;
  const totalFeeAmount = fees.reduce((sum, fee) => sum + parseFloat(fee.amount.toString()), 0);
  const paidFeeAmount = fees.filter(fee => fee.status === "paid").reduce((sum, fee) => sum + parseFloat(fee.amount.toString()), 0);
  const feeCollectionRate = totalFeeAmount > 0 ? (paidFeeAmount / totalFeeAmount) * 100 : 0;

  const recentStudents = students
    .sort((a, b) => {
      const dateA = a.admissionDate ? new Date(a.admissionDate).getTime() : 0;
      const dateB = b.admissionDate ? new Date(b.admissionDate).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  const urgentNotices = notices.filter((notice: Notice) => 
    notice.priority === "high" || notice.title.toLowerCase().includes("urgent")
  ).slice(0, 3);

  const quickActions = [
    { title: "Add Student", icon: UserPlus, href: "/students", color: "bg-blue-500", description: "Register new admission" },
    { title: "Mark Attendance", icon: CalendarCheck, href: "/attendance", color: "bg-green-500", description: "Daily attendance tracking" },
    { title: "Create Assignment", icon: BookMarked, href: "/homework", color: "bg-purple-500", description: "Assign homework tasks" },
    { title: "Fee Collection", icon: Receipt, href: "/fees", color: "bg-orange-500", description: "Process payments" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            School Management Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening at your school today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="hidden md:flex">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </Button>
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Students</p>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                  {statsLoading ? "..." : stats?.totalStudents || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Teachers</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                  {statsLoading ? "..." : stats?.totalTeachers || 0}
                </p>
              </div>
              <GraduationCap className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Attendance Rate</p>
                <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                  {statsLoading ? "..." : `${stats?.attendanceRate || 0}%`}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Fee Collection</p>
                <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                  {feesLoading ? "..." : `${feeCollectionRate.toFixed(1)}%`}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-primary/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${action.color}`}>
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{action.title}</h3>
                        <p className="text-xs text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
        {/* Recent Students */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Admissions
            </CardTitle>
            <Link href="/students">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {studentsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 animate-pulse">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {recentStudents.length > 0 ? recentStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.class} • {student.rollNumber}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : 'N/A'}
                    </Badge>
                  </div>
                )) : (
                  <p className="text-center text-muted-foreground py-4">No recent admissions</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notices & Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Notices
            </CardTitle>
          </CardHeader>
          <CardContent>
            {noticesLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {notices.slice(0, 4).map((notice: Notice) => (
                  <div key={notice.id} className="p-3 rounded-lg border bg-card hover:bg-accent transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm leading-tight">{notice.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notice.content}</p>
                      </div>
                      {notice.priority === "high" && (
                        <AlertTriangle className="h-4 w-4 text-orange-500 ml-2 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="outline" className="text-xs">
                        {new Date(notice.createdAt!).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                ))}
                {notices.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No recent notices</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fee Collection Overview */}
      <Card className="animate-slide-up" style={{ animationDelay: '400ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Fee Collection Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Collection Progress</span>
                <span className="font-medium">{feeCollectionRate.toFixed(1)}%</span>
              </div>
              <Progress value={feeCollectionRate} className="h-2" />
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{paidFees}</p>
              <p className="text-sm text-muted-foreground">Paid</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{pendingFees}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
