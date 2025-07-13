import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  UserCheck,
  Upload,
  CalendarIcon,
  Eye,
  User,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Heart,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

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
  const queryClient = useQueryClient();

  // State management
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewApplicationOpen, setIsNewApplicationOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<AdmissionApplication | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
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
    
    // Parent/Guardian Information
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
    
    // Previous School Information
    previousSchool: "",
    previousClass: "",
    percentage: "",
    
    // Medical Information
    allergies: "",
    medicalConditions: "",
    emergencyContact: "",
    
    // Application Information
    documents: [] as DocumentInfo[],
    priority: "normal" as "normal" | "high" | "urgent",
  });

  // Fetch admissions data
  const { data: admissions = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/admissions"],
  });

  // Filter applications based on search term, status, and class
  const filteredApplications = admissions?.filter((app: AdmissionApplication) => {
    const matchesSearch = app.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.applicationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.parentName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesClass = classFilter === "all" || app.class === classFilter;
    return matchesSearch && matchesStatus && matchesClass;
  }) || [];

  // Get unique classes for filter
  const uniqueClasses = Array.from(new Set(admissions?.map((app: AdmissionApplication) => app.class) || []));

  // Status statistics
  const statusStats = {
    pending: admissions?.filter((app: AdmissionApplication) => app.status === "pending").length || 0,
    approved: admissions?.filter((app: AdmissionApplication) => app.status === "approved").length || 0,
    rejected: admissions?.filter((app: AdmissionApplication) => app.status === "rejected").length || 0,
    document_review: admissions?.filter((app: AdmissionApplication) => app.status === "document_review").length || 0,
    interview_scheduled: admissions?.filter((app: AdmissionApplication) => app.status === "interview_scheduled").length || 0,
  };

  // Submit new application
  const submitApplicationMutation = useMutation({
    mutationFn: async (applicationData: any) => {
      console.log("Sending application data:", applicationData);
      const response = await apiRequest("POST", "/api/admissions", applicationData);
      console.log("API Response:", response);
      return response;
    },
    onSuccess: (data) => {
      console.log("Application submitted successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/admissions"] });
      setIsNewApplicationOpen(false);
      resetForm();
      setCurrentStep(0);
      toast({
        title: "Application Submitted",
        description: "Student admission application has been submitted successfully",
      });
    },
    onError: (error: any) => {
      console.error("Submission error:", error);
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
      refetch();
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
        const isValidType = file.type.includes('pdf') || file.type.includes('image');
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
        return isValidType && isValidSize;
      });

      const documentFiles: DocumentInfo[] = validFiles.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        status: "pending" as const,
        uploadDate: new Date(),
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
      }));

      setNewApplication({
        ...newApplication,
        documents: [...newApplication.documents, ...documentFiles]
      });
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

    // Log the application data for debugging
    console.log("Submitting application:", newApplication);
    
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

              {/* Current Step Content */}
              <div className="space-y-6">
                {/* Step 0: Basic Info */}
                {currentStep === 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Basic Information</h3>
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
                            <CalendarComponent
                              mode="single"
                              selected={newApplication.dateOfBirth ? new Date(newApplication.dateOfBirth) : undefined}
                              onSelect={(date) => setNewApplication({ ...newApplication, dateOfBirth: date ? format(date, "yyyy-MM-dd") : "" })}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
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
                        <Label htmlFor="class">Class/Grade *</Label>
                        <Select value={newApplication.class} onValueChange={(value) => setNewApplication({ ...newApplication, class: value })}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="nursery">Nursery</SelectItem>
                            <SelectItem value="lkg">LKG</SelectItem>
                            <SelectItem value="ukg">UKG</SelectItem>
                            <SelectItem value="1">Class 1</SelectItem>
                            <SelectItem value="2">Class 2</SelectItem>
                            <SelectItem value="3">Class 3</SelectItem>
                            <SelectItem value="4">Class 4</SelectItem>
                            <SelectItem value="5">Class 5</SelectItem>
                            <SelectItem value="6">Class 6</SelectItem>
                            <SelectItem value="7">Class 7</SelectItem>
                            <SelectItem value="8">Class 8</SelectItem>
                            <SelectItem value="9">Class 9</SelectItem>
                            <SelectItem value="10">Class 10</SelectItem>
                            <SelectItem value="11">Class 11</SelectItem>
                            <SelectItem value="12">Class 12</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 1: Guardian Info */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Guardian Information</h3>
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
                        <Label htmlFor="phone">Primary Phone *</Label>
                        <Input 
                          id="phone"
                          value={newApplication.phone}
                          onChange={(e) => setNewApplication({ ...newApplication, phone: e.target.value })}
                          placeholder="Enter primary phone number"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Address */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Address Information</h3>
                    <div>
                      <Label htmlFor="address">Complete Address *</Label>
                      <Textarea 
                        id="address"
                        value={newApplication.address}
                        onChange={(e) => setNewApplication({ ...newApplication, address: e.target.value })}
                        placeholder="Enter complete address"
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
                        <Label htmlFor="pincode">PIN Code</Label>
                        <Input 
                          id="pincode"
                          value={newApplication.pincode}
                          onChange={(e) => setNewApplication({ ...newApplication, pincode: e.target.value })}
                          placeholder="Enter PIN code"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Academic */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Academic Information</h3>
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
                        <Label htmlFor="previousClass">Previous Class/Grade</Label>
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
                      <Label htmlFor="percentage">Previous Academic Performance</Label>
                      <Input 
                        id="percentage"
                        value={newApplication.percentage}
                        onChange={(e) => setNewApplication({ ...newApplication, percentage: e.target.value })}
                        placeholder="Enter percentage or grade"
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}

                {/* Step 4: Medical */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Medical Information</h3>
                    <div>
                      <Label htmlFor="allergies">Allergies</Label>
                      <Textarea 
                        id="allergies"
                        value={newApplication.allergies}
                        onChange={(e) => setNewApplication({ ...newApplication, allergies: e.target.value })}
                        placeholder="Any allergies or medical conditions"
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="medicalConditions">Medical Conditions</Label>
                      <Textarea 
                        id="medicalConditions"
                        value={newApplication.medicalConditions}
                        onChange={(e) => setNewApplication({ ...newApplication, medicalConditions: e.target.value })}
                        placeholder="Any ongoing medical conditions or treatments"
                        className="mt-1"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="emergencyContact">Emergency Contact</Label>
                      <Input 
                        id="emergencyContact"
                        value={newApplication.emergencyContact}
                        onChange={(e) => setNewApplication({ ...newApplication, emergencyContact: e.target.value })}
                        placeholder="Emergency contact person and number"
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>

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
              <Clock className="h-8 w-8 text-yellow-500" />
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
              <CheckCircle className="h-8 w-8 text-green-500" />
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
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Document Review</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{statusStats.document_review}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Interview Scheduled</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{statusStats.interview_scheduled}</p>
              </div>
              <UserCheck className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications List */}
      <Card className="animate-slide-up">
        <CardHeader>
          <CardTitle>Admission Applications</CardTitle>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="document_review">Document Review</SelectItem>
                  <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {uniqueClasses.map(cls => (
                    <SelectItem key={cls} value={cls}>Class {cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No applications found matching your criteria.</p>
                </div>
              ) : (
                filteredApplications.map((application: AdmissionApplication) => (
                <div key={application.id} className="border rounded-lg p-4 hover:shadow-md transition-all">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{application.studentName}</h3>
                        <Badge className={getStatusColor(application.status)}>
                          {getStatusIcon(application.status)}
                          <span className="ml-1 capitalize">{application.status.replace('_', ' ')}</span>
                        </Badge>
                        {application.priority !== 'normal' && (
                          <Badge variant={application.priority === 'urgent' ? 'destructive' : 'secondary'}>
                            {application.priority}
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>App #{application.applicationNumber}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <GraduationCap className="h-3 w-3" />
                          <span>Class {application.class}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{application.phone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span>{application.email}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => viewApplicationDetails(application)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {application.status === 'pending' && (
                        <Button 
                          size="sm" 
                          onClick={() => approveApplicationMutation.mutate(application.id)}
                          disabled={approveApplicationMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {approveApplicationMutation.isPending ? "Approving..." : "Approve"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}