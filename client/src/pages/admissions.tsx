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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
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
  const [currentStep, setCurrentStep] = useState(0);

  // Form completion tracking
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([false, false, false, false, false]);
  
  const steps = [
    { id: 0, title: "Basic Info", description: "Student details" },
    { id: 1, title: "Guardian Info", description: "Parent/Guardian details" },
    { id: 2, title: "Address", description: "Contact information" },
    { id: 3, title: "Academic", description: "Previous school details" },
    { id: 4, title: "Medical", description: "Health information" }
  ];

  const [newApplication, setNewApplication] = useState({
    // Student Basic Information
    studentName: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    nationality: "Indian",
    religion: "",
    category: "",
    class: "",
    rollNumber: "",
    
    // Guardian Information
    parentName: "",
    parentOccupation: "",
    parentIncome: "",
    email: "",
    phone: "",
    alternatePhone: "",
    
    // Address Information
    address: "",
    city: "",
    state: "",
    pincode: "",
    
    // Previous Academic Information
    previousSchool: "",
    previousClass: "",
    percentage: "",
    
    // Medical Information
    allergies: "",
    medicalConditions: "",
    emergencyContact: "",
    
    // Documents
    documents: [] as File[],
    
    // Admission Specific
    priority: "normal" as "normal" | "high" | "urgent",
  });

  // Fetch applications from API
  const { data: applications = [], isLoading, refetch } = useQuery<AdmissionApplication[]>({
    queryKey: ["/api/admissions"],
    staleTime: 30000, // 30 seconds
  });

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.applicationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.parentName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesClass = classFilter === "all" || app.class === classFilter;
    return matchesSearch && matchesStatus && matchesClass;
  });

  const uniqueClasses = Array.from(new Set(applications.map(app => app.class)));

  const statusStats = {
    pending: applications.filter(app => app.status === "pending").length,
    approved: applications.filter(app => app.status === "approved").length,
    rejected: applications.filter(app => app.status === "rejected").length,
    document_review: applications.filter(app => app.status === "document_review").length,
    interview_scheduled: applications.filter(app => app.status === "interview_scheduled").length,
  };

  const submitApplicationMutation = useMutation({
    mutationFn: async (applicationData: any) => {
      // Validate required fields before submission
      if (!applicationData.studentName || !applicationData.dateOfBirth || !applicationData.class || 
          !applicationData.parentName || !applicationData.email || !applicationData.phone || !applicationData.address) {
        throw new Error("Please fill all required fields");
      }

      const response = await apiRequest("POST", "/api/admissions", applicationData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      toast({
        title: "Application Submitted Successfully",
        description: `Application ${data.applicationNumber} has been created and is pending review`,
      });
      setIsNewApplicationOpen(false);
      resetForm();
      refetch(); // Refresh the admissions list
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const approveApplicationMutation = useMutation({
    mutationFn: async (applicationId: number) => {
      const response = await apiRequest("POST", `/api/admissions/${applicationId}/approve`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      toast({
        title: "Application Approved",
        description: `Student ${data.student.name} (Roll: ${data.student.rollNumber}) has been admitted and added to the system`,
      });
      refetch(); // Refresh the admissions list
    },
    onError: (error: any) => {
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const validFiles = Array.from(files).filter(file => {
        const validTypes = ['.pdf', '.jpg', '.jpeg', '.png'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        return validTypes.some(type => file.name.toLowerCase().endsWith(type)) && file.size <= maxSize;
      });
      setNewApplication({ ...newApplication, documents: [...newApplication.documents, ...validFiles] });
    }
  };

  const removeDocument = (index: number) => {
    const updatedDocs = newApplication.documents.filter((_, i) => i !== index);
    setNewApplication({ ...newApplication, documents: updatedDocs });
  };

  // Validation functions for each step
  const validateStep = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0: // Basic Info
        return !!(newApplication.studentName && newApplication.dateOfBirth && newApplication.gender && newApplication.class);
      case 1: // Guardian Info
        return !!(newApplication.parentName && newApplication.email && newApplication.phone);
      case 2: // Address
        return !!(newApplication.address && newApplication.city && newApplication.state);
      case 3: // Academic
        return true; // Optional step
      case 4: // Medical
        return true; // Optional step
      default:
        return false;
    }
  };

  const updateStepCompletion = () => {
    const newCompletedSteps = steps.map((_, index) => validateStep(index));
    setCompletedSteps(newCompletedSteps);
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      updateStepCompletion();
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required fields for this step",
        variant: "destructive",
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitApplication = () => {
    updateStepCompletion();
    
    if (!validateStep(0) || !validateStep(1) || !validateStep(2)) {
      toast({
        title: "Missing Information",
        description: "Please complete all required steps before submitting",
        variant: "destructive",
      });
      return;
    }

    submitApplicationMutation.mutate(newApplication);
  };

  const resetForm = () => {
    setNewApplication({
      studentName: "",
      dateOfBirth: "",
      gender: "",
      bloodGroup: "",
      nationality: "Indian",
      religion: "",
      category: "",
      class: "",
      rollNumber: "",
      parentName: "",
      parentOccupation: "",
      parentIncome: "",
      email: "",
      phone: "",
      alternatePhone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      previousSchool: "",
      previousClass: "",
      percentage: "",
      allergies: "",
      medicalConditions: "",
      emergencyContact: "",
      documents: [],
      priority: "normal",
    });
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

  const viewApplicationDetails = (application: AdmissionApplication) => {
    setSelectedApplication(application);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Student Admissions & Registration
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete student admission process with automatic student registration upon approval
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export List
          </Button>
          <Dialog open={isNewApplicationOpen} onOpenChange={setIsNewApplicationOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Application
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Student Admission Application</DialogTitle>
                <DialogDescription>
                  Complete student admission application with comprehensive information for student registration.
                </DialogDescription>
              </DialogHeader>
              
              {/* Progress Indicator */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Application Progress</span>
                  <span className="text-sm text-muted-foreground">
                    Step {currentStep + 1} of {steps.length}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                          index === currentStep
                            ? "bg-primary text-primary-foreground"
                            : completedSteps[index]
                            ? "bg-green-500 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {completedSteps[index] ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div className="ml-2 hidden md:block">
                        <div className="text-xs font-medium">{step.title}</div>
                        <div className="text-xs text-muted-foreground">{step.description}</div>
                      </div>
                      {index < steps.length - 1 && (
                        <div className="w-8 h-px bg-muted mx-2" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Tabs value={steps[currentStep]?.title.toLowerCase().replace(" ", "")} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="guardian">Guardian</TabsTrigger>
                  <TabsTrigger value="address">Address</TabsTrigger>
                  <TabsTrigger value="academic">Academic</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="studentName">Student Full Name *</Label>
                      <Input 
                        id="studentName"
                        value={newApplication.studentName}
                        onChange={(e) => setNewApplication({ ...newApplication, studentName: e.target.value })}
                        placeholder="Enter student's full name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rollNumber">Roll Number</Label>
                      <Input 
                        id="rollNumber"
                        value={newApplication.rollNumber}
                        onChange={(e) => setNewApplication({ ...newApplication, rollNumber: e.target.value })}
                        placeholder="Auto-generated or enter manually"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal mt-1"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newApplication.dateOfBirth ? format(new Date(newApplication.dateOfBirth), "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newApplication.dateOfBirth ? new Date(newApplication.dateOfBirth) : undefined}
                            onSelect={(date) => date && setNewApplication({ ...newApplication, dateOfBirth: format(date, "yyyy-MM-dd") })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label htmlFor="gender">Gender *</Label>
                      <Select value={newApplication.gender} onValueChange={(value) => setNewApplication({ ...newApplication, gender: value })}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="bloodGroup">Blood Group</Label>
                      <Select value={newApplication.bloodGroup} onValueChange={(value) => setNewApplication({ ...newApplication, bloodGroup: value })}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select blood group" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="nationality">Nationality</Label>
                      <Input 
                        id="nationality"
                        value={newApplication.nationality}
                        onChange={(e) => setNewApplication({ ...newApplication, nationality: e.target.value })}
                        placeholder="e.g., Indian"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="religion">Religion</Label>
                      <Input 
                        id="religion"
                        value={newApplication.religion}
                        onChange={(e) => setNewApplication({ ...newApplication, religion: e.target.value })}
                        placeholder="Enter religion"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={newApplication.category} onValueChange={(value) => setNewApplication({ ...newApplication, category: value })}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="obc">OBC</SelectItem>
                          <SelectItem value="sc">SC</SelectItem>
                          <SelectItem value="st">ST</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="class">Applying for Class *</Label>
                    <Select value={newApplication.class} onValueChange={(value) => setNewApplication({ ...newApplication, class: value })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Nursery">Nursery</SelectItem>
                        <SelectItem value="LKG">LKG</SelectItem>
                        <SelectItem value="UKG">UKG</SelectItem>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="allergies">Allergies (if any)</Label>
                      <Textarea 
                        id="allergies"
                        value={newApplication.allergies}
                        onChange={(e) => setNewApplication({ ...newApplication, allergies: e.target.value })}
                        placeholder="List any known allergies"
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="medicalConditions">Medical Conditions</Label>
                      <Textarea 
                        id="medicalConditions"
                        value={newApplication.medicalConditions}
                        onChange={(e) => setNewApplication({ ...newApplication, medicalConditions: e.target.value })}
                        placeholder="List any medical conditions"
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="guardian" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="parentName">Parent/Guardian Name *</Label>
                      <Input 
                        id="parentName"
                        value={newApplication.parentName}
                        onChange={(e) => setNewApplication({ ...newApplication, parentName: e.target.value })}
                        placeholder="Enter parent/guardian name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="parentOccupation">Occupation</Label>
                      <Input 
                        id="parentOccupation"
                        value={newApplication.parentOccupation}
                        onChange={(e) => setNewApplication({ ...newApplication, parentOccupation: e.target.value })}
                        placeholder="Enter occupation"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input 
                        id="email"
                        type="email"
                        value={newApplication.email}
                        onChange={(e) => setNewApplication({ ...newApplication, email: e.target.value })}
                        placeholder="Enter email address"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="parentIncome">Annual Income</Label>
                      <Input 
                        id="parentIncome"
                        value={newApplication.parentIncome}
                        onChange={(e) => setNewApplication({ ...newApplication, parentIncome: e.target.value })}
                        placeholder="Enter annual income"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Primary Phone Number *</Label>
                      <Input 
                        id="phone"
                        value={newApplication.phone}
                        onChange={(e) => setNewApplication({ ...newApplication, phone: e.target.value })}
                        placeholder="Enter phone number"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="alternatePhone">Alternate Phone</Label>
                      <Input 
                        id="alternatePhone"
                        value={newApplication.alternatePhone}
                        onChange={(e) => setNewApplication({ ...newApplication, alternatePhone: e.target.value })}
                        placeholder="Enter alternate phone"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input 
                      id="emergencyContact"
                      value={newApplication.emergencyContact}
                      onChange={(e) => setNewApplication({ ...newApplication, emergencyContact: e.target.value })}
                      placeholder="Name and phone of emergency contact"
                      className="mt-1"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="address" className="space-y-4">
                  <div>
                    <Label htmlFor="address">Street Address *</Label>
                    <Textarea 
                      id="address"
                      value={newApplication.address}
                      onChange={(e) => setNewApplication({ ...newApplication, address: e.target.value })}
                      placeholder="Enter complete street address"
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input 
                        id="city"
                        value={newApplication.city}
                        onChange={(e) => setNewApplication({ ...newApplication, city: e.target.value })}
                        placeholder="Enter city"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input 
                        id="state"
                        value={newApplication.state}
                        onChange={(e) => setNewApplication({ ...newApplication, state: e.target.value })}
                        placeholder="Enter state"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pincode">PIN Code *</Label>
                      <Input 
                        id="pincode"
                        value={newApplication.pincode}
                        onChange={(e) => setNewApplication({ ...newApplication, pincode: e.target.value })}
                        placeholder="Enter PIN code"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="academic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="previousSchool">Previous School</Label>
                      <Input 
                        id="previousSchool"
                        value={newApplication.previousSchool}
                        onChange={(e) => setNewApplication({ ...newApplication, previousSchool: e.target.value })}
                        placeholder="Enter previous school name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="previousClass">Previous Class</Label>
                      <Input 
                        id="previousClass"
                        value={newApplication.previousClass}
                        onChange={(e) => setNewApplication({ ...newApplication, previousClass: e.target.value })}
                        placeholder="Enter previous class"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="percentage">Previous Academic Performance (%)</Label>
                    <Input 
                      id="percentage"
                      value={newApplication.percentage}
                      onChange={(e) => setNewApplication({ ...newApplication, percentage: e.target.value })}
                      placeholder="Enter percentage or grade"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="priority">Application Priority</Label>
                    <Select value={newApplication.priority} onValueChange={(value: "normal" | "high" | "urgent") => setNewApplication({ ...newApplication, priority: value })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="space-y-4">
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
                          <li>• Address Proof</li>
                          <li>• Caste/Category Certificate (if applicable)</li>
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
                </TabsContent>

                {/* Step Navigation */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={prevStep}
                      disabled={currentStep === 0}
                    >
                      Previous
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => {
                      setIsNewApplicationOpen(false);
                      setCurrentStep(0);
                      resetForm();
                    }}>
                      Cancel
                    </Button>
                    
                    {currentStep < steps.length - 1 ? (
                      <Button onClick={nextStep}>
                        Next Step
                      </Button>
                    ) : (
                      <Button 
                        onClick={submitApplication} 
                        disabled={submitApplicationMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {submitApplicationMutation.isPending ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                            Submitting...
                          </>
                        ) : (
                          "Submit Application"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </Tabs>
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
          <CardDescription>
            Manage student admission applications and approve to create student records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <div
                key={application.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {application.studentName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{application.studentName}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{application.applicationNumber}</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {application.class}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {application.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {application.email}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Parent: {application.parentName} • Applied: {format(application.applicationDate, "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`${getStatusColor(application.status)} flex items-center gap-1`}>
                    {getStatusIcon(application.status)}
                    {application.status.replace('_', ' ').charAt(0).toUpperCase() + application.status.replace('_', ' ').slice(1)}
                  </Badge>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => viewApplicationDetails(application)}>
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    {application.status === "pending" && (
                      <Button 
                        size="sm" 
                        onClick={() => approveApplicationMutation.mutate(application.id)}
                        disabled={approveApplicationMutation.isPending}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approve & Create Student
                      </Button>
                    )}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details - {selectedApplication?.studentName}</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Application Number</Label>
                  <p className="font-medium">{selectedApplication.applicationNumber}</p>
                </div>
                <div>
                  <Label>Application Date</Label>
                  <p className="font-medium">{format(selectedApplication.applicationDate, "PPP")}</p>
                </div>
                <div>
                  <Label>Student Name</Label>
                  <p className="font-medium">{selectedApplication.studentName}</p>
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <p className="font-medium">{format(new Date(selectedApplication.dateOfBirth), "PPP")}</p>
                </div>
                <div>
                  <Label>Class Applied For</Label>
                  <p className="font-medium">{selectedApplication.class}</p>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Badge variant={selectedApplication.priority === "urgent" ? "destructive" : selectedApplication.priority === "high" ? "secondary" : "outline"}>
                    {selectedApplication.priority.charAt(0).toUpperCase() + selectedApplication.priority.slice(1)}
                  </Badge>
                </div>
              </div>

              <div>
                <Label>Parent/Guardian Information</Label>
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <p><strong>Name:</strong> {selectedApplication.parentName}</p>
                  <p><strong>Email:</strong> {selectedApplication.email}</p>
                  <p><strong>Phone:</strong> {selectedApplication.phone}</p>
                  <p><strong>Address:</strong> {selectedApplication.address}</p>
                </div>
              </div>

              {selectedApplication.previousSchool && (
                <div>
                  <Label>Previous School</Label>
                  <p className="font-medium">{selectedApplication.previousSchool}</p>
                </div>
              )}

              <div>
                <Label>Documents ({selectedApplication.documents.length})</Label>
                <div className="mt-2 space-y-2">
                  {selectedApplication.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">{doc.name}</span>
                        <span className="text-sm text-muted-foreground">({doc.size})</span>
                      </div>
                      <Badge className={getStatusColor(doc.status)}>
                        {doc.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                {selectedApplication.status === "pending" && (
                  <>
                    <Button variant="outline">
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button 
                      onClick={() => approveApplicationMutation.mutate(selectedApplication.id)}
                      disabled={approveApplicationMutation.isPending}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve & Create Student
                    </Button>
                  </>
                )}
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}