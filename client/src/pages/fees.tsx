import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, DollarSign, Clock, CheckCircle, 
  AlertCircle, CreditCard, Receipt, Plus,
  ArrowUpRight, ArrowDownRight, Users, FileText,
  Calendar, Filter, Download
} from "lucide-react";
import { Fee, Student } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Fees() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [selectedFees, setSelectedFees] = useState<number[]>([]);
  const [isCreateFeeModalOpen, setIsCreateFeeModalOpen] = useState(false);
  const [isBulkFeeModalOpen, setIsBulkFeeModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const { toast } = useToast();

  const { data: fees = [], isLoading: feesLoading } = useQuery<Fee[]>({
    queryKey: ["/api/fees"],
  });

  const { data: students = [], isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const [newFee, setNewFee] = useState({
    studentId: "",
    feeType: "",
    amount: "",
    dueDate: "",
    remarks: ""
  });

  const [bulkFee, setBulkFee] = useState({
    studentIds: [] as number[],
    feeType: "",
    amount: "",
    dueDate: "",
    remarks: ""
  });

  const [payment, setPayment] = useState({
    paymentMethod: "",
    remarks: ""
  });

  // Create single fee
  const createFeeMutation = useMutation({
    mutationFn: async (feeData: any) => {
      return await apiRequest("POST", "/api/fees", {
        ...feeData,
        studentId: parseInt(feeData.studentId),
        amount: parseFloat(feeData.amount),
        dueDate: new Date(feeData.dueDate)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fees"] });
      setIsCreateFeeModalOpen(false);
      resetNewFee();
      toast({
        title: "Fee Created",
        description: "Fee has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create fee",
        variant: "destructive",
      });
    },
  });

  // Create bulk fees
  const createBulkFeesMutation = useMutation({
    mutationFn: async (bulkData: any) => {
      return await apiRequest("POST", "/api/fees/bulk", {
        ...bulkData,
        amount: parseFloat(bulkData.amount),
        dueDate: new Date(bulkData.dueDate)
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/fees"] });
      setIsBulkFeeModalOpen(false);
      resetBulkFee();
      toast({
        title: "Bulk Fees Created",
        description: `${data.fees.length} fees created successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create bulk fees",
        variant: "destructive",
      });
    },
  });

  // Process payment
  const processPaymentMutation = useMutation({
    mutationFn: async ({ feeId, paymentData }: { feeId: number; paymentData: any }) => {
      return await apiRequest("POST", `/api/fees/${feeId}/pay`, paymentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fees"] });
      setIsPaymentModalOpen(false);
      setSelectedFee(null);
      resetPayment();
      toast({
        title: "Payment Processed",
        description: "Payment has been processed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    },
  });

  const resetNewFee = () => {
    setNewFee({
      studentId: "",
      feeType: "",
      amount: "",
      dueDate: "",
      remarks: ""
    });
  };

  const resetBulkFee = () => {
    setBulkFee({
      studentIds: [],
      feeType: "",
      amount: "",
      dueDate: "",
      remarks: ""
    });
  };

  const resetPayment = () => {
    setPayment({
      paymentMethod: "",
      remarks: ""
    });
  };

  const handleCreateFee = () => {
    if (!newFee.studentId || !newFee.feeType || !newFee.amount || !newFee.dueDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    createFeeMutation.mutate(newFee);
  };

  const handleCreateBulkFees = () => {
    if (!bulkFee.studentIds.length || !bulkFee.feeType || !bulkFee.amount || !bulkFee.dueDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select students",
        variant: "destructive",
      });
      return;
    }
    createBulkFeesMutation.mutate(bulkFee);
  };

  const handleProcessPayment = () => {
    if (!selectedFee || !payment.paymentMethod) {
      toast({
        title: "Missing Information",
        description: "Please select payment method",
        variant: "destructive",
      });
      return;
    }
    processPaymentMutation.mutate({ feeId: selectedFee.id, paymentData: payment });
  };

  const openPaymentModal = (fee: Fee) => {
    setSelectedFee(fee);
    setIsPaymentModalOpen(true);
  };

  const filteredFees = fees.filter(fee => {
    const student = students.find(s => s.id === fee.studentId);
    const matchesSearch = student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student?.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fee.feeType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || fee.status === statusFilter;
    const matchesClass = classFilter === "all" || student?.class === classFilter;
    return matchesSearch && matchesStatus && matchesClass;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "overdue":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const totalFees = fees.reduce((sum, fee) => sum + parseFloat(fee.amount), 0);
  const paidFees = fees.filter(fee => fee.status === "paid").reduce((sum, fee) => sum + parseFloat(fee.amount), 0);
  const pendingFees = fees.filter(fee => fee.status === "pending").reduce((sum, fee) => sum + parseFloat(fee.amount), 0);
  const overdueFees = fees.filter(fee => fee.status === "overdue").reduce((sum, fee) => sum + parseFloat(fee.amount), 0);

  const uniqueClasses = [...new Set(students.map(s => s.class))];
  const feeTypes = ["Tuition", "Transport", "Library", "Sports", "Exam", "Laboratory", "Activity", "Other"];

  if (feesLoading || studentsLoading) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--edu-text)]">Fee Management</h1>
          <p className="text-gray-600">Manage student fees and payment processing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={isBulkFeeModalOpen} onOpenChange={setIsBulkFeeModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Bulk Create
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Bulk Fees</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Select Students</Label>
                  <div className="border rounded-md p-3 max-h-48 overflow-y-auto">
                    {students.map(student => (
                      <div key={student.id} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          checked={bulkFee.studentIds.includes(student.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setBulkFee({
                                ...bulkFee,
                                studentIds: [...bulkFee.studentIds, student.id]
                              });
                            } else {
                              setBulkFee({
                                ...bulkFee,
                                studentIds: bulkFee.studentIds.filter(id => id !== student.id)
                              });
                            }
                          }}
                        />
                        <span className="text-sm">
                          {student.name} ({student.rollNumber}) - Class {student.class}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Fee Type</Label>
                    <Select value={bulkFee.feeType} onValueChange={(value) => setBulkFee({...bulkFee, feeType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select fee type" />
                      </SelectTrigger>
                      <SelectContent>
                        {feeTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      value={bulkFee.amount}
                      onChange={(e) => setBulkFee({...bulkFee, amount: e.target.value})}
                      placeholder="Enter amount"
                    />
                  </div>
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={bulkFee.dueDate}
                    onChange={(e) => setBulkFee({...bulkFee, dueDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Remarks</Label>
                  <Textarea
                    value={bulkFee.remarks}
                    onChange={(e) => setBulkFee({...bulkFee, remarks: e.target.value})}
                    placeholder="Optional remarks"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsBulkFeeModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateBulkFees} disabled={createBulkFeesMutation.isPending}>
                    {createBulkFeesMutation.isPending ? "Creating..." : "Create Fees"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isCreateFeeModalOpen} onOpenChange={setIsCreateFeeModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Fee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Fee</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Student</Label>
                  <Select value={newFee.studentId} onValueChange={(value) => setNewFee({...newFee, studentId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map(student => (
                        <SelectItem key={student.id} value={student.id.toString()}>
                          {student.name} ({student.rollNumber}) - Class {student.class}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Fee Type</Label>
                    <Select value={newFee.feeType} onValueChange={(value) => setNewFee({...newFee, feeType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select fee type" />
                      </SelectTrigger>
                      <SelectContent>
                        {feeTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      value={newFee.amount}
                      onChange={(e) => setNewFee({...newFee, amount: e.target.value})}
                      placeholder="Enter amount"
                    />
                  </div>
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={newFee.dueDate}
                    onChange={(e) => setNewFee({...newFee, dueDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Remarks</Label>
                  <Textarea
                    value={newFee.remarks}
                    onChange={(e) => setNewFee({...newFee, remarks: e.target.value})}
                    placeholder="Optional remarks"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateFeeModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateFee} disabled={createFeeMutation.isPending}>
                    {createFeeMutation.isPending ? "Creating..." : "Create Fee"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Fee Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalFees.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {fees.length} total fees
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collected</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{paidFees.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {fees.filter(f => f.status === "paid").length} paid fees
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">₹{pendingFees.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {fees.filter(f => f.status === "pending").length} pending fees
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{overdueFees.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {fees.filter(f => f.status === "overdue").length} overdue fees
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Records</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by student name, roll number, or fee type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-40">
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
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Fee Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No fees found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFees.map((fee) => {
                    const student = students.find(s => s.id === fee.studentId);
                    return (
                      <TableRow key={fee.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{student?.name || "Unknown"}</div>
                            <div className="text-sm text-gray-500">
                              {student?.rollNumber} - Class {student?.class}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{fee.feeType}</TableCell>
                        <TableCell className="font-medium">₹{parseFloat(fee.amount).toLocaleString()}</TableCell>
                        <TableCell>{format(new Date(fee.dueDate), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(fee.status)}
                            <Badge className={getStatusColor(fee.status)}>
                              {fee.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {fee.paymentMethod && (
                            <div className="flex items-center gap-1">
                              <CreditCard className="w-4 h-4" />
                              <span className="capitalize">{fee.paymentMethod}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {fee.status === "pending" && (
                              <Button
                                size="sm"
                                onClick={() => openPaymentModal(fee)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Receipt className="w-4 h-4 mr-1" />
                                Pay
                              </Button>
                            )}
                            {fee.status === "paid" && (
                              <Badge variant="outline" className="text-green-600">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Paid
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
          </DialogHeader>
          {selectedFee && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Fee Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Student: {students.find(s => s.id === selectedFee.studentId)?.name}</div>
                  <div>Fee Type: {selectedFee.feeType}</div>
                  <div>Amount: ₹{parseFloat(selectedFee.amount).toLocaleString()}</div>
                  <div>Due Date: {format(new Date(selectedFee.dueDate), 'MMM dd, yyyy')}</div>
                </div>
              </div>
              <div>
                <Label>Payment Method</Label>
                <Select value={payment.paymentMethod} onValueChange={(value) => setPayment({...payment, paymentMethod: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="online">Online Transfer</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Payment Remarks</Label>
                <Textarea
                  value={payment.remarks}
                  onChange={(e) => setPayment({...payment, remarks: e.target.value})}
                  placeholder="Optional payment remarks"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleProcessPayment} disabled={processPaymentMutation.isPending}>
                  {processPaymentMutation.isPending ? "Processing..." : "Process Payment"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}