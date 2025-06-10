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
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  Search, Filter, Download, DollarSign, Clock, CheckCircle, 
  Calculator, CreditCard, FileText, Users, Calendar, 
  PlusCircle, AlertTriangle, TrendingUp, Banknote,
  Receipt, Settings, Eye, Edit
} from "lucide-react";
import { Teacher } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PayrollRecord {
  id: number;
  teacherId: number;
  teacher: Teacher;
  payPeriod: string;
  basicSalary: number;
  allowances: SalaryComponent[];
  deductions: SalaryComponent[];
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  status: "draft" | "processed" | "paid" | "cancelled";
  payDate?: Date;
  paymentMethod?: string;
  bankDetails?: string;
  taxDeduction: number;
  pfContribution: number;
  overtimeHours: number;
  overtimeRate: number;
}

interface SalaryComponent {
  id: number;
  name: string;
  type: "allowance" | "deduction";
  amount: number;
  isPercentage: boolean;
  isFixed: boolean;
  isActive: boolean;
}

interface PayrollTemplate {
  id: number;
  name: string;
  description: string;
  components: SalaryComponent[];
  applicableRoles: string[];
}

export default function Payroll() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollRecord | null>(null);
  const { toast } = useToast();

  const { data: teachers = [], isLoading: teachersLoading } = useQuery<Teacher[]>({
    queryKey: ["/api/teachers"],
  });

  // Mock salary components
  const standardComponents: SalaryComponent[] = [
    { id: 1, name: "House Rent Allowance", type: "allowance", amount: 40, isPercentage: true, isFixed: false, isActive: true },
    { id: 2, name: "Medical Allowance", type: "allowance", amount: 2000, isPercentage: false, isFixed: true, isActive: true },
    { id: 3, name: "Transport Allowance", type: "allowance", amount: 1500, isPercentage: false, isFixed: true, isActive: true },
    { id: 4, name: "Provident Fund", type: "deduction", amount: 12, isPercentage: true, isFixed: false, isActive: true },
    { id: 5, name: "Income Tax", type: "deduction", amount: 10, isPercentage: true, isFixed: false, isActive: true },
    { id: 6, name: "Professional Tax", type: "deduction", amount: 200, isPercentage: false, isFixed: true, isActive: true },
  ];

  // Mock payroll records
  const mockPayrollRecords: PayrollRecord[] = teachers.map((teacher, index) => {
    const basicSalary = parseFloat(teacher.salary || "50000");
    const allowances = standardComponents.filter(c => c.type === "allowance");
    const deductions = standardComponents.filter(c => c.type === "deduction");
    
    const totalAllowances = allowances.reduce((sum, comp) => {
      return sum + (comp.isPercentage ? (basicSalary * comp.amount / 100) : comp.amount);
    }, 0);
    
    const totalDeductions = deductions.reduce((sum, comp) => {
      return sum + (comp.isPercentage ? (basicSalary * comp.amount / 100) : comp.amount);
    }, 0);
    
    const grossSalary = basicSalary + totalAllowances;
    const netSalary = grossSalary - totalDeductions;
    
    return {
      id: index + 1,
      teacherId: teacher.id,
      teacher,
      payPeriod: selectedPeriod,
      basicSalary,
      allowances,
      deductions,
      grossSalary,
      totalDeductions,
      netSalary,
      status: ["draft", "processed", "paid"][Math.floor(Math.random() * 3)] as any,
      payDate: Math.random() > 0.5 ? new Date() : undefined,
      paymentMethod: "Bank Transfer",
      bankDetails: "****1234",
      taxDeduction: basicSalary * 0.10,
      pfContribution: basicSalary * 0.12,
      overtimeHours: Math.floor(Math.random() * 20),
      overtimeRate: 500,
    };
  });

  const filteredRecords = mockPayrollRecords.filter(record => {
    const matchesSearch = record.teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          record.teacher.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const payrollStats = {
    totalTeachers: mockPayrollRecords.length,
    processed: mockPayrollRecords.filter(r => r.status === "processed").length,
    paid: mockPayrollRecords.filter(r => r.status === "paid").length,
    totalAmount: mockPayrollRecords.reduce((sum, r) => sum + r.netSalary, 0),
    averageSalary: mockPayrollRecords.reduce((sum, r) => sum + r.netSalary, 0) / mockPayrollRecords.length,
  };

  const processPayrollMutation = useMutation({
    mutationFn: async (data: { payrollIds: number[]; payPeriod: string }) => {
      return await apiRequest("POST", "/api/payroll/process", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll"] });
      toast({
        title: "Payroll Processed",
        description: "Payroll has been successfully processed for selected employees",
      });
    },
  });

  const generatePayslipMutation = useMutation({
    mutationFn: async (payrollId: number) => {
      return await apiRequest("POST", `/api/payroll/${payrollId}/payslip`);
    },
    onSuccess: () => {
      toast({
        title: "Payslip Generated",
        description: "Payslip has been generated and sent to employee",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "processed":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "draft":
        return <FileText className="h-4 w-4 text-yellow-500" />;
      case "cancelled":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "processed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const calculateSalary = (basicSalary: number, components: SalaryComponent[]) => {
    return components.reduce((sum, comp) => {
      const amount = comp.isPercentage ? (basicSalary * comp.amount / 100) : comp.amount;
      return comp.type === "allowance" ? sum + amount : sum - amount;
    }, basicSalary);
  };

  const processSelectedPayroll = (payrollIds: number[]) => {
    processPayrollMutation.mutate({ payrollIds, payPeriod: selectedPeriod });
  };

  const viewPayrollDetails = (payroll: PayrollRecord) => {
    setSelectedPayroll(payroll);
    setIsPayrollModalOpen(true);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Payroll Management System
          </h1>
          <p className="text-muted-foreground mt-1">
            Automated salary calculations with tax deductions and benefit management
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Payroll
          </Button>
          <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Salary Templates
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Salary Structure Templates</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="components" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="components">Components</TabsTrigger>
                  <TabsTrigger value="templates">Templates</TabsTrigger>
                </TabsList>
                <TabsContent value="components" className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-3">Salary Components</h3>
                    <div className="space-y-3">
                      {standardComponents.map((component) => (
                        <div key={component.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{component.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {component.type === "allowance" ? "Allowance" : "Deduction"} • 
                              {component.isPercentage ? `${component.amount}%` : `₹${component.amount}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={component.isActive ? "default" : "secondary"}>
                              {component.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full mt-4">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Add Component
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="templates">
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold">Senior Teacher Package</h3>
                      <p className="text-sm text-muted-foreground">For teachers with 5+ years experience</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm">Base: ₹60,000 + Benefits</span>
                        <Button size="sm" variant="outline">Apply</Button>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold">Junior Teacher Package</h3>
                      <p className="text-sm text-muted-foreground">For new teachers</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm">Base: ₹35,000 + Benefits</span>
                        <Button size="sm" variant="outline">Apply</Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
          <Button onClick={() => processSelectedPayroll(mockPayrollRecords.map(r => r.id))}>
            <Calculator className="w-4 h-4 mr-2" />
            Process Payroll
          </Button>
        </div>
      </div>

      {/* Payroll Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 animate-slide-up">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Employees</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{payrollStats.totalTeachers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Processed</p>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{payrollStats.processed}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Paid</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{payrollStats.paid}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Amount</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  ₹{(payrollStats.totalAmount / 100000).toFixed(1)}L
                </p>
              </div>
              <Banknote className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Avg Salary</p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  ₹{(payrollStats.averageSalary / 1000).toFixed(0)}K
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Period Selection */}
      <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by employee name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-40">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-12">December 2024</SelectItem>
                  <SelectItem value="2024-11">November 2024</SelectItem>
                  <SelectItem value="2024-10">October 2024</SelectItem>
                  <SelectItem value="2024-09">September 2024</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="processed">Processed</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Records Table */}
      <Card className="animate-slide-up" style={{ animationDelay: '400ms' }}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Payroll Records - {new Date(selectedPeriod).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Receipt className="w-4 h-4 mr-2" />
              Bulk Payslips
            </Button>
            <Button variant="outline" size="sm">
              <CreditCard className="w-4 h-4 mr-2" />
              Payment Gateway
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {teachersLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Basic Salary</TableHead>
                    <TableHead>Gross Salary</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                            {record.teacher.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium">{record.teacher.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {record.teacher.employeeId} • {record.teacher.subject}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">₹{record.basicSalary.toLocaleString()}</TableCell>
                      <TableCell className="font-medium">₹{record.grossSalary.toLocaleString()}</TableCell>
                      <TableCell className="text-red-600">₹{record.totalDeductions.toLocaleString()}</TableCell>
                      <TableCell className="font-bold text-green-600">₹{record.netSalary.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(record.status)} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(record.status)}
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => viewPayrollDetails(record)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          {record.status === "processed" && (
                            <Button 
                              size="sm"
                              onClick={() => generatePayslipMutation.mutate(record.id)}
                              disabled={generatePayslipMutation.isPending}
                            >
                              <Receipt className="w-3 h-3 mr-1" />
                              Payslip
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredRecords.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No payroll records found</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payroll Details Modal */}
      <Dialog open={isPayrollModalOpen} onOpenChange={setIsPayrollModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payroll Details - {selectedPayroll?.teacher.name}</DialogTitle>
          </DialogHeader>
          {selectedPayroll && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Employee ID</Label>
                  <p className="font-medium">{selectedPayroll.teacher.employeeId}</p>
                </div>
                <div>
                  <Label>Pay Period</Label>
                  <p className="font-medium">{new Date(selectedPayroll.payPeriod).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                </div>
                <div>
                  <Label>Department</Label>
                  <p className="font-medium">{selectedPayroll.teacher.subject}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedPayroll.status)}>
                    {selectedPayroll.status.charAt(0).toUpperCase() + selectedPayroll.status.slice(1)}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 text-green-600">Earnings</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Basic Salary</span>
                      <span className="font-medium">₹{selectedPayroll.basicSalary.toLocaleString()}</span>
                    </div>
                    {selectedPayroll.allowances.map((allowance) => (
                      <div key={allowance.id} className="flex justify-between text-sm">
                        <span>{allowance.name}</span>
                        <span>₹{(allowance.isPercentage 
                          ? (selectedPayroll.basicSalary * allowance.amount / 100) 
                          : allowance.amount).toLocaleString()}</span>
                      </div>
                    ))}
                    {selectedPayroll.overtimeHours > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Overtime ({selectedPayroll.overtimeHours} hrs)</span>
                        <span>₹{(selectedPayroll.overtimeHours * selectedPayroll.overtimeRate).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Gross Salary</span>
                      <span>₹{selectedPayroll.grossSalary.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 text-red-600">Deductions</h3>
                  <div className="space-y-2">
                    {selectedPayroll.deductions.map((deduction) => (
                      <div key={deduction.id} className="flex justify-between text-sm">
                        <span>{deduction.name}</span>
                        <span>₹{(deduction.isPercentage 
                          ? (selectedPayroll.basicSalary * deduction.amount / 100) 
                          : deduction.amount).toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total Deductions</span>
                      <span>₹{selectedPayroll.totalDeductions.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Net Salary</span>
                  <span className="text-2xl font-bold text-primary">₹{selectedPayroll.netSalary.toLocaleString()}</span>
                </div>
              </div>

              {selectedPayroll.status === "paid" && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label>Payment Method</Label>
                    <p className="font-medium">{selectedPayroll.paymentMethod}</p>
                  </div>
                  <div>
                    <Label>Bank Account</Label>
                    <p className="font-medium">{selectedPayroll.bankDetails}</p>
                  </div>
                  <div>
                    <Label>Payment Date</Label>
                    <p className="font-medium">{selectedPayroll.payDate?.toLocaleDateString()}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button className="flex-1" disabled={selectedPayroll.status === "paid"}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Process Payment
                </Button>
                <Button variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download Payslip
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}