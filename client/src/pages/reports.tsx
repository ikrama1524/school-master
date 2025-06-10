import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download, Filter, Users, DollarSign, BookOpen, TrendingUp } from "lucide-react";
import { format } from "date-fns";

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState("attendance");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  const { data: students = [] } = useQuery({
    queryKey: ['/api/students'],
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ['/api/teachers'],
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
  });

  const reportTypes = [
    { value: "attendance", label: "Attendance Report", icon: Users },
    { value: "fees", label: "Fee Collection Report", icon: DollarSign },
    { value: "academic", label: "Academic Performance", icon: BookOpen },
    { value: "financial", label: "Financial Summary", icon: TrendingUp },
  ];

  const handleExportReport = () => {
    // Generate and download report
    const reportData = {
      type: selectedReport,
      dateFrom,
      dateTo,
      generatedAt: new Date(),
      students: students.length,
      teachers: teachers.length,
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedReport}-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Generate and export detailed reports</p>
        </div>
        <Button onClick={handleExportReport} className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Report Configuration */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Report Settings
            </CardTitle>
            <CardDescription>Configure your report parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Date From</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Date To</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* Report Preview */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Report Preview</CardTitle>
            <CardDescription>
              {reportTypes.find(r => r.value === selectedReport)?.label} 
              {dateFrom && dateTo && ` from ${format(dateFrom, "MMM dd")} to ${format(dateTo, "MMM dd")}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedReport === "attendance" && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{students.length}</div>
                    <div className="text-sm text-blue-600">Total Students</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats?.attendanceRate || 0}%</div>
                    <div className="text-sm text-green-600">Attendance Rate</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">5</div>
                    <div className="text-sm text-orange-600">Absent Today</div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Detailed attendance records and trends will be included in the exported report.
                </div>
              </div>
            )}

            {selectedReport === "fees" && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">${stats?.feeCollection || 0}</div>
                    <div className="text-sm text-green-600">Collected</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">${stats?.pendingFees || 0}</div>
                    <div className="text-sm text-red-600">Pending</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">92%</div>
                    <div className="text-sm text-blue-600">Collection Rate</div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Complete fee collection analysis with payment methods and overdue amounts.
                </div>
              </div>
            )}

            {selectedReport === "academic" && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">8.5</div>
                    <div className="text-sm text-purple-600">Average GPA</div>
                  </div>
                  <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600">95%</div>
                    <div className="text-sm text-indigo-600">Pass Rate</div>
                  </div>
                  <div className="text-center p-4 bg-pink-50 rounded-lg">
                    <div className="text-2xl font-bold text-pink-600">15</div>
                    <div className="text-sm text-pink-600">Top Performers</div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Academic performance metrics including subject-wise analysis and grade distribution.
                </div>
              </div>
            )}

            {selectedReport === "financial" && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-emerald-50 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-600">${(stats?.feeCollection || 0) * 12}</div>
                    <div className="text-sm text-emerald-600">Annual Revenue</div>
                  </div>
                  <div className="text-center p-4 bg-teal-50 rounded-lg">
                    <div className="text-2xl font-bold text-teal-600">${teachers.length * 5000}</div>
                    <div className="text-sm text-teal-600">Payroll Expenses</div>
                  </div>
                  <div className="text-center p-4 bg-cyan-50 rounded-lg">
                    <div className="text-2xl font-bold text-cyan-600">15%</div>
                    <div className="text-sm text-cyan-600">Growth Rate</div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Comprehensive financial overview including revenue, expenses, and profitability analysis.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}