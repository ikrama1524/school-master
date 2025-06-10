import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download, DollarSign, Clock, Users, TrendingUp, Plus, FileText } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface PayrollRecord {
  id: number;
  teacherId: number;
  teacherName: string;
  employeeId: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  payPeriod: string;
  status: "pending" | "processed" | "paid";
  payDate?: Date;
}

interface SalaryComponent {
  id: number;
  name: string;
  type: "allowance" | "deduction";
  amount: number;
  isPercentage: boolean;
}

export default function Payroll() {
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedTeacher, setSelectedTeacher] = useState("");

  const { data: teachers = [] } = useQuery({
    queryKey: ['/api/teachers'],
  });

  // Mock payroll data
  const payrollRecords: PayrollRecord[] = [
    {
      id: 1,
      teacherId: 1,
      teacherName: "Dr. Maria Garcia",
      employeeId: "TCH001",
      basicSalary: 5000,
      allowances: 500,
      deductions: 300,
      netSalary: 5200,
      payPeriod: "2024-05",
      status: "paid",
      payDate: new Date("2024-05-31"),
    },
    {
      id: 2,
      teacherId: 2,
      teacherName: "Prof. James Wilson",
      employeeId: "TCH002",
      basicSalary: 4800,
      allowances: 400,
      deductions: 250,
      netSalary: 4950,
      payPeriod: "2024-05",
      status: "paid",
      payDate: new Date("2024-05-31"),
    },
    {
      id: 3,
      teacherName: "Ms. Sarah Chen",
      employeeId: "TCH003",
      teacherId: 3,
      basicSalary: 4500,
      allowances: 350,
      deductions: 200,
      netSalary: 4650,
      payPeriod: "2024-06",
      status: "pending",
    },
  ];

  const salaryComponents: SalaryComponent[] = [
    { id: 1, name: "House Rent Allowance", type: "allowance", amount: 500, isPercentage: false },
    { id: 2, name: "Transport Allowance", type: "allowance", amount: 200, isPercentage: false },
    { id: 3, name: "Medical Allowance", type: "allowance", amount: 300, isPercentage: false },
    { id: 4, name: "Tax Deduction", type: "deduction", amount: 15, isPercentage: true },
    { id: 5, name: "Provident Fund", type: "deduction", amount: 12, isPercentage: true },
  ];

  const currentMonthRecords = payrollRecords.filter(record => 
    record.payPeriod === format(selectedMonth, "yyyy-MM")
  );

  const totalSalaryExpense = currentMonthRecords.reduce((sum, record) => sum + record.netSalary, 0);
  const pendingPayments = currentMonthRecords.filter(record => record.status === "pending").length;
  const processedPayments = currentMonthRecords.filter(record => record.status === "paid").length;

  const handleGeneratePayslips = () => {
    toast({
      title: "Payslips Generated",
      description: `Generated payslips for ${currentMonthRecords.length} employees`,
    });
  };

  const handleProcessPayroll = () => {
    toast({
      title: "Payroll Processed",
      description: "All pending payments have been processed",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "processed": return "bg-blue-100 text-blue-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payroll Management</h1>
          <p className="text-muted-foreground">Manage employee salaries, payslips, and salary components</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGeneratePayslips}>
            <FileText className="h-4 w-4 mr-2" />
            Generate Payslips
          </Button>
          <Button onClick={handleProcessPayroll}>
            <DollarSign className="h-4 w-4 mr-2" />
            Process Payroll
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Total Expense</p>
                <p className="text-2xl font-bold">${totalSalaryExpense.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Employees</p>
                <p className="text-2xl font-bold">{Array.isArray(teachers) ? teachers.length : 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Processed</p>
                <p className="text-2xl font-bold">{processedPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payroll" className="space-y-6">
        <TabsList>
          <TabsTrigger value="payroll">Monthly Payroll</TabsTrigger>
          <TabsTrigger value="components">Salary Components</TabsTrigger>
          <TabsTrigger value="reports">Payroll Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="payroll" className="space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="space-y-2">
              <Label>Pay Period</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-48 justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedMonth, "MMMM yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedMonth}
                    onSelect={(date) => date && setSelectedMonth(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payroll Records - {format(selectedMonth, "MMMM yyyy")}</CardTitle>
              <CardDescription>Monthly salary details for all employees</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Basic Salary</TableHead>
                    <TableHead>Allowances</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentMonthRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.teacherName}</div>
                        </div>
                      </TableCell>
                      <TableCell>{record.employeeId}</TableCell>
                      <TableCell>${record.basicSalary.toLocaleString()}</TableCell>
                      <TableCell className="text-green-600">+${record.allowances}</TableCell>
                      <TableCell className="text-red-600">-${record.deductions}</TableCell>
                      <TableCell className="font-medium">${record.netSalary.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(record.status)}>
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Payslip
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Allowances</CardTitle>
                <CardDescription>Configure employee allowances</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {salaryComponents.filter(comp => comp.type === "allowance").map((component) => (
                    <div key={component.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{component.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {component.isPercentage ? `${component.amount}%` : `$${component.amount}`}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Allowance
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Deductions</CardTitle>
                <CardDescription>Configure employee deductions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {salaryComponents.filter(comp => comp.type === "deduction").map((component) => (
                    <div key={component.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{component.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {component.isPercentage ? `${component.amount}%` : `$${component.amount}`}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Deduction
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payroll Summary</CardTitle>
                <CardDescription>Monthly payroll overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Total Employees</span>
                    <span className="font-medium">{Array.isArray(teachers) ? teachers.length : 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total Basic Salary</span>
                    <span className="font-medium">${currentMonthRecords.reduce((sum, r) => sum + r.basicSalary, 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total Allowances</span>
                    <span className="font-medium text-green-600">+${currentMonthRecords.reduce((sum, r) => sum + r.allowances, 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total Deductions</span>
                    <span className="font-medium text-red-600">-${currentMonthRecords.reduce((sum, r) => sum + r.deductions, 0).toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Net Payroll</span>
                      <span className="font-bold text-lg">${totalSalaryExpense.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export Reports</CardTitle>
                <CardDescription>Download payroll reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Monthly Payroll Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Tax Summary Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Employee Salary Slips
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Provident Fund Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}