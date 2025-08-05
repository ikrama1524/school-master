import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useMobile } from "@/hooks/use-mobile";
import MobileShare from "@/components/mobile/mobile-share";
import { Student, Fee, Attendance, Result, Notice } from "@shared/schema";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  BookOpen, 
  Bell,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail
} from "lucide-react";

export default function ParentMobile() {
  const { user } = useAuth();
  const deviceInfo = useMobile();

  // Get children data for parent
  const { data: children = [] } = useQuery<Student[]>({
    queryKey: ["/api/students/children"],
  });

  const { data: allFees = [] } = useQuery<Fee[]>({
    queryKey: ["/api/fees/children"],
  });

  const { data: allAttendance = [] } = useQuery<Attendance[]>({
    queryKey: ["/api/attendance/children"],
  });

  const { data: allResults = [] } = useQuery<Result[]>({
    queryKey: ["/api/results/children"],
  });

  const { data: notices = [] } = useQuery<Notice[]>({
    queryKey: ["/api/notices/parent"],
  });

  // Calculate overall metrics
  const totalPendingFees = allFees
    .filter(fee => fee.status === "pending")
    .reduce((sum, fee) => sum + parseFloat(fee.amount.toString()), 0);

  const overallAttendance = children.map(child => {
    const childAttendance = allAttendance.filter(a => a.studentId === child.id);
    const rate = childAttendance.length > 0 
      ? (childAttendance.filter(a => a.status === "present").length / childAttendance.length) * 100 
      : 0;
    return { ...child, attendanceRate: rate };
  });

  const urgentNotices = notices.filter(n => n.priority === "high").slice(0, 3);
  const childrenWithIssues = overallAttendance.filter(child => 
    child.attendanceRate < 75 || allFees.some(fee => fee.studentId === child.id && fee.status === "pending")
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-primary text-white p-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Parent Portal</h1>
            <p className="text-sm opacity-90">
              {children.length} {children.length === 1 ? 'Child' : 'Children'} Enrolled
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Pending Fees</p>
                  <p className="text-xl font-bold">${totalPendingFees}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Attention Needed</p>
                  <p className="text-xl font-bold">{childrenWithIssues.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Children Overview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>My Children</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {children.map((child) => {
              const childAttendance = overallAttendance.find(c => c.id === child.id)?.attendanceRate || 0;
              const childPendingFees = allFees
                .filter(fee => fee.studentId === child.id && fee.status === "pending")
                .reduce((sum, fee) => sum + parseFloat(fee.amount.toString()), 0);
              const hasIssues = childAttendance < 75 || childPendingFees > 0;

              return (
                <div key={child.id} className={`p-3 rounded-lg border ${hasIssues ? 'border-orange-200 bg-orange-50 dark:bg-orange-950' : 'border-gray-200 bg-gray-50 dark:bg-gray-800'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{child.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Class {child.class} • Roll: {child.rollNumber}
                      </p>
                    </div>
                    {hasIssues && (
                      <Badge variant="destructive" className="text-xs">
                        Attention
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Attendance</p>
                      <p className={`font-medium ${childAttendance >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                        {childAttendance.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Pending Fees</p>
                      <p className={`font-medium ${childPendingFees === 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${childPendingFees}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 flex space-x-2">
                    <MobileShare
                      title={`${child.name}'s Report`}
                      text={`Attendance: ${childAttendance.toFixed(1)}%, Pending Fees: $${childPendingFees}`}
                    >
                      <Button variant="ghost" size="sm" className="text-xs h-6">
                        Share Report
                      </Button>
                    </MobileShare>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Urgent Fees */}
        {totalPendingFees > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center space-x-2">
                <DollarSign className="w-4 h-4" />
                <span>Pending Payments</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {allFees
                .filter(fee => fee.status === "pending")
                .slice(0, 4)
                .map((fee) => {
                  const child = children.find(c => c.id === fee.studentId);
                  return (
                    <div key={fee.id} className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{fee.feeType}</p>
                        <p className="text-xs text-muted-foreground">
                          {child?.name} • Due: {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : 'ASAP'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">${fee.amount}</p>
                        <MobileShare
                          title="Fee Payment Required"
                          text={`${child?.name} - ${fee.feeType}: $${fee.amount}`}
                        >
                          <Button variant="ghost" size="sm" className="text-xs h-6">
                            Share
                          </Button>
                        </MobileShare>
                      </div>
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        )}

        {/* Important Notices */}
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
                <Phone className="w-5 h-5" />
                <span className="text-xs">Contact School</span>
              </Button>
              
              <Button variant="outline" className="h-auto p-3 flex flex-col space-y-1">
                <Calendar className="w-5 h-5" />
                <span className="text-xs">View Calendar</span>
              </Button>
              
              <MobileShare
                title="Family Report Summary"
                text={`Total pending fees: $${totalPendingFees}. ${childrenWithIssues.length} children need attention.`}
                className="h-auto p-3 flex flex-col space-y-1 border rounded-lg cursor-pointer hover:bg-muted/50"
              >
                <TrendingUp className="w-5 h-5" />
                <span className="text-xs">Share Summary</span>
              </MobileShare>
              
              <Button variant="outline" className="h-auto p-3 flex flex-col space-y-1">
                <Mail className="w-5 h-5" />
                <span className="text-xs">Messages</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">School Emergency Contact</p>
              <Button className="w-full">
                <Phone className="w-4 h-4 mr-2" />
                Call School Office
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}