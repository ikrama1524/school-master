import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Award, 
  TrendingUp, 
  BookOpen,
  Users,
  Calendar,
  Edit,
  Eye,
  FileText,
  BarChart3
} from "lucide-react";
import type { Student, Subject, Teacher, Semester, SemesterResult } from "@shared/schema";

interface Result {
  id: number;
  studentId: number;
  student: Student;
  subjectId: number;
  subject: Subject;
  examType: string;
  examDate: Date;
  maxMarks: number;
  obtainedMarks: number;
  grade: string;
  percentage: number;
  remarks?: string;
  createdAt: Date;
}

interface Exam {
  id: number;
  name: string;
  type: "unit_test" | "midterm" | "final" | "assignment" | "project" | "practical";
  startDate: Date;
  endDate: Date;
  class: string;
  section: string;
  subjects: number[];
  maxMarks: number;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  createdBy: number;
}

export default function Results() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("results");
  const [showAddResult, setShowAddResult] = useState(false);
  const [showAddExam, setShowAddExam] = useState(false);
  const [showAddSemester, setShowAddSemester] = useState(false);
  const [showAddSemesterResult, setShowAddSemesterResult] = useState(false);
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedExamType, setSelectedExamType] = useState("all");
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // New result form
  const [newResult, setNewResult] = useState({
    studentId: "",
    subjectId: "",
    examType: "",
    examDate: "",
    maxMarks: "",
    obtainedMarks: "",
    remarks: ""
  });

  // New exam form
  const [newExam, setNewExam] = useState({
    name: "",
    type: "unit_test",
    startDate: "",
    endDate: "",
    class: "",
    section: "",
    maxMarks: ""
  });

  // New semester form
  const [newSemester, setNewSemester] = useState({
    name: "",
    academicYear: "",
    startDate: "",
    endDate: "",
    isActive: false
  });

  // New semester result form
  const [newSemesterResult, setNewSemesterResult] = useState({
    studentId: "",
    semesterId: "",
    subjectId: "",
    internalMarks: "",
    externalMarks: "",
    totalMarks: "",
    obtainedMarks: "",
    gpa: "",
    remarks: ""
  });

  const classes = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"];
  const sections = ["A", "B", "C"];
  const examTypes = ["Unit Test", "Midterm", "Final", "Assignment", "Project", "Practical"];

  // Queries
  const { data: results = [], isLoading: resultsLoading } = useQuery({
    queryKey: ["/api/results"],
  });

  const { data: exams = [], isLoading: examsLoading } = useQuery({
    queryKey: ["/api/exams"],
  });

  const { data: students = [] } = useQuery({
    queryKey: ["/api/students"],
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["/api/subjects"],
  });

  const { data: semesters = [], isLoading: semestersLoading } = useQuery({
    queryKey: ["/api/semesters"],
  });

  const { data: semesterResults = [], isLoading: semesterResultsLoading } = useQuery({
    queryKey: ["/api/semester-results"],
  });

  const { data: activeSemester } = useQuery({
    queryKey: ["/api/semesters/active"],
  });

  // Mutations
  const addResultMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/results", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/results"] });
      toast({
        title: "Success",
        description: "Result added successfully",
      });
      setNewResult({
        studentId: "",
        subjectId: "",
        examType: "",
        examDate: "",
        maxMarks: "",
        obtainedMarks: "",
        remarks: ""
      });
      setShowAddResult(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add result",
        variant: "destructive",
      });
    },
  });

  const addExamMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/exams", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
      toast({
        title: "Success",
        description: "Exam scheduled successfully",
      });
      setNewExam({
        name: "",
        type: "unit_test",
        startDate: "",
        endDate: "",
        class: "",
        section: "",
        maxMarks: ""
      });
      setShowAddExam(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to schedule exam",
        variant: "destructive",
      });
    },
  });

  const addSemesterMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/semesters", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/semesters"] });
      toast({
        title: "Success",
        description: "Semester created successfully",
      });
      setNewSemester({
        name: "",
        academicYear: "",
        startDate: "",
        endDate: "",
        isActive: false
      });
      setShowAddSemester(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create semester",
        variant: "destructive",
      });
    },
  });

  const addSemesterResultMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/semester-results", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/semester-results"] });
      toast({
        title: "Success",
        description: "Semester result added successfully",
      });
      setNewSemesterResult({
        studentId: "",
        semesterId: "",
        subjectId: "",
        internalMarks: "",
        externalMarks: "",
        totalMarks: "",
        obtainedMarks: "",
        gpa: "",
        remarks: ""
      });
      setShowAddSemesterResult(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add semester result",
        variant: "destructive",
      });
    },
  });

  // Helper functions
  const calculateGrade = (percentage: number): string => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C";
    if (percentage >= 40) return "D";
    return "F";
  };

  const getGradeColor = (grade: string): string => {
    switch (grade) {
      case "A+": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "A": return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300";
      case "B+": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "B": return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300";
      case "C": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "D": return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      default: return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "upcoming": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "ongoing": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "completed": return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      default: return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    }
  };

  // Filter results
  const filteredResults = Array.isArray(results) ? results.filter((result: any) => {
    const matchesClass = selectedClass === "all" || result.student?.class === selectedClass;
    const matchesSubject = selectedSubject === "all" || result.subject?.name === selectedSubject;
    const matchesExamType = selectedExamType === "all" || result.examType === selectedExamType;
    const matchesSearch = searchTerm === "" || 
      result.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesClass && matchesSubject && matchesExamType && matchesSearch;
  }) : [];

  // Calculate statistics
  const totalResults = filteredResults.length;
  const averagePercentage = totalResults > 0 
    ? filteredResults.reduce((sum: number, result: any) => sum + result.percentage, 0) / totalResults 
    : 0;
  const passCount = filteredResults.filter((result: any) => result.percentage >= 40).length;
  const passRate = totalResults > 0 ? (passCount / totalResults) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Academic Results
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage student results, exams, and academic performance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowAddExam(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Schedule Exam
            </Button>
            <Button
              onClick={() => setShowAddResult(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Result
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Results</p>
                  <p className="text-3xl font-bold">{totalResults}</p>
                </div>
                <Award className="w-10 h-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Average Score</p>
                  <p className="text-3xl font-bold">{averagePercentage.toFixed(1)}%</p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Pass Rate</p>
                  <p className="text-3xl font-bold">{passRate.toFixed(1)}%</p>
                </div>
                <BarChart3 className="w-10 h-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Active Exams</p>
                  <p className="text-3xl font-bold">{Array.isArray(exams) ? exams.filter((exam: any) => exam.status === "ongoing").length : 0}</p>
                </div>
                <Calendar className="w-10 h-10 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="semesters">Semesters</TabsTrigger>
            <TabsTrigger value="exams">Exams</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            {/* Filters */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filter Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <Label>Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Class</Label>
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        {classes.map(className => (
                          <SelectItem key={className} value={className}>{className}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Subject</Label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Subjects</SelectItem>
                        {Array.isArray(subjects) && subjects.map((subject: any) => (
                          <SelectItem key={subject.id} value={subject.name}>{subject.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Exam Type</Label>
                    <Select value={selectedExamType} onValueChange={setSelectedExamType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select exam type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {examTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Table */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Student Results ({totalResults})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {resultsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : filteredResults.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No Results Found</h3>
                    <p className="text-sm">No results match your current filters.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium">Student</th>
                          <th className="text-left p-3 font-medium">Subject</th>
                          <th className="text-left p-3 font-medium">Exam Type</th>
                          <th className="text-left p-3 font-medium">Date</th>
                          <th className="text-left p-3 font-medium">Marks</th>
                          <th className="text-left p-3 font-medium">Percentage</th>
                          <th className="text-left p-3 font-medium">Grade</th>
                          <th className="text-left p-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredResults.map((result: any) => (
                          <tr key={result.id} className="border-b hover:bg-muted/50">
                            <td className="p-3">
                              <div>
                                <div className="font-medium">{result.student?.name || 'Unknown Student'}</div>
                                <div className="text-sm text-muted-foreground">
                                  {result.student?.rollNumber} • {result.student?.class}
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg flex items-center justify-center text-xs font-bold">
                                  {result.subject?.code || 'N/A'}
                                </div>
                                <span>{result.subject?.name || 'Unknown Subject'}</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <Badge variant="outline">{result.examType}</Badge>
                            </td>
                            <td className="p-3 text-sm">
                              {result.examDate ? new Date(result.examDate).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="p-3">
                              <span className="font-medium">{result.obtainedMarks}</span>
                              <span className="text-muted-foreground">/{result.maxMarks}</span>
                            </td>
                            <td className="p-3">
                              <span className="font-medium">{result.percentage}%</span>
                            </td>
                            <td className="p-3">
                              <Badge className={getGradeColor(result.grade)}>
                                {result.grade}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div className="flex gap-2">
                                <Button size="sm" variant="ghost">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Semesters Tab */}
          <TabsContent value="semesters" className="space-y-6">
            {/* Semester Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Semester Management</h2>
                <p className="text-muted-foreground">Create and manage academic semesters and semester-wise results</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowAddSemesterResult(true)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Semester Result
                </Button>
                <Button
                  onClick={() => setShowAddSemester(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Semester
                </Button>
              </div>
            </div>

            {/* Active Semester Banner */}
            {activeSemester && (
              <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <div>
                        <h3 className="font-semibold text-green-700 dark:text-green-300">
                          Active Semester: {(activeSemester as any)?.name || 'Unknown'}
                        </h3>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Academic Year: {(activeSemester as any)?.academicYear || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      Current
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Semesters List */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Academic Semesters
                </CardTitle>
              </CardHeader>
              <CardContent>
                {semestersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : Array.isArray(semesters) && semesters.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No Semesters Created</h3>
                    <p className="text-sm">Create your first semester to start tracking semester-wise academic results.</p>
                    <Button onClick={() => setShowAddSemester(true)} className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Semester
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {Array.isArray(semesters) && semesters.map((semester: any) => (
                      <div key={semester.id} className="border rounded-lg p-4 bg-card">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`w-10 h-10 ${semester.isActive ? 'bg-gradient-to-r from-green-500 to-blue-600' : 'bg-gradient-to-r from-gray-400 to-gray-600'} text-white rounded-lg flex items-center justify-center`}>
                                <Calendar className="w-5 h-5" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                  {semester.name}
                                  {semester.isActive && (
                                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                      Active
                                    </Badge>
                                  )}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  Academic Year: {semester.academicYear}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <span>
                                Start: {semester.startDate ? new Date(semester.startDate).toLocaleDateString() : 'TBD'}
                              </span>
                              <span>
                                End: {semester.endDate ? new Date(semester.endDate).toLocaleDateString() : 'TBD'}
                              </span>
                              <span>
                                Results: {Array.isArray(semesterResults) ? 
                                  semesterResults.filter((r: any) => r.semesterId === semester.id).length : 0
                                }
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Semester Results Overview */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Semester-wise Results Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {semesterResultsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : Array.isArray(semesterResults) && semesterResults.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No Semester Results</h3>
                    <p className="text-sm">Start adding semester-wise marks for students to track academic progress.</p>
                    <Button onClick={() => setShowAddSemesterResult(true)} className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Result
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium">Student</th>
                          <th className="text-left p-3 font-medium">Semester</th>
                          <th className="text-left p-3 font-medium">Subject</th>
                          <th className="text-left p-3 font-medium">Internal</th>
                          <th className="text-left p-3 font-medium">External</th>
                          <th className="text-left p-3 font-medium">Total</th>
                          <th className="text-left p-3 font-medium">Grade</th>
                          <th className="text-left p-3 font-medium">GPA</th>
                          <th className="text-left p-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(semesterResults) && semesterResults.slice(0, 10).map((result: any) => (
                          <tr key={result.id} className="border-b hover:bg-muted/50">
                            <td className="p-3">
                              <div>
                                <div className="font-medium">{result.student?.name || 'Unknown Student'}</div>
                                <div className="text-sm text-muted-foreground">
                                  {result.student?.rollNumber}
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="font-medium">{result.semester?.name || 'Unknown Semester'}</div>
                              <div className="text-sm text-muted-foreground">
                                {result.semester?.academicYear}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg flex items-center justify-center text-xs font-bold">
                                  {result.subject?.code || 'N/A'}
                                </div>
                                <span>{result.subject?.name || 'Unknown Subject'}</span>
                              </div>
                            </td>
                            <td className="p-3 text-center">{result.internalMarks || 0}</td>
                            <td className="p-3 text-center">{result.externalMarks || 0}</td>
                            <td className="p-3">
                              <span className="font-medium">{result.obtainedMarks}</span>
                              <span className="text-muted-foreground">/{result.totalMarks}</span>
                            </td>
                            <td className="p-3">
                              <Badge className={getGradeColor(result.grade)}>
                                {result.grade}
                              </Badge>
                            </td>
                            <td className="p-3 font-medium">{result.gpa || 'N/A'}</td>
                            <td className="p-3">
                              <div className="flex gap-2">
                                <Button size="sm" variant="ghost">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exams Tab */}
          <TabsContent value="exams" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Scheduled Exams
                </CardTitle>
              </CardHeader>
              <CardContent>
                {examsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : Array.isArray(exams) && exams.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No Exams Scheduled</h3>
                    <p className="text-sm">Schedule your first exam to get started.</p>
                    <Button onClick={() => setShowAddExam(true)} className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Schedule Exam
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {Array.isArray(exams) && exams.map((exam: any) => (
                      <div key={exam.id} className="border rounded-lg p-4 bg-card">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg flex items-center justify-center">
                                <Calendar className="w-5 h-5" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">{exam.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {exam.class} - Section {exam.section}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <span>Type: {exam.type}</span>
                              <span>Max Marks: {exam.maxMarks}</span>
                              <span>
                                {exam.startDate && exam.endDate ? 
                                  `${new Date(exam.startDate).toLocaleDateString()} - ${new Date(exam.endDate).toLocaleDateString()}` 
                                  : 'Date TBD'
                                }
                              </span>
                            </div>
                            <Badge className={getStatusColor(exam.status)}>
                              {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Performance Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Analytics Coming Soon</h3>
                  <p className="text-sm">Detailed performance analytics and charts will be available here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Result Dialog */}
        <Dialog open={showAddResult} onOpenChange={setShowAddResult}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Student Result
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="studentId">Student *</Label>
                  <Select value={newResult.studentId} onValueChange={(value) => setNewResult(prev => ({ ...prev, studentId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(students) && students.map((student: any) => (
                        <SelectItem key={student.id} value={student.id.toString()}>
                          {student.name} ({student.rollNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subjectId">Subject *</Label>
                  <Select value={newResult.subjectId} onValueChange={(value) => setNewResult(prev => ({ ...prev, subjectId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(subjects) && subjects.map((subject: any) => (
                        <SelectItem key={subject.id} value={subject.id.toString()}>
                          {subject.name} ({subject.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="examType">Exam Type *</Label>
                  <Select value={newResult.examType} onValueChange={(value) => setNewResult(prev => ({ ...prev, examType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select exam type" />
                    </SelectTrigger>
                    <SelectContent>
                      {examTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="examDate">Exam Date *</Label>
                  <Input
                    id="examDate"
                    type="date"
                    value={newResult.examDate}
                    onChange={(e) => setNewResult(prev => ({ ...prev, examDate: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxMarks">Maximum Marks *</Label>
                  <Input
                    id="maxMarks"
                    type="number"
                    min="1"
                    value={newResult.maxMarks}
                    onChange={(e) => setNewResult(prev => ({ ...prev, maxMarks: e.target.value }))}
                    placeholder="e.g., 100"
                  />
                </div>
                <div>
                  <Label htmlFor="obtainedMarks">Obtained Marks *</Label>
                  <Input
                    id="obtainedMarks"
                    type="number"
                    min="0"
                    max={newResult.maxMarks || undefined}
                    value={newResult.obtainedMarks}
                    onChange={(e) => setNewResult(prev => ({ ...prev, obtainedMarks: e.target.value }))}
                    placeholder="e.g., 85"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="remarks">Remarks</Label>
                <Input
                  id="remarks"
                  value={newResult.remarks}
                  onChange={(e) => setNewResult(prev => ({ ...prev, remarks: e.target.value }))}
                  placeholder="Optional remarks"
                />
              </div>

              {/* Grade Preview */}
              {newResult.maxMarks && newResult.obtainedMarks && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Grade Preview:</span>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold">
                        {Math.round((parseInt(newResult.obtainedMarks) / parseInt(newResult.maxMarks)) * 100)}%
                      </span>
                      <Badge className={getGradeColor(calculateGrade((parseInt(newResult.obtainedMarks) / parseInt(newResult.maxMarks)) * 100))}>
                        {calculateGrade((parseInt(newResult.obtainedMarks) / parseInt(newResult.maxMarks)) * 100)}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    if (!newResult.studentId || !newResult.subjectId || !newResult.examType || 
                        !newResult.examDate || !newResult.maxMarks || !newResult.obtainedMarks) {
                      toast({
                        title: "Missing Information",
                        description: "Please fill all required fields",
                        variant: "destructive",
                      });
                      return;
                    }
                    
                    const percentage = Math.round((parseInt(newResult.obtainedMarks) / parseInt(newResult.maxMarks)) * 100);
                    const grade = calculateGrade(percentage);
                    
                    addResultMutation.mutate({
                      ...newResult,
                      studentId: parseInt(newResult.studentId),
                      subjectId: parseInt(newResult.subjectId),
                      maxMarks: parseInt(newResult.maxMarks),
                      obtainedMarks: parseInt(newResult.obtainedMarks),
                      percentage,
                      grade
                    });
                  }}
                  disabled={addResultMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {addResultMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add Result
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setNewResult({
                      studentId: "",
                      subjectId: "",
                      examType: "",
                      examDate: "",
                      maxMarks: "",
                      obtainedMarks: "",
                      remarks: ""
                    });
                    setShowAddResult(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Semester Dialog */}
        <Dialog open={showAddSemester} onOpenChange={setShowAddSemester}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Create New Semester
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="semesterName">Semester Name *</Label>
                  <Input
                    id="semesterName"
                    value={newSemester.name}
                    onChange={(e) => setNewSemester(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Fall 2024, Spring 2025"
                  />
                </div>
                <div>
                  <Label htmlFor="academicYear">Academic Year *</Label>
                  <Input
                    id="academicYear"
                    value={newSemester.academicYear}
                    onChange={(e) => setNewSemester(prev => ({ ...prev, academicYear: e.target.value }))}
                    placeholder="e.g., 2024-2025"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="semesterStartDate">Start Date *</Label>
                  <Input
                    id="semesterStartDate"
                    type="date"
                    value={newSemester.startDate}
                    onChange={(e) => setNewSemester(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="semesterEndDate">End Date *</Label>
                  <Input
                    id="semesterEndDate"
                    type="date"
                    value={newSemester.endDate}
                    onChange={(e) => setNewSemester(prev => ({ ...prev, endDate: e.target.value }))}
                    min={newSemester.startDate}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={newSemester.isActive}
                  onChange={(e) => setNewSemester(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4"
                />
                <Label htmlFor="isActive">Set as Active Semester</Label>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    if (!newSemester.name || !newSemester.academicYear || 
                        !newSemester.startDate || !newSemester.endDate) {
                      toast({
                        title: "Missing Information",
                        description: "Please fill all required fields",
                        variant: "destructive",
                      });
                      return;
                    }
                    
                    addSemesterMutation.mutate({
                      ...newSemester,
                      startDate: new Date(newSemester.startDate).toISOString(),
                      endDate: new Date(newSemester.endDate).toISOString(),
                    });
                  }}
                  disabled={addSemesterMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {addSemesterMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      Create Semester
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setNewSemester({
                      name: "",
                      academicYear: "",
                      startDate: "",
                      endDate: "",
                      isActive: false
                    });
                    setShowAddSemester(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Semester Result Dialog */}
        <Dialog open={showAddSemesterResult} onOpenChange={setShowAddSemesterResult}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Semester Result
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="resultStudentId">Student *</Label>
                  <Select value={newSemesterResult.studentId} onValueChange={(value) => setNewSemesterResult(prev => ({ ...prev, studentId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(students) && students.map((student: any) => (
                        <SelectItem key={student.id} value={student.id.toString()}>
                          {student.name} ({student.rollNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="resultSemesterId">Semester *</Label>
                  <Select value={newSemesterResult.semesterId} onValueChange={(value) => setNewSemesterResult(prev => ({ ...prev, semesterId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(semesters) && semesters.map((semester: any) => (
                        <SelectItem key={semester.id} value={semester.id.toString()}>
                          {semester.name} ({semester.academicYear})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="resultSubjectId">Subject *</Label>
                  <Select value={newSemesterResult.subjectId} onValueChange={(value) => setNewSemesterResult(prev => ({ ...prev, subjectId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(subjects) && subjects.map((subject: any) => (
                        <SelectItem key={subject.id} value={subject.id.toString()}>
                          {subject.name} ({subject.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="internalMarks">Internal Marks</Label>
                  <Input
                    id="internalMarks"
                    type="number"
                    min="0"
                    value={newSemesterResult.internalMarks}
                    onChange={(e) => setNewSemesterResult(prev => ({ ...prev, internalMarks: e.target.value }))}
                    placeholder="e.g., 40"
                  />
                </div>
                <div>
                  <Label htmlFor="externalMarks">External Marks</Label>
                  <Input
                    id="externalMarks"
                    type="number"
                    min="0"
                    value={newSemesterResult.externalMarks}
                    onChange={(e) => setNewSemesterResult(prev => ({ ...prev, externalMarks: e.target.value }))}
                    placeholder="e.g., 60"
                  />
                </div>
                <div>
                  <Label htmlFor="totalMarks">Total Marks *</Label>
                  <Input
                    id="totalMarks"
                    type="number"
                    min="1"
                    value={newSemesterResult.totalMarks}
                    onChange={(e) => setNewSemesterResult(prev => ({ ...prev, totalMarks: e.target.value }))}
                    placeholder="e.g., 100"
                  />
                </div>
                <div>
                  <Label htmlFor="obtainedMarks">Obtained Marks *</Label>
                  <Input
                    id="obtainedMarks"
                    type="number"
                    min="0"
                    max={newSemesterResult.totalMarks || undefined}
                    value={newSemesterResult.obtainedMarks}
                    onChange={(e) => setNewSemesterResult(prev => ({ ...prev, obtainedMarks: e.target.value }))}
                    placeholder="e.g., 85"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gpa">GPA (Optional)</Label>
                  <Input
                    id="gpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={newSemesterResult.gpa}
                    onChange={(e) => setNewSemesterResult(prev => ({ ...prev, gpa: e.target.value }))}
                    placeholder="e.g., 8.5"
                  />
                </div>
                <div>
                  <Label htmlFor="semesterRemarks">Remarks</Label>
                  <Input
                    id="semesterRemarks"
                    value={newSemesterResult.remarks}
                    onChange={(e) => setNewSemesterResult(prev => ({ ...prev, remarks: e.target.value }))}
                    placeholder="Optional remarks"
                  />
                </div>
              </div>

              {/* Grade Preview */}
              {newSemesterResult.totalMarks && newSemesterResult.obtainedMarks && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Grade Preview:</span>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold">
                        {Math.round((parseInt(newSemesterResult.obtainedMarks) / parseInt(newSemesterResult.totalMarks)) * 100)}%
                      </span>
                      <Badge className={getGradeColor(calculateGrade((parseInt(newSemesterResult.obtainedMarks) / parseInt(newSemesterResult.totalMarks)) * 100))}>
                        {calculateGrade((parseInt(newSemesterResult.obtainedMarks) / parseInt(newSemesterResult.totalMarks)) * 100)}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    if (!newSemesterResult.studentId || !newSemesterResult.semesterId || 
                        !newSemesterResult.subjectId || !newSemesterResult.totalMarks || 
                        !newSemesterResult.obtainedMarks) {
                      toast({
                        title: "Missing Information",
                        description: "Please fill all required fields",
                        variant: "destructive",
                      });
                      return;
                    }
                    
                    const percentage = Math.round((parseInt(newSemesterResult.obtainedMarks) / parseInt(newSemesterResult.totalMarks)) * 100);
                    const grade = calculateGrade(percentage);
                    
                    addSemesterResultMutation.mutate({
                      ...newSemesterResult,
                      studentId: parseInt(newSemesterResult.studentId),
                      semesterId: parseInt(newSemesterResult.semesterId),
                      subjectId: parseInt(newSemesterResult.subjectId),
                      internalMarks: newSemesterResult.internalMarks ? parseInt(newSemesterResult.internalMarks) : 0,
                      externalMarks: newSemesterResult.externalMarks ? parseInt(newSemesterResult.externalMarks) : 0,
                      totalMarks: parseInt(newSemesterResult.totalMarks),
                      obtainedMarks: parseInt(newSemesterResult.obtainedMarks),
                      percentage,
                      grade,
                      gpa: newSemesterResult.gpa ? parseFloat(newSemesterResult.gpa) : null
                    });
                  }}
                  disabled={addSemesterResultMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {addSemesterResultMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add Result
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setNewSemesterResult({
                      studentId: "",
                      semesterId: "",
                      subjectId: "",
                      internalMarks: "",
                      externalMarks: "",
                      totalMarks: "",
                      obtainedMarks: "",
                      gpa: "",
                      remarks: ""
                    });
                    setShowAddSemesterResult(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Exam Dialog */}
        <Dialog open={showAddExam} onOpenChange={setShowAddExam}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Schedule New Exam
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="examName">Exam Name *</Label>
                <Input
                  id="examName"
                  value={newExam.name}
                  onChange={(e) => setNewExam(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Mid-term Examination 2024"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="examType">Exam Type *</Label>
                  <Select value={newExam.type} onValueChange={(value: any) => setNewExam(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unit_test">Unit Test</SelectItem>
                      <SelectItem value="midterm">Midterm</SelectItem>
                      <SelectItem value="final">Final</SelectItem>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="practical">Practical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="examClass">Class *</Label>
                  <Select value={newExam.class} onValueChange={(value) => setNewExam(prev => ({ ...prev, class: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map(className => (
                        <SelectItem key={className} value={className}>{className}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="examSection">Section *</Label>
                  <Select value={newExam.section} onValueChange={(value) => setNewExam(prev => ({ ...prev, section: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map(section => (
                        <SelectItem key={section} value={section}>{section}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newExam.startDate}
                    onChange={(e) => setNewExam(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newExam.endDate}
                    onChange={(e) => setNewExam(prev => ({ ...prev, endDate: e.target.value }))}
                    min={newExam.startDate}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="maxMarks">Maximum Marks *</Label>
                <Input
                  id="maxMarks"
                  type="number"
                  min="1"
                  value={newExam.maxMarks}
                  onChange={(e) => setNewExam(prev => ({ ...prev, maxMarks: e.target.value }))}
                  placeholder="e.g., 100"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    if (!newExam.name || !newExam.type || !newExam.class || !newExam.section || 
                        !newExam.startDate || !newExam.endDate || !newExam.maxMarks) {
                      toast({
                        title: "Missing Information",
                        description: "Please fill all required fields",
                        variant: "destructive",
                      });
                      return;
                    }
                    
                    addExamMutation.mutate({
                      ...newExam,
                      maxMarks: parseInt(newExam.maxMarks),
                      status: "upcoming",
                      subjects: [],
                      createdBy: 1 // TODO: Get from auth context
                    });
                  }}
                  disabled={addExamMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {addExamMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      Schedule Exam
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setNewExam({
                      name: "",
                      type: "unit_test",
                      startDate: "",
                      endDate: "",
                      class: "",
                      section: "",
                      maxMarks: ""
                    });
                    setShowAddExam(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}