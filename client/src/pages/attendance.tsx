import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Users, UserCheck, UserX } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Student } from "@shared/schema";

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data: students = [], isLoading } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  // Mock attendance data - in real app this would come from API
  const mockAttendanceData = {
    present: 1174,
    absent: 73,
    total: 1247,
    rate: 94.2
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading attendance data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--edu-text)]">Attendance</h1>
          <p className="text-gray-600">Track and manage student attendance</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Attendance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-[var(--edu-text)]">{mockAttendanceData.total}</p>
              </div>
              <div className="w-12 h-12 bg-[var(--edu-light-blue)] rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-[var(--edu-primary)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Present</p>
                <p className="text-2xl font-bold text-[var(--edu-secondary)]">{mockAttendanceData.present}</p>
              </div>
              <div className="w-12 h-12 bg-[var(--edu-light-green)] rounded-lg flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-[var(--edu-secondary)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Absent</p>
                <p className="text-2xl font-bold text-red-600">{mockAttendanceData.absent}</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                <UserX className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-[var(--edu-text)]">{mockAttendanceData.rate}%</p>
              </div>
              <div className="w-full mt-2">
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[var(--edu-secondary)] h-2 rounded-full" 
                    style={{ width: `${mockAttendanceData.rate}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Attendance List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Student Attendance - {format(selectedDate, "MMMM dd, yyyy")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {students.slice(0, 10).map((student, index) => {
              // Mock attendance status - in real app this would come from API
              const isPresent = Math.random() > 0.1; // 90% attendance rate
              
              return (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-[var(--edu-text)]">{student.name}</h3>
                      <p className="text-sm text-gray-500">
                        Class {student.class}-{student.section} • Roll No: {student.rollNumber}
                      </p>
                    </div>
                  </div>
                  
                  <Badge variant={isPresent ? "default" : "destructive"}>
                    {isPresent ? "Present" : "Absent"}
                  </Badge>
                </div>
              );
            })}
          </div>
          
          {students.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No students found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
