import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign, CreditCard, AlertCircle, CheckCircle, Search } from "lucide-react";
import { Student } from "@shared/schema";

export default function Fees() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: students = [], isLoading } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  // Mock fee data - in real app this would come from API
  const mockFeeStats = {
    totalTarget: 2100000, // 21L
    collected: 1850000,   // 18.5L
    pending: 250000,      // 2.5L
    collectionRate: 88
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading fee information...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--edu-text)]">Fee Management</h1>
          <p className="text-gray-600">Track and manage student fee payments</p>
        </div>
      </div>

      {/* Fee Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Target</p>
                <p className="text-2xl font-bold text-[var(--edu-text)]">
                  {formatCurrency(mockFeeStats.totalTarget)}
                </p>
              </div>
              <div className="w-12 h-12 bg-[var(--edu-light-blue)] rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-[var(--edu-primary)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Collected</p>
                <p className="text-2xl font-bold text-[var(--edu-secondary)]">
                  {formatCurrency(mockFeeStats.collected)}
                </p>
              </div>
              <div className="w-12 h-12 bg-[var(--edu-light-green)] rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-[var(--edu-secondary)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(mockFeeStats.pending)}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Collection Rate</p>
                <p className="text-2xl font-bold text-[var(--edu-text)]">{mockFeeStats.collectionRate}%</p>
              </div>
              <div className="w-full mt-2">
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[var(--edu-secondary)] h-2 rounded-full" 
                    style={{ width: `${mockFeeStats.collectionRate}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fee Collection List */}
      <Card>
        <CardHeader>
          <CardTitle>Student Fee Status</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search students by name or roll number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No students found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStudents.slice(0, 10).map((student, index) => {
                // Mock fee status - in real app this would come from API
                const feeStatuses = ['paid', 'pending', 'overdue'];
                const status = feeStatuses[index % 3];
                const amount = [15000, 18000, 20000][index % 3];
                
                return (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-[var(--edu-text)]">{student.name}</h3>
                        <p className="text-sm text-gray-500">
                          Class {student.class}-{student.section} • Roll No: {student.rollNumber}
                        </p>
                        <p className="text-sm font-medium">
                          Annual Fee: {formatCurrency(amount)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Badge 
                        variant={
                          status === 'paid' ? 'default' : 
                          status === 'pending' ? 'secondary' : 'destructive'
                        }
                      >
                        {status === 'paid' ? 'Paid' : 
                         status === 'pending' ? 'Pending' : 'Overdue'}
                      </Badge>
                      {status !== 'paid' && (
                        <Button size="sm" className="bg-[var(--edu-accent)] hover:bg-[var(--edu-accent)]/90 text-white">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Collect Fee
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
