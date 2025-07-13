import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Eye, Trash2, User, Calendar, Phone, Mail, MapPin, GraduationCap, FileText, DollarSign, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Student, Fee, Attendance } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Students() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const { toast } = useToast();

  const { data: students = [], isLoading } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const { data: fees = [] } = useQuery<Fee[]>({
    queryKey: ["/api/fees"],
  });

  const { data: attendance = [] } = useQuery<Attendance[]>({
    queryKey: ["/api/attendance"],
  });

  const deleteStudentMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/students/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      toast({
        title: "Success",
        description: "Student deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete student",
        variant: "destructive",
      });
    },
  });

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.class.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      deleteStudentMutation.mutate(id);
    }
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  const getStudentFees = (studentId: number) => {
    return fees.filter(fee => fee.studentId === studentId);
  };

  const getStudentAttendance = (studentId: number) => {
    return attendance.filter(att => att.studentId === studentId);
  };

  const calculateAttendanceStats = (studentId: number) => {
    const studentAttendance = getStudentAttendance(studentId);
    const totalDays = studentAttendance.length;
    const presentDays = studentAttendance.filter(att => att.status === "present").length;
    const lateDays = studentAttendance.filter(att => att.status === "late").length;
    const attendanceRate = totalDays > 0 ? ((presentDays + lateDays) / totalDays) * 100 : 0;
    
    return {
      totalDays,
      presentDays,
      lateDays,
      attendanceRate: Math.round(attendanceRate)
    };
  };

  const calculateFeeStats = (studentId: number) => {
    const studentFees = getStudentFees(studentId);
    const totalAmount = studentFees.reduce((sum, fee) => sum + parseFloat(fee.amount), 0);
    const paidAmount = studentFees.filter(fee => fee.status === "paid").reduce((sum, fee) => sum + parseFloat(fee.amount), 0);
    const pendingAmount = totalAmount - paidAmount;
    
    return {
      totalAmount,
      paidAmount,
      pendingAmount,
      totalFees: studentFees.length
    };
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading students...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--edu-text)]">Students</h1>
          <p className="text-gray-600">Manage student information and records</p>
        </div>
        <div className="text-sm text-muted-foreground">
          Students are automatically added when admission applications are approved
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Directory</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search students by name, roll number, or class..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No students found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-[var(--edu-text)]">{student.name}</h3>
                      <p className="text-sm text-gray-500">
                        Class {student.class}-{student.section} • Roll No: {student.rollNumber}
                      </p>
                      <p className="text-sm text-gray-500">{student.parentName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={student.isActive ? "default" : "secondary"}>
                      {student.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => handleViewStudent(student)}>
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(student.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Student Details: {selectedStudent?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedStudent && (
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="academic">Academic</TabsTrigger>
                <TabsTrigger value="fees">Fees</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
              </TabsList>
              
              <TabsContent value="personal" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Full Name</label>
                          <p className="text-sm">{selectedStudent.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                          <p className="text-sm">{selectedStudent.dateOfBirth ? format(new Date(selectedStudent.dateOfBirth), 'PPP') : 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Gender</label>
                          <p className="text-sm capitalize">{selectedStudent.gender || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Blood Group</label>
                          <p className="text-sm">{selectedStudent.bloodGroup || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Nationality</label>
                          <p className="text-sm">{selectedStudent.nationality || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Religion</label>
                          <p className="text-sm">{selectedStudent.religion || 'N/A'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Phone className="w-5 h-5" />
                        Contact & Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Address</label>
                        <p className="text-sm">{selectedStudent.address || 'N/A'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">City</label>
                          <p className="text-sm">{selectedStudent.city || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">State</label>
                          <p className="text-sm">{selectedStudent.state || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Email</label>
                          <p className="text-sm">{selectedStudent.email || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Phone</label>
                          <p className="text-sm">{selectedStudent.phone || 'N/A'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Parent Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Parent Name</label>
                        <p className="text-sm">{selectedStudent.parentName || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Occupation</label>
                        <p className="text-sm">{selectedStudent.parentOccupation || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Income</label>
                        <p className="text-sm">{selectedStudent.parentIncome || 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="academic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <GraduationCap className="w-5 h-5" />
                        Academic Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Roll Number</label>
                          <p className="text-sm font-medium">{selectedStudent.rollNumber}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Admission Number</label>
                          <p className="text-sm">{selectedStudent.admissionNumber || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Class</label>
                          <p className="text-sm">{selectedStudent.class}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Division</label>
                          <p className="text-sm">{selectedStudent.division || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Section</label>
                          <p className="text-sm">{selectedStudent.section || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Status</label>
                          <Badge variant={selectedStudent.isActive ? "default" : "secondary"}>
                            {selectedStudent.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Previous School
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">School Name</label>
                          <p className="text-sm">{selectedStudent.previousSchool || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Previous Class</label>
                          <p className="text-sm">{selectedStudent.previousClass || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Percentage</label>
                          <p className="text-sm">{selectedStudent.percentage || 'N/A'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="fees" className="space-y-4">
                {(() => {
                  const studentFees = getStudentFees(selectedStudent.id);
                  const feeStats = calculateFeeStats(selectedStudent.id);
                  
                  return (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-500">Total Fees</p>
                                <p className="text-2xl font-bold">₹{feeStats.totalAmount}</p>
                              </div>
                              <DollarSign className="w-8 h-8 text-blue-500" />
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-500">Paid Amount</p>
                                <p className="text-2xl font-bold text-green-600">₹{feeStats.paidAmount}</p>
                              </div>
                              <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-500">Pending Amount</p>
                                <p className="text-2xl font-bold text-red-600">₹{feeStats.pendingAmount}</p>
                              </div>
                              <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>Fee History</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {studentFees.length > 0 ? (
                            <div className="space-y-3">
                              {studentFees.map((fee) => (
                                <div key={fee.id} className="flex items-center justify-between p-3 border rounded">
                                  <div>
                                    <p className="font-medium">{fee.feeType}</p>
                                    <p className="text-sm text-gray-500">Due: {format(new Date(fee.dueDate), 'PPP')}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium">₹{fee.amount}</p>
                                    <Badge variant={fee.status === 'paid' ? 'default' : fee.status === 'pending' ? 'secondary' : 'destructive'}>
                                      {fee.status}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-center text-gray-500 py-8">No fees assigned yet</p>
                          )}
                        </CardContent>
                      </Card>
                    </>
                  );
                })()}
              </TabsContent>
              
              <TabsContent value="attendance" className="space-y-4">
                {(() => {
                  const attendanceStats = calculateAttendanceStats(selectedStudent.id);
                  const studentAttendance = getStudentAttendance(selectedStudent.id);
                  
                  return (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-500">Total Days</p>
                                <p className="text-2xl font-bold">{attendanceStats.totalDays}</p>
                              </div>
                              <Calendar className="w-8 h-8 text-blue-500" />
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-500">Present Days</p>
                                <p className="text-2xl font-bold text-green-600">{attendanceStats.presentDays}</p>
                              </div>
                              <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-500">Late Days</p>
                                <p className="text-2xl font-bold text-yellow-600">{attendanceStats.lateDays}</p>
                              </div>
                              <Clock className="w-8 h-8 text-yellow-500" />
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-500">Attendance Rate</p>
                                <p className="text-2xl font-bold">{attendanceStats.attendanceRate}%</p>
                              </div>
                              <User className="w-8 h-8 text-purple-500" />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>Recent Attendance</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {studentAttendance.length > 0 ? (
                            <div className="space-y-3">
                              {studentAttendance.slice(0, 10).map((att) => (
                                <div key={att.id} className="flex items-center justify-between p-3 border rounded">
                                  <div>
                                    <p className="font-medium">{format(new Date(att.date), 'PPP')}</p>
                                    {att.remarks && <p className="text-sm text-gray-500">{att.remarks}</p>}
                                  </div>
                                  <Badge variant={att.status === 'present' ? 'default' : att.status === 'late' ? 'secondary' : 'destructive'}>
                                    {att.status}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-center text-gray-500 py-8">No attendance records found</p>
                          )}
                        </CardContent>
                      </Card>
                    </>
                  );
                })()}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
