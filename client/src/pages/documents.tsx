import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, FileText, Download, Eye, Clock, CheckCircle, XCircle, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Document, Student } from "@shared/schema";

const documentTypes = [
  { value: "leaving_certificate", label: "Leaving Certificate", icon: "📜" },
  { value: "transfer_certificate", label: "Transfer Certificate", icon: "🔄" },
  { value: "bonafide_certificate", label: "Bonafide Certificate", icon: "✅" },
  { value: "leave_application", label: "Leave Application", icon: "📅" },
  { value: "character_certificate", label: "Character Certificate", icon: "⭐" },
  { value: "sports_certificate", label: "Sports Certificate", icon: "🏆" },
  { value: "migration_certificate", label: "Migration Certificate", icon: "🎓" },
];

const documentSchema = z.object({
  documentType: z.string().min(1, "Document type is required"),
  studentId: z.number().optional(),
  studentName: z.string().min(1, "Student name is required"),
  studentClass: z.string().min(1, "Class is required"),
  studentSection: z.string().min(1, "Section is required"),
  rollNumber: z.string().min(1, "Roll number is required"),
  purpose: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  reason: z.string().optional(),
  parentName: z.string().min(1, "Parent name is required"),
  parentPhone: z.string().min(1, "Parent phone is required"),
  transferSchool: z.string().optional(),
  lastAttendanceDate: z.string().optional(),
  conductGrade: z.string().default("Good"),
});

type DocumentFormData = z.infer<typeof documentSchema>;

