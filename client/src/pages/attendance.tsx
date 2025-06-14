import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  CalendarIcon, Users, UserCheck, UserX, Search, Filter, 
  Clock, CheckCircle, AlertCircle, QrCode, Smartphone, 
  MapPin, Wifi, Download, Upload, BarChart3, TrendingUp,
  Camera, Scan, MessageSquare, Plus, Eye
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Student, Attendance as AttendanceType } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AttendanceRecord {
  id: number;
  studentId: number;
  student: Student;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  checkInTime?: string;
  checkOutTime?: string;
  method: "manual" | "qr_code" | "biometric" | "mobile_app";
  location?: string;
  remarks?: string;
}

interface DailyStats {
  date: string;
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: number;
}

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isMarkAttendanceOpen, setIsMarkAttendanceOpen] = useState(false);
  const [isBulkAttendanceOpen, setIsBulkAttendanceOpen] = useState(false);
  const [attendanceView, setAttendanceView] = useState<"today" | "calendar" | "analytics">("today");
  const [bulkRollNumbers, setBulkRollNumbers] = useState("");
  const [bulkStatus, setBulkStatus] = useState<"present" | "absent" | "late" | "excused">("present");
  const { toast } = useToast();

  const { data: students = [], isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const { data: attendance = [], isLoading: attendanceLoading } = useQuery<AttendanceType[]>({
    queryKey: ["/api/attendance"],
  });

  // Mock data for demonstration - in real app this would come from API
  const mockAttendanceRecords: AttendanceRecord[] = students.map((student, index) => ({
    id: index + 1,
    studentId: student.id,
    student,
    date: format(selectedDate, "yyyy-MM-dd"),
    status: Math.random() > 0.15 ? "present" : Math.random() > 0.5 ? "late" : "absent",
    checkInTime: Math.random() > 0.15 ? `${8 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} AM` : undefined,
    checkOutTime: Math.random() > 0.15 ? `${3 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} PM` : undefined,
    method: ["manual", "qr_code", "mobile_app"][Math.floor(Math.random() * 3)] as any,
    location: "Main Campus",
    remarks: Math.random() > 0.8 ? "Late due to transport delay" : undefined
  }));

  const dailyStats: DailyStats = {
    date: format(selectedDate, "yyyy-MM-dd"),
    totalStudents: mockAttendanceRecords.length,
    present: mockAttendanceRecords.filter(r => r.status === "present").length,
    absent: mockAttendanceRecords.filter(r => r.status === "absent").length,
    late: mockAttendanceRecords.filter(r => r.status === "late").length,
    excused: mockAttendanceRecords.filter(r => r.status === "excused").length,
    attendanceRate: mockAttendanceRecords.length > 0 
      ? ((mockAttendanceRecords.filter(r => r.status === "present" || r.status === "late").length / mockAttendanceRecords.length) * 100)
      : 0
  };

  const filteredRecords = mockAttendanceRecords.filter(record => {
    const matchesSearch = record.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          record.student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter === "all" || record.student.class === classFilter;
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    return matchesSearch && matchesClass && matchesStatus;
  });

  const uniqueClasses = Array.from(new Set(students.map(s => s.class)));

  const markAttendanceMutation = useMutation({
    mutationFn: async (data: { studentId: number; status: string; remarks?: string }) => {
      return await apiRequest("POST", "/api/attendance", {
        ...data,
        date: format(selectedDate, "yyyy-MM-dd")
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      toast({
        title: "Attendance Marked",
        description: "Student attendance has been recorded successfully",
      });
    },
  });

  const bulkMarkAttendanceMutation = useMutation({
    mutationFn: async (data: { records: Array<{ studentId: number; status: string }> }) => {
      return await apiRequest("POST", "/api/attendance/bulk", {
        ...data,
        date: format(selectedDate, "yyyy-MM-dd")
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      toast({
        title: "Bulk Attendance Marked",
        description: "Attendance has been marked for all selected students",
      });
      setIsBulkAttendanceOpen(false);
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "late":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "absent":
        return <UserX className="h-4 w-4 text-red-500" />;
      case "excused":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "late":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "absent":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "excused":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "qr_code":
        return <QrCode className="h-3 w-3" />;
      case "mobile_app":
        return <Smartphone className="h-3 w-3" />;
      case "biometric":
        return <Scan className="h-3 w-3" />;
      default:
        return <Users className="h-3 w-3" />;
    }
  };

  const updateAttendanceStatus = (studentId: number, status: string, remarks?: string) => {
    markAttendanceMutation.mutate({ studentId, status, remarks });
  };

  const markAllPresent = () => {
    const records = students.map(student => ({
      studentId: student.id,
      status: "present"
    }));
    bulkMarkAttendanceMutation.mutate({ records });
  };

  const markBulkAttendance = () => {
    if (!bulkRollNumbers.trim()) {
      toast({
        title: "No Roll Numbers",
        description: "Please enter roll numbers separated by commas",
        variant: "destructive",
      });
      return;
    }

    const rollNumbers = bulkRollNumbers
      .split(',')
      .map(roll => roll.trim())
      .filter(roll => roll.length > 0);

    const validStudents = rollNumbers.map(roll => 
      students.find(student => student.rollNumber === roll)
    ).filter(Boolean);

    const invalidRollNumbers = rollNumbers.filter(roll => 
      !students.some(student => student.rollNumber === roll)
    );

    if (invalidRollNumbers.length > 0) {
      toast({
        title: "Invalid Roll Numbers",
        description: `Following roll numbers not found: ${invalidRollNumbers.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    if (validStudents.length === 0) {
      toast({
        title: "No Valid Students",
        description: "No valid students found for the entered roll numbers",
        variant: "destructive",
      });
      return;
    }

    const records = validStudents.map(student => ({
      studentId: student!.id,
      status: bulkStatus
    }));

    bulkMarkAttendanceMutation.mutate({ records });
    setBulkRollNumbers("");
  };

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Attendance Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time attendance tracking with multiple check-in methods
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Dialog open={isMarkAttendanceOpen} onOpenChange={setIsMarkAttendanceOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Mark Attendance
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Quick Attendance Entry</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Select Student</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id.toString()}>
                          {student.name} - {student.rollNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="late">Late</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                      <SelectItem value="excused">Excused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Remarks (Optional)</label>
                  <Input placeholder="Add any remarks..." />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setIsMarkAttendanceOpen(false)} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                  <Button className="flex-1">
                    Mark Attendance
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Date Selection and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-slide-up">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarIcon className="h-4 w-4" />
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Present</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{dailyStats.present}</p>
                  <p className="text-xs text-green-600 mt-1">
                    {((dailyStats.present / dailyStats.totalStudents) * 100).toFixed(1)}%
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Late</p>
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{dailyStats.late}</p>
                  <p className="text-xs text-yellow-600 mt-1">
                    {((dailyStats.late / dailyStats.totalStudents) * 100).toFixed(1)}%
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">Absent</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">{dailyStats.absent}</p>
                  <p className="text-xs text-red-600 mt-1">
                    {((dailyStats.absent / dailyStats.totalStudents) * 100).toFixed(1)}%
                  </p>
                </div>
                <UserX className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Rate</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {dailyStats.attendanceRate.toFixed(1)}%
                  </p>
                  <Progress value={dailyStats.attendanceRate} className="h-2 mt-2" />
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Check-in Methods */}
      <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Multiple Check-in Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-4 text-center">
                <QrCode className="h-8 w-8 mx-auto text-primary mb-2" />
                <h3 className="font-semibold">QR Code Scan</h3>
                <p className="text-sm text-muted-foreground">Student scans QR code</p>
                <Button size="sm" className="mt-2 w-full">Generate QR</Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-4 text-center">
                <Smartphone className="h-8 w-8 mx-auto text-primary mb-2" />
                <h3 className="font-semibold">Mobile App</h3>
                <p className="text-sm text-muted-foreground">GPS-based check-in</p>
                <Button size="sm" className="mt-2 w-full">App Settings</Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-4 text-center">
                <Scan className="h-8 w-8 mx-auto text-primary mb-2" />
                <h3 className="font-semibold">Biometric</h3>
                <p className="text-sm text-muted-foreground">Fingerprint scanning</p>
                <Button size="sm" className="mt-2 w-full">Configure</Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 mx-auto text-primary mb-2" />
                <h3 className="font-semibold">Manual Entry</h3>
                <p className="text-sm text-muted-foreground">Teacher marks attendance</p>
                <Button size="sm" className="mt-2 w-full" onClick={() => setIsBulkAttendanceOpen(true)}>
                  Bulk Mark
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by student name or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-32">
                  <Users className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {uniqueClasses.map((className) => (
                    <SelectItem key={className} value={className}>
                      {className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="excused">Excused</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Records */}
      <Card className="animate-slide-up" style={{ animationDelay: '400ms' }}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Attendance for {format(selectedDate, "MMMM d, yyyy")}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={markAllPresent}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark All Present
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsBulkAttendanceOpen(true)}>
              <Users className="w-4 h-4 mr-2" />
              Bulk Mark
            </Button>
            <Button variant="outline" size="sm">
              <MessageSquare className="w-4 h-4 mr-2" />
              Send Notifications
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {studentsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                  </div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {record.student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{record.student.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{record.student.rollNumber}</span>
                        <span>{record.student.class}</span>
                        {record.checkInTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            In: {record.checkInTime}
                          </span>
                        )}
                        {record.checkOutTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Out: {record.checkOutTime}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {getMethodIcon(record.method)}
                      <span className="capitalize">{record.method.replace('_', ' ')}</span>
                    </div>
                    <Badge className={`${getStatusColor(record.status)} flex items-center gap-1`}>
                      {getStatusIcon(record.status)}
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant={record.status === "present" ? "default" : "outline"}
                        onClick={() => updateAttendanceStatus(record.studentId, "present")}
                      >
                        Present
                      </Button>
                      <Button
                        size="sm"
                        variant={record.status === "absent" ? "destructive" : "outline"}
                        onClick={() => updateAttendanceStatus(record.studentId, "absent")}
                      >
                        Absent
                      </Button>
                      <Button
                        size="sm"
                        variant={record.status === "late" ? "secondary" : "outline"}
                        onClick={() => updateAttendanceStatus(record.studentId, "late")}
                      >
                        Late
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredRecords.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No attendance records found for the selected criteria</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Attendance Modal */}
      <Dialog open={isBulkAttendanceOpen} onOpenChange={setIsBulkAttendanceOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulk Attendance Marking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Quick Actions:</span>
              <div className="flex gap-2">
                <Button size="sm" onClick={markAllPresent}>Mark All Present</Button>
                <Button size="sm" variant="outline">Mark All Absent</Button>
              </div>
            </div>
            
            {/* Bulk Roll Number Input */}
            <div className="border-2 border-dashed border-muted rounded-lg p-4 bg-muted/30">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Bulk Mark by Roll Numbers</label>
                  <div className="text-xs text-muted-foreground">
                    Enter comma-separated roll numbers
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <Input
                      placeholder="e.g., 2025589, 2025633, 2025906..."
                      value={bulkRollNumbers}
                      onChange={(e) => setBulkRollNumbers(e.target.value)}
                      className="w-full"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      Separate multiple roll numbers with commas
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Select value={bulkStatus} onValueChange={(value: any) => setBulkStatus(value)}>
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                        <SelectItem value="late">Late</SelectItem>
                        <SelectItem value="excused">Excused</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button 
                      onClick={markBulkAttendance}
                      disabled={!bulkRollNumbers.trim() || bulkMarkAttendanceMutation.isPending}
                      size="sm"
                    >
                      {bulkMarkAttendanceMutation.isPending ? "Marking..." : "Mark"}
                    </Button>
                  </div>
                </div>
                
                {bulkRollNumbers.trim() && (
                  <div className="text-xs text-muted-foreground">
                    <strong>Preview:</strong> Will mark {bulkRollNumbers.split(',').filter(r => r.trim()).length} roll numbers as {bulkStatus}
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
              {students.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                      {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.rollNumber} • {student.class}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline">Present</Button>
                    <Button size="sm" variant="outline">Late</Button>
                    <Button size="sm" variant="outline">Absent</Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsBulkAttendanceOpen(false)}>
                Cancel
              </Button>
              <Button>
                Save Attendance
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}