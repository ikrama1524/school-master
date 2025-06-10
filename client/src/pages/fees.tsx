import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Search, Filter, Download, DollarSign, Clock, CheckCircle, 
  AlertCircle, CreditCard, Smartphone, Globe, Receipt,
  TrendingUp, Calendar, Users, FileText, Send, Plus,
  ArrowUpRight, ArrowDownRight, PieChart, BarChart3
} from "lucide-react";
import { Fee, Student } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PaymentGateway {
  name: string;
  icon: any;
  description: string;
  fees: string;
  supported: string[];
  status: "active" | "inactive";
}

export default function Fees() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isFeeStructureModalOpen, setIsFeeStructureModalOpen] = useState(false);
  const { toast } = useToast();

  const { data: fees = [], isLoading: feesLoading } = useQuery<Fee[]>({
    queryKey: ["/api/fees"],
  });

  const { data: students = [], isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const paymentGateways: PaymentGateway[] = [
    {
      name: "Razorpay",
      icon: CreditCard,
      description: "Accept UPI, Cards, Net Banking & Wallets",
      fees: "2% + GST",
      supported: ["UPI", "Cards", "Net Banking", "Wallets"],
      status: "active"
    },
    {
      name: "Stripe",
      icon: Globe,
      description: "Global payment processing",
      fees: "2.9% + $0.30",
      supported: ["Cards", "Digital Wallets", "Bank Transfers"],
      status: "active"
    },
    {
      name: "Paytm",
      icon: Smartphone,
      description: "Indian payment gateway",
      fees: "1.99% + GST",
      supported: ["UPI", "Paytm Wallet", "Cards"],
      status: "inactive"
    }
  ];

  const processPaymentMutation = useMutation({
    mutationFn: async (data: { feeId: number; gateway: string; amount: number }) => {
      return await apiRequest("POST", "/api/fees/payment", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Payment Processed",
        description: "Payment has been successfully processed",
      });
      setIsPaymentModalOpen(false);
    },
    onError: () => {
      toast({
        title: "Payment Failed",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const sendReminderMutation = useMutation({
    mutationFn: async (feeId: number) => {
      return await apiRequest("POST", `/api/fees/${feeId}/reminder`);
    },
    onSuccess: () => {
      toast({
        title: "Reminder Sent",
        description: "Payment reminder has been sent to the student/parent",
      });
    },
  });

  const filteredFees = fees.filter(fee => {
    const student = students.find(s => s.id === fee.studentId);
    const matchesSearch = student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student?.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || fee.status === statusFilter;
    const matchesClass = classFilter === "all" || student?.class === classFilter;
    return matchesSearch && matchesStatus && matchesClass;
  });

  const totalAmount = fees.reduce((sum, fee) => sum + parseFloat(fee.amount.toString()), 0);
  const paidAmount = fees.filter(fee => fee.status === "paid").reduce((sum, fee) => sum + parseFloat(fee.amount.toString()), 0);
  const pendingAmount = totalAmount - paidAmount;
  const overdueAmount = fees.filter(fee => fee.status === "overdue").reduce((sum, fee) => sum + parseFloat(fee.amount.toString()), 0);
  const collectionRate = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

  const uniqueClasses = [...new Set(students.map(s => s.class))];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

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

  const handlePayment = (fee: Fee) => {
    setSelectedFee(fee);
    setIsPaymentModalOpen(true);
  };

  const processPayment = (gateway: string) => {
    if (!selectedFee) return;
    
    processPaymentMutation.mutate({
      feeId: selectedFee.id,
      gateway,
      amount: parseFloat(selectedFee.amount.toString())
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Fee Management & Payment Gateway
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive fee collection with multiple payment options
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Dialog open={isFeeStructureModalOpen} onOpenChange={setIsFeeStructureModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Fee Structure
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Fee Structure Management</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="setup" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="setup">Setup</TabsTrigger>
                  <TabsTrigger value="templates">Templates</TabsTrigger>
                  <TabsTrigger value="bulk">Bulk Actions</TabsTrigger>
                </TabsList>
                <TabsContent value="setup" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Fee Type</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fee type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tuition">Tuition Fee</SelectItem>
                          <SelectItem value="transport">Transport Fee</SelectItem>
                          <SelectItem value="examination">Examination Fee</SelectItem>
                          <SelectItem value="library">Library Fee</SelectItem>
                          <SelectItem value="sports">Sports Fee</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Class</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {uniqueClasses.map((className) => (
                            <SelectItem key={className} value={className}>
                              {className}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Amount (₹)</label>
                      <Input type="number" placeholder="Enter amount" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Due Date</label>
                      <Input type="date" />
                    </div>
                  </div>
                  <Button className="w-full">Create Fee Structure</Button>
                </TabsContent>
                <TabsContent value="templates">
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold">Annual Fee Package</h3>
                      <p className="text-sm text-muted-foreground">Complete academic year fees</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-medium">₹45,000</span>
                        <Button size="sm" variant="outline">Use Template</Button>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold">Monthly Installment</h3>
                      <p className="text-sm text-muted-foreground">Monthly payment plan</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-medium">₹5,000/month</span>
                        <Button size="sm" variant="outline">Use Template</Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="bulk">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Apply to Classes</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select classes" />
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
                    <Button className="w-full">Apply to Selected Classes</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Collected</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  ₹{paidAmount.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">{fees.filter(f => f.status === "paid").length} payments</span>
                </div>
              </div>
              <div className="p-3 bg-green-500 rounded-full">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                  ₹{pendingAmount.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3 text-yellow-600" />
                  <span className="text-xs text-yellow-600">{fees.filter(f => f.status === "pending").length} pending</span>
                </div>
              </div>
              <div className="p-3 bg-yellow-500 rounded-full">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Overdue</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                  ₹{overdueAmount.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowDownRight className="h-3 w-3 text-red-600" />
                  <span className="text-xs text-red-600">{fees.filter(f => f.status === "overdue").length} overdue</span>
                </div>
              </div>
              <div className="p-3 bg-red-500 rounded-full">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Collection Rate</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {collectionRate.toFixed(1)}%
                </p>
                <Progress value={collectionRate} className="h-2 mt-2" />
              </div>
              <div className="p-3 bg-blue-500 rounded-full">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Gateway Overview */}
      <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Gateway Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {paymentGateways.map((gateway, index) => (
              <Card key={index} className={`border-2 transition-all duration-300 hover:shadow-md ${
                gateway.status === "active" 
                  ? "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20" 
                  : "border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/20"
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      gateway.status === "active" ? "bg-green-100 dark:bg-green-900" : "bg-gray-100 dark:bg-gray-800"
                    }`}>
                      <gateway.icon className={`h-5 w-5 ${
                        gateway.status === "active" ? "text-green-600 dark:text-green-400" : "text-gray-500"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{gateway.name}</h3>
                        <Badge variant={gateway.status === "active" ? "default" : "secondary"} className="text-xs">
                          {gateway.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{gateway.description}</p>
                      <p className="text-xs font-medium text-green-600 mt-1">Processing: {gateway.fees}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1">
                      {gateway.supported.map((method, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {method}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Filters */}
      <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by student name or roll number..."
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
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-32">
                  <Users className="w-4 h-4 mr-2" />
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

      {/* Enhanced Fee Records Table */}
      <Card className="animate-slide-up" style={{ animationDelay: '400ms' }}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Fee Records & Payment Management</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Send className="w-4 h-4 mr-2" />
              Bulk Reminder
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Receipt Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {feesLoading || studentsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : fees.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <DollarSign className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Fee Records Found</h3>
              <p className="text-muted-foreground mb-4">Create fee structures to start managing payments</p>
              <Button onClick={() => setIsFeeStructureModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Fee Structure
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Details</TableHead>
                    <TableHead>Fee Information</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFees.map((fee) => {
                    const student = students.find(s => s.id === fee.studentId);
                    const isOverdue = fee.dueDate && new Date(fee.dueDate) < new Date() && fee.status !== "paid";
                    return (
                      <TableRow key={fee.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                              {student?.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium">{student?.name}</p>
                              <p className="text-sm text-muted-foreground">{student?.rollNumber} • {student?.class}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{fee.type}</p>
                            <p className="text-sm text-muted-foreground">{fee.description || 'Regular fee payment'}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-lg">₹{parseFloat(fee.amount.toString()).toLocaleString()}</TableCell>
                        <TableCell>
                          <div className={isOverdue ? "text-red-600 font-medium" : ""}>
                            {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : 'N/A'}
                            {isOverdue && <div className="text-xs text-red-500 font-medium">OVERDUE</div>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(fee.status)} flex items-center gap-1 w-fit`}>
                            {getStatusIcon(fee.status)}
                            {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {fee.status !== "paid" ? (
                              <>
                                <Button 
                                  size="sm" 
                                  onClick={() => handlePayment(fee)}
                                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                                >
                                  <CreditCard className="w-3 h-3 mr-1" />
                                  Pay Now
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => sendReminderMutation.mutate(fee.id)}
                                  disabled={sendReminderMutation.isPending}
                                >
                                  <Send className="w-3 h-3 mr-1" />
                                  Remind
                                </Button>
                              </>
                            ) : (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Paid
                              </Badge>
                            )}
                            <Button size="sm" variant="outline">
                              <Receipt className="w-3 h-3 mr-1" />
                              Receipt
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {filteredFees.length === 0 && fees.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No fee records match your search criteria</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Processing Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Secure Payment Processing</DialogTitle>
          </DialogHeader>
          {selectedFee && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-semibold text-sm">
                    {students.find(s => s.id === selectedFee.studentId)?.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedFee.type}</h3>
                    <p className="text-sm text-muted-foreground">
                      {students.find(s => s.id === selectedFee.studentId)?.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">
                    ₹{parseFloat(selectedFee.amount.toString()).toLocaleString()}
                  </span>
                  <Badge variant="outline">
                    Due: {selectedFee.dueDate ? new Date(selectedFee.dueDate).toLocaleDateString() : 'N/A'}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">Select Payment Gateway</h4>
                {paymentGateways.filter(g => g.status === "active").map((gateway, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start p-4 h-auto hover:border-primary transition-all"
                    onClick={() => processPayment(gateway.name.toLowerCase())}
                    disabled={processPaymentMutation.isPending}
                  >
                    <gateway.icon className="h-5 w-5 mr-3" />
                    <div className="text-left flex-1">
                      <div className="font-medium">{gateway.name}</div>
                      <div className="text-sm text-muted-foreground">{gateway.description}</div>
                      <div className="text-xs text-green-600 mt-1">Processing: {gateway.fees}</div>
                    </div>
                    <div className="flex flex-wrap gap-1 ml-2">
                      {gateway.supported.slice(0, 2).map((method, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {method}
                        </Badge>
                      ))}
                    </div>
                  </Button>
                ))}
              </div>
              
              <div className="text-xs text-muted-foreground text-center p-3 bg-muted/30 rounded">
                <span className="flex items-center justify-center gap-1">
                  <span>🔒</span>
                  Secure payment processing with SSL encryption
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}