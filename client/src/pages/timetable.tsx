import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Clock, Users, BookOpen, 
  GraduationCap, Save, Download, Copy, ChevronLeft, ChevronRight, Calendar
} from "lucide-react";
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, 
  addWeeks, subWeeks, addMonths, subMonths, addDays, isToday
} from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Subject, Teacher, Timetable } from "@shared/schema";

export default function TimetablePage() {
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState("Grade 6");
  const [selectedSection, setSelectedSection] = useState("A");
  const [timetableData, setTimetableData] = useState<any>({});
  const [viewMode, setViewMode] = useState<"weekly" | "monthly">("weekly");
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const classes = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"];
  const sections = ["A", "B", "C"];
  const timeSlots = [
    { period: 1, label: "Period 1", time: "8:00 - 9:00 AM" },
    { period: 2, label: "Period 2", time: "9:00 - 10:00 AM" },
    { period: 3, label: "Period 3", time: "10:00 - 11:00 AM" },
    { period: 4, label: "Period 4", time: "11:00 - 12:00 PM" },
    { period: 5, label: "Lunch", time: "12:00 - 1:00 PM" },
    { period: 6, label: "Period 5", time: "1:00 - 2:00 PM" },
    { period: 7, label: "Period 6", time: "2:00 - 3:00 PM" },
    { period: 8, label: "Period 7", time: "3:00 - 4:00 PM" },
    { period: 9, label: "Period 8", time: "4:00 - 5:00 PM" },
    { period: 10, label: "Period 9", time: "5:00 - 6:00 PM" },
    { period: 11, label: "Period 10", time: "6:00 - 7:00 PM" }
  ];
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const { data: subjects } = useQuery({
    queryKey: ["/api/subjects"],
  });

  const { data: teachers } = useQuery({
    queryKey: ["/api/teachers"],
  });

  const { data: timetableEntries } = useQuery({
    queryKey: ["/api/timetable"],
  });

  const saveTimetableMutation = useMutation({
    mutationFn: async (data: { entries: any[] }) => {
      return apiRequest("POST", "/api/timetable", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Timetable saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/timetable"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save timetable",
        variant: "destructive",
      });
    },
  });

  const updateTimetableSlot = (day: string, period: number, subjectId: number | null, teacherId: number | null) => {
    const key = `${selectedClass}-${selectedSection}`;
    const newData = { ...timetableData };
    
    if (!newData[key]) {
      newData[key] = {};
    }
    
    const slotKey = `${day}-${period}`;
    
    if (subjectId) {
      const subject = Array.isArray(subjects) ? subjects.find((s: Subject) => s.id === subjectId) : null;
      const teacher = Array.isArray(teachers) ? teachers.find((t: Teacher) => t.id === teacherId) : null;
      
      newData[key][slotKey] = {
        subjectId,
        teacherId,
        subjectName: subject?.name || "",
        teacherName: teacher?.name || ""
      };
    } else {
      delete newData[key][slotKey];
    }
    
    setTimetableData(newData);
  };

  const getTimetableSlot = (day: string, period: number) => {
    const key = `${selectedClass}-${selectedSection}`;
    const slotKey = `${day}-${period}`;
    return timetableData[key]?.[slotKey];
  };

  const exportTimetable = () => {
    const data = timetableData[`${selectedClass}-${selectedSection}`] || {};
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Day,Time,Subject,Teacher\n" +
      Object.entries(data).map(([key, slot]: [string, any]) => {
        const [day, period] = key.split('-');
        const timeSlot = timeSlots.find(t => t.period === parseInt(period));
        return `${day},${timeSlot?.time || ''},${slot.subjectName},${slot.teacherName}`;
      }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `timetable-${selectedClass}-${selectedSection}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveTimetable = () => {
    const key = `${selectedClass}-${selectedSection}`;
    const slots = timetableData[key] || {};
    
    const timetableEntries = Object.entries(slots).map(([slotKey, slot]: [string, any]) => {
      const [day, period] = slotKey.split('-');
      return {
        class: selectedClass,
        section: selectedSection,
        day,
        period: parseInt(period),
        subjectId: slot.subjectId,
        teacherId: slot.teacherId
      };
    });

    saveTimetableMutation.mutate({ entries: timetableEntries });
  };

  const copyTimetableToSection = (targetSection: string) => {
    const sourceKey = `${selectedClass}-${selectedSection}`;
    const targetKey = `${selectedClass}-${targetSection}`;
    
    if (timetableData[sourceKey]) {
      const newData = { ...timetableData };
      newData[targetKey] = { ...timetableData[sourceKey] };
      setTimetableData(newData);
      
      toast({
        title: "Timetable Copied",
        description: `Timetable copied to ${selectedClass} Section ${targetSection}`,
      });
    }
  };

  const navigateDate = (direction: "prev" | "next") => {
    if (viewMode === "weekly") {
      const newDate = direction === "next" ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1);
      setCurrentDate(newDate);
    } else {
      const newDate = direction === "next" ? addMonths(currentDate, 1) : subMonths(currentDate, 1);
      setCurrentDate(newDate);
    }
  };

  const getViewTitle = (): string => {
    if (viewMode === "weekly") {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
    } else {
      return format(currentDate, "MMMM yyyy");
    }
  };

  const getWeekDays = (date: Date): Date[] => {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i)).slice(0, 5); // Monday to Friday
  };

  const getMonthWeeks = (): Date[][] => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const weeks: Date[][] = [];
    
    let currentWeekStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    
    while (currentWeekStart <= monthEnd) {
      const week = getWeekDays(currentWeekStart).filter(date => 
        date >= monthStart && date <= monthEnd
      );
      if (week.length > 0) {
        weeks.push(week);
      }
      currentWeekStart = addWeeks(currentWeekStart, 1);
    }
    
    return weeks;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Timetable Management</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage {viewMode} class schedules with subject and teacher assignments
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-muted rounded-md p-1">
              <Button
                variant={viewMode === "weekly" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("weekly")}
                className="h-8"
              >
                Weekly
              </Button>
              <Button
                variant={viewMode === "monthly" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("monthly")}
                className="h-8"
              >
                Monthly
              </Button>
            </div>
            
            <Button variant="outline" onClick={exportTimetable}>
              <Download className="w-4 h-4 mr-2" />
              Export Timetable
            </Button>
          </div>
        </div>

        {/* Date Navigation */}
        <Card className="animate-slide-up">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate("prev")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium text-lg">{getViewTitle()}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate("next")}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Class and Section Selection */}
        <Card className="animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label>Class:</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map(cls => (
                        <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Label>Section:</Label>
                  <Select value={selectedSection} onValueChange={setSelectedSection}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map(section => (
                        <SelectItem key={section} value={section}>{section}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Select onValueChange={copyTimetableToSection}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Copy to Section..." />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.filter(s => s !== selectedSection).map(section => (
                      <SelectItem key={section} value={section}>Section {section}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleSaveTimetable} disabled={saveTimetableMutation.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {saveTimetableMutation.isPending ? "Saving..." : "Save Timetable"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timetable Grid */}
        <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {viewMode === "weekly" ? "Weekly" : "Monthly"} Timetable - {selectedClass} Section {selectedSection}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {viewMode === "weekly" ? (
              // Weekly View
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-3 bg-muted font-semibold">Time / Day</th>
                      {getWeekDays(currentDate).map(date => (
                        <th key={date.toISOString()} className="border p-3 bg-muted font-semibold min-w-48">
                          <div>{format(date, 'EEEE')}</div>
                          <div className="text-sm font-normal text-muted-foreground">
                            {format(date, 'MMM d')}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map(timeSlot => (
                      <tr key={timeSlot.period}>
                        <td className="border p-3 font-medium text-sm bg-muted/50 text-center">
                          <div>{timeSlot.label}</div>
                          <div className="text-xs text-muted-foreground">{timeSlot.time}</div>
                        </td>
                        {getWeekDays(currentDate).map((date, index) => {
                          const dayName = format(date, 'EEEE');
                          if (timeSlot.period === 5) {
                            // Lunch break row
                            return (
                              <td key={`${dayName}-${timeSlot.period}`} className="border p-3 text-center bg-orange-50 dark:bg-orange-900/20">
                                <div className="text-orange-600 font-medium">Lunch Break</div>
                              </td>
                            );
                          }

                          const slotData = getTimetableSlot(dayName, timeSlot.period);
                          return (
                            <td key={`${dayName}-${timeSlot.period}`} className="border p-2">
                              <div className="space-y-2">
                                <Select
                                  value={slotData?.subjectId?.toString() || ""}
                                  onValueChange={(value: string) => {
                                    const subjectId = (value && value !== "none") ? parseInt(value) : null;
                                    const teacherId = slotData?.teacherId || (Array.isArray(subjects) && subjects.find((s: Subject) => s.id === subjectId) ? subjects[0]?.id : null);
                                    updateTimetableSlot(dayName, timeSlot.period, subjectId, teacherId);
                                  }}
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Select Subject" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">No Subject</SelectItem>
                                    {Array.isArray(subjects) && subjects.map((subject: Subject) => (
                                      <SelectItem key={subject.id} value={subject.id.toString()}>
                                        {subject.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              
                                {slotData?.subjectId && (
                                  <Select
                                    value={slotData?.teacherId?.toString() || ""}
                                    onValueChange={(value: string) => {
                                      const teacherId = value ? parseInt(value) : null;
                                      updateTimetableSlot(dayName, timeSlot.period, slotData.subjectId, teacherId);
                                    }}
                                  >
                                    <SelectTrigger className="h-8 text-xs">
                                      <SelectValue placeholder="Select Teacher" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Array.isArray(teachers) && teachers.map((teacher: Teacher) => (
                                        <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                          {teacher.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              
                                {slotData?.subjectName && (
                                  <div 
                                    className="text-xs p-2 bg-blue-100 dark:bg-blue-900/30 rounded border-l-4 border-blue-500"
                                  >
                                    <div className="font-medium">{slotData.subjectName}</div>
                                    {slotData.teacherName && (
                                      <div className="text-xs opacity-90">{slotData.teacherName}</div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              // Monthly View
              <div className="space-y-4">
                {getMonthWeeks().map((week, weekIndex) => (
                  <div key={weekIndex} className="border rounded-lg overflow-hidden">
                    <div className="bg-muted p-2 text-sm font-medium">
                      Week {weekIndex + 1} - {format(week[0], 'MMM d')} to {format(week[week.length - 1], 'MMM d')}
                    </div>
                    <div className="grid grid-cols-5 gap-1 p-2">
                      {week.map(date => (
                        <div key={date.toISOString()} className={`border rounded p-2 min-h-[120px] ${isToday(date) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                          <div className="text-sm font-medium mb-2">
                            {format(date, 'EEE d')}
                          </div>
                          <div className="space-y-1">
                            {timeSlots.slice(0, 3).map(timeSlot => {
                              const slotData = getTimetableSlot(format(date, 'EEEE'), timeSlot.period);
                              return (
                                <div key={timeSlot.period} className="text-xs p-1 bg-muted/50 rounded">
                                  {slotData?.subjectName || 'Free'}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="animate-slide-up" style={{ animationDelay: '300ms' }}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-4">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Subjects</p>
                  <p className="text-2xl font-bold">{Array.isArray(subjects) ? subjects.length : 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-slide-up" style={{ animationDelay: '400ms' }}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Teachers</p>
                  <p className="text-2xl font-bold">{Array.isArray(teachers) ? teachers.length : 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-slide-up" style={{ animationDelay: '500ms' }}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-4">
                  <GraduationCap className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Classes</p>
                  <p className="text-2xl font-bold">{classes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}