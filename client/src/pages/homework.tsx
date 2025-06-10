import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  BookOpen, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Upload,
  Eye,
  Edit,
  Trash2,
  Star,
  TrendingUp
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Assignment {
  id: number;
  title: string;
  description: string;
  subject: string;
  class: string;
  dueDate: Date;
  totalMarks: number;
  status: "active" | "closed" | "archived";
  submissionCount: number;
  totalStudents: number;
  createdAt: Date;
}

interface Submission {
  id: number;
  assignmentId: number;
  studentName: string;
  studentId: number;
  submittedAt: Date;
  grade?: number;
  feedback?: string;
  status: "submitted" | "graded" | "returned";
}

export default function Homework() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Mock data for demonstration
  const assignments: Assignment[] = [
    {
      id: 1,
      title: "Mathematics Problem Set Chapter 5",
      description: "Solve problems 1-20 from Chapter 5: Quadratic Equations. Show all working steps.",
      subject: "Mathematics",
      class: "Grade 10",
      dueDate: new Date("2024-06-15"),
      totalMarks: 50,
      status: "active",
      submissionCount: 18,
      totalStudents: 25,
      createdAt: new Date("2024-06-01"),
    },
    {
      id: 2,
      title: "Science Lab Report: Chemical Reactions",
      description: "Write a detailed lab report on the chemical reactions experiment conducted in class.",
      subject: "Chemistry",
      class: "Grade 11",
      dueDate: new Date("2024-06-20"),
      totalMarks: 75,
      status: "active",
      submissionCount: 12,
      totalStudents: 20,
      createdAt: new Date("2024-06-05"),
    },
    {
      id: 3,
      title: "English Essay: Climate Change",
      description: "Write a 1000-word essay on the impact of climate change on society.",
      subject: "English",
      class: "Grade 9",
      dueDate: new Date("2024-06-10"),
      totalMarks: 100,
      status: "closed",
      submissionCount: 30,
      totalStudents: 30,
      createdAt: new Date("2024-05-25"),
    },
  ];

  const submissions: Submission[] = [
    {
      id: 1,
      assignmentId: 1,
      studentName: "Alice Johnson",
      studentId: 1,
      submittedAt: new Date("2024-06-12"),
      grade: 45,
      feedback: "Excellent work! Clear explanations and correct solutions.",
      status: "graded",
    },
    {
      id: 2,
      assignmentId: 1,
      studentName: "Bob Smith",
      studentId: 2,
      submittedAt: new Date("2024-06-13"),
      status: "submitted",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 border-green-200";
      case "closed": return "bg-blue-100 text-blue-800 border-blue-200";
      case "archived": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSubmissionStatusColor = (status: string) => {
    switch (status) {
      case "graded": return "bg-green-100 text-green-800";
      case "submitted": return "bg-yellow-100 text-yellow-800";
      case "returned": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getDaysUntilDue = (dueDate: Date) => {
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleCreateAssignment = () => {
    toast({
      title: "Assignment Created",
      description: "New homework assignment has been created successfully",
    });
    setIsCreateModalOpen(false);
  };

  const handleViewAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsViewModalOpen(true);
  };

  const activeAssignments = assignments.filter(a => a.status === "active");
  const totalSubmissions = assignments.reduce((sum, a) => sum + a.submissionCount, 0);
  const averageSubmissionRate = assignments.length > 0 
    ? Math.round((totalSubmissions / assignments.reduce((sum, a) => sum + a.totalStudents, 0)) * 100)
    : 0;

  return (
    <div className="p-4 md:p-6 space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="animate-slide-up">
          <h1 className="text-3xl font-bold text-foreground">Homework Management</h1>
          <p className="text-muted-foreground">Create, manage, and track student assignments</p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-modern bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Assignment
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <Card className="card-modern">
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-primary" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Total Assignments</p>
                <p className="text-2xl font-bold">{assignments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-amber-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{activeAssignments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Submissions</p>
                <p className="text-2xl font-bold">{totalSubmissions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Submission Rate</p>
                <p className="text-2xl font-bold">{averageSubmissionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="assignments" className="space-y-6">
        <TabsList className="bg-muted/50 rounded-xl p-1">
          <TabsTrigger value="assignments" className="rounded-lg">All Assignments</TabsTrigger>
          <TabsTrigger value="submissions" className="rounded-lg">Submissions</TabsTrigger>
          <TabsTrigger value="grading" className="rounded-lg">Grading</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {assignments.map((assignment, index) => {
              const daysUntilDue = getDaysUntilDue(assignment.dueDate);
              const submissionRate = Math.round((assignment.submissionCount / assignment.totalStudents) * 100);
              
              return (
                <Card 
                  key={assignment.id} 
                  className="card-modern group relative overflow-hidden cursor-pointer"
                  onClick={() => handleViewAssignment(assignment)}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                          {assignment.title}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {assignment.subject} • {assignment.class}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(assignment.status)}>
                        {assignment.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {assignment.description}
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        <span>Due {format(assignment.dueDate, "MMM dd, yyyy")}</span>
                        {daysUntilDue > 0 && assignment.status === "active" && (
                          <span className="ml-2 text-amber-600">({daysUntilDue} days left)</span>
                        )}
                        {daysUntilDue < 0 && assignment.status === "active" && (
                          <span className="ml-2 text-red-600">(Overdue)</span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{assignment.submissionCount}/{assignment.totalStudents}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all duration-300"
                              style={{ width: `${submissionRate}%` }}
                            />
                          </div>
                          <span className="ml-2 text-xs font-medium">{submissionRate}%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <span className="text-sm font-medium">{assignment.totalMarks} marks</span>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-6">
          <Card className="card-modern">
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
              <CardDescription>Track and manage student submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {submissions.map((submission) => {
                  const assignment = assignments.find(a => a.id === submission.assignmentId);
                  return (
                    <div key={submission.id} className="flex items-center justify-between p-4 border border-border rounded-xl hover:bg-muted/30 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <h4 className="font-medium">{submission.studentName}</h4>
                            <p className="text-sm text-muted-foreground">{assignment?.title}</p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-4">
                          <Badge className={getSubmissionStatusColor(submission.status)}>
                            {submission.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Submitted {format(submission.submittedAt, "MMM dd, yyyy 'at' HH:mm")}
                          </span>
                          {submission.grade && (
                            <span className="text-sm font-medium">
                              Grade: {submission.grade}/{assignment?.totalMarks}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {submission.status === "submitted" && (
                          <Button size="sm">
                            <Star className="h-4 w-4 mr-1" />
                            Grade
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grading" className="space-y-6">
          <Card className="card-modern">
            <CardHeader>
              <CardTitle>Grading Dashboard</CardTitle>
              <CardDescription>Grade submissions and provide feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No submissions to grade</h3>
                <p className="text-muted-foreground">All submissions have been graded</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Assignment Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl animate-scale-in">
          <DialogHeader>
            <DialogTitle>Create New Assignment</DialogTitle>
            <DialogDescription>
              Create a new homework assignment for your students
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Assignment Title *</Label>
                <Input id="title" placeholder="Enter assignment title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="math">Mathematics</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="history">History</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="class">Class *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grade9">Grade 9</SelectItem>
                    <SelectItem value="grade10">Grade 10</SelectItem>
                    <SelectItem value="grade11">Grade 11</SelectItem>
                    <SelectItem value="grade12">Grade 12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="marks">Total Marks *</Label>
                <Input id="marks" type="number" placeholder="100" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="due-date">Due Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea 
                id="description" 
                placeholder="Provide detailed instructions for the assignment..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Attachments</Label>
              <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 text-center hover:border-muted-foreground/40 transition-colors cursor-pointer">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Drop files here or click to upload
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, DOC, DOCX up to 10MB
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAssignment}>
              Create Assignment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Assignment Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl animate-scale-in">
          {selectedAssignment && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-xl">{selectedAssignment.title}</DialogTitle>
                    <DialogDescription>
                      {selectedAssignment.subject} • {selectedAssignment.class} • {selectedAssignment.totalMarks} marks
                    </DialogDescription>
                  </div>
                  <Badge className={getStatusColor(selectedAssignment.status)}>
                    {selectedAssignment.status}
                  </Badge>
                </div>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedAssignment.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Due Date</h4>
                    <p className="text-sm text-muted-foreground">
                      {format(selectedAssignment.dueDate, "EEEE, MMMM dd, yyyy 'at' HH:mm")}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Submission Progress</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300"
                          style={{ 
                            width: `${Math.round((selectedAssignment.submissionCount / selectedAssignment.totalStudents) * 100)}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {selectedAssignment.submissionCount}/{selectedAssignment.totalStudents}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}