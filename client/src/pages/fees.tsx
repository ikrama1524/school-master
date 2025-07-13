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
import { Switch } from "@/components/ui/switch";
import { 
  Search, DollarSign, Clock, CheckCircle, 
  AlertCircle, CreditCard, Receipt, Plus,
  ArrowUpRight, ArrowDownRight, Users, FileText,
  Calendar, Filter, Download, Settings, 
  BookOpen, TrendingUp, Zap, Building, 
  Target, PieChart, BarChart3, Layers,
  Edit, Trash2, CheckCircle2, Play
} from "lucide-react";
import { Fee, Student, FeeStructure, FeeStructureItem } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Fees() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [selectedFees, setSelectedFees] = useState<number[]>([]);
  const [isCreateFeeModalOpen, setIsCreateFeeModalOpen] = useState(false);
  const [isCreateStructureModalOpen, setIsCreateStructureModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [selectedStructure, setSelectedStructure] = useState<FeeStructure | null>(null);
  const { toast } = useToast();

  const { data: fees = [], isLoading: feesLoading } = useQuery<Fee[]>({
    queryKey: ["/api/fees"],
  });

  const { data: students = [], isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const { data: feeStructures = [], isLoading: structuresLoading } = useQuery<FeeStructure[]>({
    queryKey: ["/api/fee-structures"],
  });

  const [newFee, setNewFee] = useState({
    studentId: "",
    feeType: "",
    amount: "",
    dueDate: "",
    remarks: "",
    academicYear: "2024-25"
  });

  const [newStructure, setNewStructure] = useState({
    name: "",
    description: "",
    class: "",
    academicYear: "2024-25",
    items: [] as Array<{
      feeType: string;
      amount: string;
      frequency: string;
      dueDay: string;
      isOptional: boolean;
      description: string;
    }>
  });

  const [payment, setPayment] = useState({
    paymentMethod: "",
    remarks: ""
  });

  // Create single fee
  const createFeeMutation = useMutation({
    mutationFn: async (feeData: any) => {
      return await apiRequest("POST", "/api/fees", feeData);
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

  // Create fee structure
  const createStructureMutation = useMutation({
    mutationFn: async (structureData: any) => {
      const { items, ...structure } = structureData;
      const createdStructure = await apiRequest("POST", "/api/fee-structures", structure);
      
      // Create structure items
      for (const item of items) {
        await apiRequest("POST", `/api/fee-structures/${createdStructure.id}/items`, {
          ...item,
          amount: parseFloat(item.amount),
          dueDay: parseInt(item.dueDay)
        });
      }
      
      return createdStructure;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fee-structures"] });
      setIsCreateStructureModalOpen(false);
      resetNewStructure();
      toast({
        title: "Fee Structure Created",
        description: "Fee structure has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create fee structure",
        variant: "destructive",
      });
    },
  });

  // Generate fees from structure
  const generateFeesMutation = useMutation({
    mutationFn: async ({ structureId, studentIds }: { structureId: number; studentIds: number[] }) => {
      return await apiRequest("POST", `/api/fee-structures/${structureId}/generate-fees`, { studentIds });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/fees"] });
      toast({
        title: "Fees Generated",
        description: `${data.fees.length} fees generated successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate fees",
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
      remarks: "",
      academicYear: "2024-25"
    });
  };

  const resetNewStructure = () => {
    setNewStructure({
      name: "",
      description: "",
      class: "",
      academicYear: "2024-25",
      items: []
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
    createFeeMutation.mutate({
      ...newFee,
      studentId: parseInt(newFee.studentId),
      amount: parseFloat(newFee.amount),
      dueDate: newFee.dueDate
    });
  };

  const handleCreateStructure = () => {
    if (!newStructure.name || !newStructure.class || !newStructure.items.length) {
      toast({
        title: "Missing Information",
        description: "Please fill in structure details and add at least one fee item",
        variant: "destructive",
      });
      return;
    }
    createStructureMutation.mutate(newStructure);
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

  const handleGenerateFeesFromStructure = (structureId: number) => {
    const classStudents = students.filter(s => s.class === selectedStructure?.class);
    generateFeesMutation.mutate({ 
      structureId, 
      studentIds: classStudents.map(s => s.id) 
    });
  };

  const openPaymentModal = (fee: Fee) => {
    setSelectedFee(fee);
    setIsPaymentModalOpen(true);
  };

  const addFeeItem = () => {
    setNewStructure({
      ...newStructure,
      items: [...newStructure.items, {
        feeType: "",
        amount: "",
        frequency: "monthly",
        dueDay: "15",
        isOptional: false,
        description: ""
      }]
    });
  };

  const removeFeeItem = (index: number) => {
    setNewStructure({
      ...newStructure,
      items: newStructure.items.filter((_, i) => i !== index)
    });
  };

  const updateFeeItem = (index: number, field: string, value: any) => {
    const updatedItems = [...newStructure.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setNewStructure({ ...newStructure, items: updatedItems });
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
  const frequencies = ["monthly", "quarterly", "annually", "one_time"];

  if (feesLoading || studentsLoading || structuresLoading) {
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
          <h1 className="text-2xl font-bold text-[var(--edu-text)] flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-[var(--edu-primary)]" />
            Smart Fee Management
          </h1>
          <p className="text-gray-600">Intelligent fee structure management with automated billing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Dialog open={isCreateStructureModalOpen} onOpenChange={setIsCreateStructureModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Layers className="w-4 h-4 mr-2" />
                Create Structure
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Create Fee Structure
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Structure Name</Label>
                    <Input
                      value={newStructure.name}
                      onChange={(e) => setNewStructure({...newStructure, name: e.target.value})}
                      placeholder="e.g., Grade 10 Annual Fee Structure"
                    />
                  </div>
                  <div>
                    <Label>Class</Label>
                    <Select value={newStructure.class} onValueChange={(value) => setNewStructure({...newStructure, class: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueClasses.map(cls => (
                          <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newStructure.description}
                    onChange={(e) => setNewStructure({...newStructure, description: e.target.value})}
                    placeholder="Describe this fee structure..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-lg font-semibold">Fee Items</Label>
                    <Button onClick={addFeeItem} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Fee Item
                    </Button>
                  </div>
                  
                  {newStructure.items.map((item, index) => (
                    <Card key={index} className="mb-4">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium">Fee Item {index + 1}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFeeItem(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Fee Type</Label>
                            <Select value={item.feeType} onValueChange={(value) => updateFeeItem(index, 'feeType', value)}>
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
                              value={item.amount}
                              onChange={(e) => updateFeeItem(index, 'amount', e.target.value)}
                              placeholder="Enter amount"
                            />
                          </div>
                          <div>
                            <Label>Frequency</Label>
                            <Select value={item.frequency} onValueChange={(value) => updateFeeItem(index, 'frequency', value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                              <SelectContent>
                                {frequencies.map(freq => (
                                  <SelectItem key={freq} value={freq}>
                                    {freq.charAt(0).toUpperCase() + freq.slice(1).replace('_', ' ')}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Due Day</Label>
                            <Input
                              type="number"
                              min="1"
                              max="31"
                              value={item.dueDay}
                              onChange={(e) => updateFeeItem(index, 'dueDay', e.target.value)}
                              placeholder="Day of month"
                            />
                          </div>
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={item.isOptional}
                              onCheckedChange={(checked) => updateFeeItem(index, 'isOptional', checked)}
                            />
                            <Label>Optional Fee</Label>
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Textarea
                              value={item.description}
                              onChange={(e) => updateFeeItem(index, 'description', e.target.value)}
                              placeholder="Optional description"
                              rows={2}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateStructureModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateStructure} disabled={createStructureMutation.isPending}>
                    {createStructureMutation.isPending ? "Creating..." : "Create Structure"}
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="fees" className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Fees
          </TabsTrigger>
          <TabsTrigger value="structures" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Structures
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Fee Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">₹{totalFees.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {fees.length} total fees
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Collected</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">₹{paidFees.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {fees.filter(f => f.status === "paid").length} paid fees
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-yellow-500">
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
            <Card className="border-l-4 border-l-red-500">
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

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start" onClick={() => setIsCreateFeeModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Individual Fee
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => setIsCreateStructureModalOpen(true)}>
                  <Building className="w-4 h-4 mr-2" />
                  Create Fee Structure
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Generate Fee Report
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Collection Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Collection Rate</span>
                    <span className="font-medium">
                      {totalFees > 0 ? Math.round((paidFees / totalFees) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${totalFees > 0 ? (paidFees / totalFees) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600">
                    ₹{paidFees.toLocaleString()} of ₹{totalFees.toLocaleString()} collected
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fees" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="structures" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Fee Structures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {feeStructures.map((structure) => (
                  <Card key={structure.id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{structure.name}</CardTitle>
                      <p className="text-sm text-gray-600">
                        Class {structure.class} • {structure.academicYear}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-gray-700">{structure.description}</p>
                      <div className="flex justify-between items-center">
                        <Badge variant="outline">
                          {structure.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedStructure(structure);
                            handleGenerateFeesFromStructure(structure.id);
                          }}
                          disabled={generateFeesMutation.isPending}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Generate Fees
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {feeStructures.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <Building className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No fee structures created yet</p>
                    <Button 
                      className="mt-4" 
                      onClick={() => setIsCreateStructureModalOpen(true)}
                    >
                      Create First Structure
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Fee Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {feeTypes.map((type) => {
                    const typeTotal = fees
                      .filter(f => f.feeType === type)
                      .reduce((sum, f) => sum + parseFloat(f.amount), 0);
                    const percentage = totalFees > 0 ? (typeTotal / totalFees) * 100 : 0;
                    
                    return (
                      <div key={type} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{type}</span>
                          <span className="font-medium">₹{typeTotal.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Class-wise Collection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {uniqueClasses.map((cls) => {
                    const classStudents = students.filter(s => s.class === cls);
                    const classFees = fees.filter(f => classStudents.some(s => s.id === f.studentId));
                    const classTotal = classFees.reduce((sum, f) => sum + parseFloat(f.amount), 0);
                    const classPaid = classFees
                      .filter(f => f.status === "paid")
                      .reduce((sum, f) => sum + parseFloat(f.amount), 0);
                    const percentage = classTotal > 0 ? (classPaid / classTotal) * 100 : 0;
                    
                    return (
                      <div key={cls} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Class {cls}</span>
                          <span className="font-medium">{Math.round(percentage)}% collected</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

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