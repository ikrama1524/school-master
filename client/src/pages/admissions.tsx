import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  CalendarIcon, Upload, FileText, CheckCircle, Clock, XCircle, Plus,
  Eye, Download, MessageSquare, UserCheck, AlertTriangle, Mail,
  Phone, MapPin, GraduationCap, Users, Filter, Search, MoreHorizontal
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface AdmissionApplication {
  id: number;
  applicationNumber: string;
  studentName: string;
  dateOfBirth: string;
  parentName: string;
  email: string;
  phone: string;
  address: string;
  previousSchool?: string;
  class: string;
  status: "pending" | "approved" | "rejected" | "document_review" | "interview_scheduled";
  applicationDate: Date;
  documents: DocumentInfo[];
  remarks?: string;
  interviewDate?: Date;
  priority: "normal" | "high" | "urgent";
}

interface DocumentInfo {
  id: string;
  name: string;
  type: string;
  status: "pending" | "verified" | "rejected";
  uploadDate: Date;
  size: string;
}

export default function Admissions() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewApplicationOpen, setIsNewApplicationOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<AdmissionApplication | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [newApplication, setNewApplication] = useState({
    studentName: "",
    dateOfBirth: "",
    parentName: "",
    email: "",
    phone: "",
    address: "",
    previousSchool: "",
    class: "",
    documents: [] as File[],
  });

  // Mock data for demonstration - in real app this would come from API
  const applications: AdmissionApplication[] = [
    {
      id: 1,
      applicationNumber: "ADM001",
      studentName: "Emma Wilson",
      dateOfBirth: "2010-05-15",
      parentName: "David Wilson",
      email: "david.wilson@email.com",
      phone: "+1234567890",
      address: "123 Oak Street, City",
      previousSchool: "Green Valley Elementary",
      class: "Grade 6",
      status: "pending",
      applicationDate: new Date("2024-12-01"),
      priority: "normal",
      documents: [
        { id: "1", name: "Birth Certificate", type: "pdf", status: "verified", uploadDate: new Date("2024-12-01"), size: "1.2 MB" },
        { id: "2", name: "Previous School Records", type: "pdf", status: "pending", uploadDate: new Date("2024-12-01"), size: "2.5 MB" },
        { id: "3", name: "Parent ID", type: "pdf", status: "verified", uploadDate: new Date("2024-12-01"), size: "0.8 MB" }
      ]
    },
    {
      id: 2,
      applicationNumber: "ADM002",
      studentName: "James Chen",
      dateOfBirth: "2011-08-22",
      parentName: "Li Chen",
      email: "li.chen@email.com",
      phone: "+1234567891",
      address: "456 Pine Street, City",
      class: "Grade 5",
      status: "document_review",
      applicationDate: new Date("2024-12-02"),
      priority: "high",
      documents: [
        { id: "4", name: "Birth Certificate", type: "pdf", status: "verified", uploadDate: new Date("2024-12-02"), size: "1.1 MB" },
        { id: "5", name: "Immunization Records", type: "pdf", status: "rejected", uploadDate: new Date("2024-12-02"), size: "1.8 MB" }
      ],
      remarks: "Missing immunization records"
    },
    {
      id: 3,
      applicationNumber: "ADM003",
      studentName: "Sofia Rodriguez",
      dateOfBirth: "2009-12-10",
      parentName: "Maria Rodriguez",
      email: "maria.rodriguez@email.com",
      phone: "+1234567892",
      address: "789 Maple Avenue, City",
      class: "Grade 7",
      status: "approved",
      applicationDate: new Date("2024-11-28"),
      priority: "normal",
      documents: [
        { id: "6", name: "Birth Certificate", type: "pdf", status: "verified", uploadDate: new Date("2024-11-28"), size: "1.3 MB" },
        { id: "7", name: "Previous School Records", type: "pdf", status: "verified", uploadDate: new Date("2024-11-28"), size: "3.1 MB" },
        { id: "8", name: "Parent ID", type: "pdf", status: "verified", uploadDate: new Date("2024-11-28"), size: "0.9 MB" }
      ]
    }
  ];

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.parentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesClass = classFilter === "all" || app.class === classFilter;
    return matchesSearch && matchesStatus && matchesClass;
  });

  const uniqueClasses = [...new Set(applications.map(app => app.class))];

  const statusStats = {
    pending: applications.filter(app => app.status === "pending").length,
    approved: applications.filter(app => app.status === "approved").length,
    rejected: applications.filter(app => app.status === "rejected").length,
    document_review: applications.filter(app => app.status === "document_review").length,
    interview_scheduled: applications.filter(app => app.status === "interview_scheduled").length,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "document_review":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "interview_scheduled":
        return <UserCheck className="h-4 w-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "document_review":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "interview_scheduled":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      default:
        return "bg-gray-400";
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      setNewApplication(prev => ({
        ...prev,
        documents: [...prev.documents, ...fileArray]
      }));
    }
  };

  const removeDocument = (index: number) => {
    setNewApplication(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const submitApplication = () => {
    // In real app, this would submit to API
    toast({
      title: "Application Submitted",
      description: "Application has been submitted successfully and is under review.",
    });
    setIsNewApplicationOpen(false);
    setNewApplication({
      studentName: "",
      dateOfBirth: "",
      parentName: "",
      email: "",
      phone: "",
      address: "",
      previousSchool: "",
      class: "",
      documents: [],
    });
  };

  const viewApplicationDetails = (application: AdmissionApplication) => {
    setSelectedApplication(application);
    setIsDetailsModalOpen(true);
  };

  const updateApplicationStatus = (id: number, status: string) => {
    // In real app, this would update via API
    toast({
      title: "Status Updated",
      description: `Application status updated to ${status}`,
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Admissions Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Online applications with document verification and approval workflow
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Applications
          </Button>
          <Dialog open={isNewApplicationOpen} onOpenChange={setIsNewApplicationOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Application
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Student Admission Application</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="studentName">Student Full Name *</Label>
                    <Input
                      id="studentName"
                      value={newApplication.studentName}
                      onChange={(e) => setNewApplication(prev => ({ ...prev, studentName: e.target.value }))}
                      placeholder="Enter student's full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={newApplication.dateOfBirth}
                      onChange={(e) => setNewApplication(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="parentName">Parent/Guardian Name *</Label>
                    <Input
                      id="parentName"
                      value={newApplication.parentName}
                      onChange={(e) => setNewApplication(prev => ({ ...prev, parentName: e.target.value }))}
                      placeholder="Enter parent/guardian name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="class">Applying for Class *</Label>
                    <Select value={newApplication.class} onValueChange={(value) => setNewApplication(prev => ({ ...prev, class: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Grade 1">Grade 1</SelectItem>
                        <SelectItem value="Grade 2">Grade 2</SelectItem>
                        <SelectItem value="Grade 3">Grade 3</SelectItem>
                        <SelectItem value="Grade 4">Grade 4</SelectItem>
                        <SelectItem value="Grade 5">Grade 5</SelectItem>
                        <SelectItem value="Grade 6">Grade 6</SelectItem>
                        <SelectItem value="Grade 7">Grade 7</SelectItem>
                        <SelectItem value="Grade 8">Grade 8</SelectItem>
                        <SelectItem value="Grade 9">Grade 9</SelectItem>
                        <SelectItem value="Grade 10">Grade 10</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newApplication.email}
                      onChange={(e) => setNewApplication(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={newApplication.phone}
                      onChange={(e) => setNewApplication(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="address">Full Address *</Label>
                  <Textarea
                    id="address"
                    value={newApplication.address}
                    onChange={(e) => setNewApplication(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter complete address"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="previousSchool">Previous School (if any)</Label>
                  <Input
                    id="previousSchool"
                    value={newApplication.previousSchool}
                    onChange={(e) => setNewApplication(prev => ({ ...prev, previousSchool: e.target.value }))}
                    placeholder="Enter previous school name"
                  />
                </div>

                <div>
                  <Label>Required Documents</Label>
                  <div className="mt-2 space-y-3">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Upload required documents (PDF, JPG, PNG - Max 5MB each)
                      </p>
                      <Input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="hidden"
                        id="fileUpload"
                      />
                      <Button variant="outline" onClick={() => document.getElementById('fileUpload')?.click()}>
                        Select Files
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Required Documents:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Birth Certificate</li>
                        <li>• Previous School Transfer Certificate (if applicable)</li>
                        <li>• Academic Records/Report Cards</li>
                        <li>• Parent/Guardian ID Proof</li>
                        <li>• Passport Size Photographs (2 copies)</li>
                        <li>• Medical/Immunization Records</li>
                      </ul>
                    </div>

                    {newApplication.documents.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Uploaded Documents:</h4>
                        <div className="space-y-2">
                          {newApplication.documents.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                <span className="text-sm">{file.name}</span>
                                <span className="text-xs text-muted-foreground">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                              </div>
                              <Button size="sm" variant="ghost" onClick={() => removeDocument(index)}>
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsNewApplicationOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={submitApplication}>
                    Submit Application
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 animate-slide-up">
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{statusStats.pending}</p>
              </div>
              <Clock className="h-6 w-6 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Review</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{statusStats.document_review}</p>
              </div>
              <FileText className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Interview</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{statusStats.interview_scheduled}</p>
              </div>
              <UserCheck className="h-6 w-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Approved</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{statusStats.approved}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Rejected</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">{statusStats.rejected}</p>
              </div>
              <XCircle className="h-6 w-6 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by student name, application number, or parent name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="document_review">Document Review</SelectItem>
                  <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-32">
                  <GraduationCap className="w-4 h-4 mr-2" />
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <Card className="animate-slide-up" style={{ animationDelay: '400ms' }}>
        <CardHeader>
          <CardTitle>Admission Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <div
                key={application.id}
                className="border rounded-lg p-4 hover:shadow-md transition-all duration-300 cursor-pointer"
                onClick={() => viewApplicationDetails(application)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {application.studentName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{application.studentName}</h3>
                        <Badge variant="outline" className="text-xs">
                          {application.applicationNumber}
                        </Badge>
                        {application.priority !== "normal" && (
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(application.priority)}`} />
                        )}
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            Parent: {application.parentName}
                          </span>
                          <span className="flex items-center gap-1">
                            <GraduationCap className="h-3 w-3" />
                            {application.class}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {application.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {application.phone}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          Applied: {application.applicationDate.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <Badge className={`${getStatusColor(application.status)} flex items-center gap-1 mb-2`}>
                        {getStatusIcon(application.status)}
                        {application.status.replace('_', ' ').charAt(0).toUpperCase() + application.status.replace('_', ' ').slice(1)}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {application.documents.length} documents
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {filteredApplications.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No applications found matching your criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Application Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details - {selectedApplication?.applicationNumber}</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Student Details</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Student Name</Label>
                    <p className="font-medium">{selectedApplication.studentName}</p>
                  </div>
                  <div>
                    <Label>Date of Birth</Label>
                    <p className="font-medium">{selectedApplication.dateOfBirth}</p>
                  </div>
                  <div>
                    <Label>Parent/Guardian</Label>
                    <p className="font-medium">{selectedApplication.parentName}</p>
                  </div>
                  <div>
                    <Label>Applying for Class</Label>
                    <p className="font-medium">{selectedApplication.class}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="font-medium">{selectedApplication.email}</p>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <p className="font-medium">{selectedApplication.phone}</p>
                  </div>
                </div>
                <div>
                  <Label>Address</Label>
                  <p className="font-medium">{selectedApplication.address}</p>
                </div>
                {selectedApplication.previousSchool && (
                  <div>
                    <Label>Previous School</Label>
                    <p className="font-medium">{selectedApplication.previousSchool}</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="documents" className="space-y-4">
                <div className="space-y-3">
                  {selectedApplication.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Uploaded: {doc.uploadDate.toLocaleDateString()} • {doc.size}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(doc.status)}>
                          {doc.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="actions" className="space-y-4">
                <div>
                  <Label>Update Status</Label>
                  <Select defaultValue={selectedApplication.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="document_review">Document Review</SelectItem>
                      <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Remarks</Label>
                  <Textarea placeholder="Add remarks or feedback..." defaultValue={selectedApplication.remarks} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => updateApplicationStatus(selectedApplication.id, "approved")}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button variant="destructive" onClick={() => updateApplicationStatus(selectedApplication.id, "rejected")}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}