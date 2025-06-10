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
import { CalendarIcon, Upload, FileText, CheckCircle, Clock, XCircle, Plus } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface AdmissionApplication {
  id: number;
  studentName: string;
  parentName: string;
  email: string;
  phone: string;
  class: string;
  status: "pending" | "approved" | "rejected" | "document_review";
  applicationDate: Date;
  documents: string[];
}

export default function Admissions() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [newApplication, setNewApplication] = useState({
    studentName: "",
    parentName: "",
    email: "",
    phone: "",
    class: "",
    documents: [] as File[],
  });

  // Mock data for demonstration
  const applications: AdmissionApplication[] = [
    {
      id: 1,
      studentName: "Emma Wilson",
      parentName: "David Wilson",
      email: "david.wilson@email.com",
      phone: "+1234567890",
      class: "Grade 6",
      status: "pending",
      applicationDate: new Date("2024-05-15"),
      documents: ["birth_certificate.pdf", "report_card.pdf"],
    },
    {
      id: 2,
      studentName: "Michael Chen",
      parentName: "Lisa Chen",
      email: "lisa.chen@email.com",
      phone: "+1234567891",
      class: "Grade 8",
      status: "approved",
      applicationDate: new Date("2024-05-10"),
      documents: ["birth_certificate.pdf", "report_card.pdf", "immunization.pdf"],
    },
    {
      id: 3,
      studentName: "Sofia Rodriguez",
      parentName: "Carlos Rodriguez",
      email: "carlos.r@email.com",
      phone: "+1234567892",
      class: "Grade 7",
      status: "document_review",
      applicationDate: new Date("2024-05-20"),
      documents: ["birth_certificate.pdf"],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "document_review": return "bg-yellow-100 text-yellow-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="h-4 w-4" />;
      case "rejected": return <XCircle className="h-4 w-4" />;
      case "document_review": return <FileText className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleSubmitApplication = () => {
    if (!newApplication.studentName || !newApplication.parentName || !newApplication.email || !newApplication.class) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Application Submitted",
      description: "The admission application has been submitted successfully",
    });

    setNewApplication({
      studentName: "",
      parentName: "",
      email: "",
      phone: "",
      class: "",
      documents: [],
    });
  };

  const handleStatusChange = (applicationId: number, newStatus: string) => {
    toast({
      title: "Status Updated",
      description: `Application status changed to ${newStatus}`,
    });
  };

  const pendingCount = applications.filter(app => app.status === "pending").length;
  const approvedCount = applications.filter(app => app.status === "approved").length;
  const rejectedCount = applications.filter(app => app.status === "rejected").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admissions</h1>
          <p className="text-muted-foreground">Manage student admission applications and enrollment</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{approvedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold">{rejectedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{applications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="applications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="new-application">New Application</TabsTrigger>
          <TabsTrigger value="calendar">Application Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Admission Applications</CardTitle>
              <CardDescription>Review and manage student admission applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applications.map((application) => (
                  <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <h4 className="font-medium">{application.studentName}</h4>
                          <p className="text-sm text-muted-foreground">Parent: {application.parentName}</p>
                          <p className="text-sm text-muted-foreground">{application.email} • {application.phone}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="outline">{application.class}</Badge>
                        <Badge className={getStatusColor(application.status)}>
                          {getStatusIcon(application.status)}
                          <span className="ml-1 capitalize">{application.status.replace('_', ' ')}</span>
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Applied: {format(application.applicationDate, "MMM dd, yyyy")}
                        </span>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground">
                          Documents: {application.documents.join(", ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={application.status}
                        onValueChange={(value) => handleStatusChange(application.id, value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="document_review">Document Review</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new-application" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>New Admission Application</CardTitle>
              <CardDescription>Submit a new student admission application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="student-name">Student Name *</Label>
                  <Input
                    id="student-name"
                    value={newApplication.studentName}
                    onChange={(e) => setNewApplication({...newApplication, studentName: e.target.value})}
                    placeholder="Enter student's full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parent-name">Parent/Guardian Name *</Label>
                  <Input
                    id="parent-name"
                    value={newApplication.parentName}
                    onChange={(e) => setNewApplication({...newApplication, parentName: e.target.value})}
                    placeholder="Enter parent's full name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newApplication.email}
                    onChange={(e) => setNewApplication({...newApplication, email: e.target.value})}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={newApplication.phone}
                    onChange={(e) => setNewApplication({...newApplication, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="class">Applying for Class *</Label>
                <Select value={newApplication.class} onValueChange={(value) => setNewApplication({...newApplication, class: value})}>
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
                    <SelectItem value="Grade 11">Grade 11</SelectItem>
                    <SelectItem value="Grade 12">Grade 12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Document Upload</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Drop files here or click to upload
                  </p>
                  <p className="text-xs text-gray-500">
                    Upload birth certificate, previous report cards, immunization records
                  </p>
                </div>
              </div>
              <Button onClick={handleSubmitApplication} className="w-full">
                Submit Application
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Calendar</CardTitle>
              <CardDescription>View application deadlines and important dates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                  />
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Important Dates</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <div>
                        <p className="font-medium">Application Deadline</p>
                        <p className="text-sm text-muted-foreground">June 30, 2024</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <div>
                        <p className="font-medium">Entrance Exam</p>
                        <p className="text-sm text-muted-foreground">July 15, 2024</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      <div>
                        <p className="font-medium">Admission Results</p>
                        <p className="text-sm text-muted-foreground">July 30, 2024</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                      <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                      <div>
                        <p className="font-medium">Academic Year Starts</p>
                        <p className="text-sm text-muted-foreground">August 15, 2024</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}