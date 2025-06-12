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
    { period: 1, time: "08:00-09:00", label: "1st Period" },
    { period: 2, time: "09:00-10:00", label: "2nd Period" },
    { period: 3, time: "10:00-11:00", label: "3rd Period" },
    { period: 4, time: "11:00-12:00", label: "4th Period" },
    { period: 5, time: "12:00-13:00", label: "Lunch Break" },
    { period: 6, time: "13:00-14:00", label: "5th Period" },
    { period: 7, time: "14:00-15:00", label: "6th Period" },
    { period: 8, time: "15:00-16:00", label: "7th Period" },
  ];
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const { data: subjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ["/api/subjects"],
    retry: false,
  });

  const { data: teachers, isLoading: teachersLoading } = useQuery({
    queryKey: ["/api/teachers"],
    retry: false,
  });

  const { data: existingTimetable, isLoading: timetableLoading } = useQuery({
    queryKey: ["/api/timetable", selectedClass, selectedSection],
    retry: false,
  });

  const updateTimetableSlot = (day: string, period: number, subjectId: number | null, teacherId: number | null) => {
    const newData = { ...timetableData };
    const key = `${selectedClass}-${selectedSection}`;
    
    if (!newData[key]) {
      newData[key] = {};
    }
    if (!newData[key][day]) {
      newData[key][day] = {};
    }
    
    if (subjectId && teacherId && period !== 5) { // Skip lunch break
      const subject = Array.isArray(subjects) ? subjects.find((s: Subject) => s.id === subjectId) : null;
      const teacher = Array.isArray(teachers) ? teachers.find((t: Teacher) => t.id === teacherId) : null;
      
      newData[key][day][period] = {
        subjectId,
        teacherId,
        subjectName: subject?.name || "",
        teacherName: teacher?.name || "",
        color: getSubjectColor(subjectId)
      };
    } else {
      delete newData[key][day][period];
    }
    
    setTimetableData(newData);
  };

  const getSubjectColor = (subjectId: number): string => {
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
    return colors[subjectId % colors.length];
  };

  const getTimetableSlot = (day: string, period: number) => {
    const key = `${selectedClass}-${selectedSection}`;
    return timetableData[key]?.[day]?.[period] || 
           (Array.isArray(existingTimetable) ? existingTimetable.find((entry: any) => 
             entry.class === selectedClass && 
             entry.section === selectedSection &&
             entry.day === day && 
             entry.period === period
           ) : null) || null;
  };

  const saveTimetableMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/timetable/bulk", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timetable"] });
      toast({
        title: "Timetable Saved",
        description: "Weekly timetable has been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save timetable. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveTimetable = () => {
    const timetableEntries = [];
    
    for (const day of daysOfWeek) {
      for (const timeSlot of timeSlots) {
        if (timeSlot.period === 5) continue; // Skip lunch break
        
        const slotData = getTimetableSlot(day, timeSlot.period);
        if (slotData && slotData.subjectId && slotData.teacherId) {
          timetableEntries.push({
            class: selectedClass,
            section: selectedSection,
            day: day,
            period: timeSlot.period,
            subjectId: slotData.subjectId,
            teacherId: slotData.teacherId,
            startTime: timeSlot.time.split('-')[0],
            endTime: timeSlot.time.split('-')[1],
          });
        }
      }
    }

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
            
            <Button variant="outline">
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
                    <Copy className="w-4 h-4 mr-2" />
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
                                    updateTimetableSlot(day, timeSlot.period, slotData.subjectId, teacherId);
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
                              
                              {slotData && slotData.subjectName && (
                                <div 
                                  className="text-xs p-2 rounded text-white text-center"
                                  style={{ backgroundColor: slotData.color }}
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
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="animate-slide-up" style={{ animationDelay: '400ms' }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Subjects</p>
                  <p className="text-2xl font-bold">{Array.isArray(subjects) ? subjects.length : 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-slide-up" style={{ animationDelay: '500ms' }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Teachers</p>
                  <p className="text-2xl font-bold">{Array.isArray(teachers) ? teachers.length : 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-slide-up" style={{ animationDelay: '600ms' }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Periods per Day</p>
                  <p className="text-2xl font-bold">7</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}