export default function Documents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const createDocumentMutation = useMutation({
    mutationFn: (data: DocumentFormData) => apiRequest("POST", "/api/documents", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Document request created successfully",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create document request",
        variant: "destructive",
      });
    },
  });

  const updateDocumentMutation = useMutation({
    mutationFn: ({ id, action, remarks }: { id: number; action: "approve" | "reject"; remarks?: string }) =>
      apiRequest("POST", `/api/documents/${id}/${action}`, { remarks }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Success",
        description: "Document status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update document status",
        variant: "destructive",
      });
    },
  });

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      conductGrade: "Good",
    },
  });

  const selectedDocumentType = form.watch("documentType");
  const selectedStudentId = form.watch("studentId");

  // Auto-fill student details when student is selected
  const handleStudentSelect = (studentId: string) => {
    const student = students.find((s: Student) => s.id === parseInt(studentId));
    if (student) {
      form.setValue("studentId", student.id);
      form.setValue("studentName", student.name);
      form.setValue("studentClass", student.class);
      form.setValue("studentSection", student.section);
      form.setValue("rollNumber", student.rollNumber);
      form.setValue("parentName", student.parentName);
      form.setValue("parentPhone", student.parentPhone);
    }
  };

  const filteredDocuments = documents.filter((doc: Document) => {
    const matchesSearch = doc.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.documentType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    const matchesType = typeFilter === "all" || doc.documentType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case "issued":
        return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50"><Download className="w-3 h-3 mr-1" />Issued</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDocumentTypeInfo = (type: string) => {
    return documentTypes.find(dt => dt.value === type) || { label: type, icon: "📄" };
  };

  const onSubmit = (data: DocumentFormData) => {
    const formattedData = {
      ...data,
      fromDate: data.fromDate ? new Date(data.fromDate) : undefined,
      toDate: data.toDate ? new Date(data.toDate) : undefined,
      lastAttendanceDate: data.lastAttendanceDate ? new Date(data.lastAttendanceDate) : undefined,
    };
    createDocumentMutation.mutate(formattedData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Document Management</h1>
          <p className="text-muted-foreground mt-1">Issue certificates and manage applications</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary">
              <Plus className="w-4 h-4 mr-2" />
              New Document Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Document Request</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="documentType"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Document Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select document type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {documentTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <span className="flex items-center gap-2">
                                  <span>{type.icon}</span>
                                  {type.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="studentId"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Select Student (Optional)</FormLabel>
                        <Select onValueChange={handleStudentSelect}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a student to auto-fill details" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {students.map((student: Student) => (
                              <SelectItem key={student.id} value={student.id.toString()}>
                                {student.name} - {student.rollNumber} ({student.class}-{student.section})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="studentName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rollNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Roll Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="studentClass"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="studentSection"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="parentName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="parentPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent Phone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Conditional fields based on document type */}
                  {selectedDocumentType === "bonafide_certificate" && (
                    <FormField
                      control={form.control}
                      name="purpose"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Purpose</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Bank account opening, Scholarship application" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {selectedDocumentType === "leave_application" && (
                    <>
                      <FormField
                        control={form.control}
                        name="fromDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>From Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="toDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>To Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {selectedDocumentType === "transfer_certificate" && (
                    <FormField
                      control={form.control}
                      name="transferSchool"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Transfer to School</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Name of the school transferring to" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {(selectedDocumentType === "leaving_certificate" || selectedDocumentType === "transfer_certificate") && (
                    <>
                      <FormField
                        control={form.control}
                        name="lastAttendanceDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Attendance Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="conductGrade"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Conduct Grade</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Excellent">Excellent</SelectItem>
                                <SelectItem value="Good">Good</SelectItem>
                                <SelectItem value="Fair">Fair</SelectItem>
                                <SelectItem value="A">A</SelectItem>
                                <SelectItem value="B">B</SelectItem>
                                <SelectItem value="C">C</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {(selectedDocumentType === "leave_application" || selectedDocumentType === "transfer_certificate") && (
                    <FormField
                      control={form.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Reason</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Provide detailed reason" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createDocumentMutation.isPending}
                    className="gradient-primary"
                  >
                    {createDocumentMutation.isPending ? "Creating..." : "Create Request"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by student name, roll number, or document type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <FileText className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {documentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <div className="grid gap-4">
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No documents found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                  ? "No documents match your current filters."
                  : "Create your first document request to get started."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredDocuments.map((document: Document) => {
            const typeInfo = getDocumentTypeInfo(document.documentType);
            return (
              <Card key={document.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{typeInfo.icon}</span>
                        <div>
                          <h3 className="font-semibold text-lg">{typeInfo.label}</h3>
                          <p className="text-sm text-muted-foreground">
                            {document.studentName} - {document.rollNumber}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Class:</span>
                          <p className="font-medium">{document.studentClass}-{document.studentSection}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Parent:</span>
                          <p className="font-medium">{document.parentName}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Created:</span>
                          <p className="font-medium">
                            {new Date(document.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <div className="mt-1">{getStatusBadge(document.status)}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedDocument(document);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {document.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateDocumentMutation.mutate({ id: document.id, action: "approve" })}
                            disabled={updateDocumentMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateDocumentMutation.mutate({ id: document.id, action: "reject" })}
                            disabled={updateDocumentMutation.isPending}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {document.status === "approved" && (
                        <Button size="sm" className="gradient-primary">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* View Document Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Document Details</DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Document Type:</span>
                  <p className="font-medium">{getDocumentTypeInfo(selectedDocument.documentType).label}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <div className="mt-1">{getStatusBadge(selectedDocument.status)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Student:</span>
                  <p className="font-medium">{selectedDocument.studentName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Roll Number:</span>
                  <p className="font-medium">{selectedDocument.rollNumber}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Class:</span>
                  <p className="font-medium">{selectedDocument.studentClass}-{selectedDocument.studentSection}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Parent:</span>
                  <p className="font-medium">{selectedDocument.parentName}</p>
                </div>
                {selectedDocument.purpose && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Purpose:</span>
                    <p className="font-medium">{selectedDocument.purpose}</p>
                  </div>
                )}
                {selectedDocument.reason && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Reason:</span>
                    <p className="font-medium">{selectedDocument.reason}</p>
                  </div>
                )}
                {selectedDocument.remarks && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Remarks:</span>
                    <p className="font-medium">{selectedDocument.remarks}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}