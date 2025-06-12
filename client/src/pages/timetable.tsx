import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, ChevronLeft, ChevronRight, Plus, Settings, Save, BookOpen, Clock, Users } from "lucide-react";
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, addWeeks, addMonths, isToday } from "date-fns";
import type { Timetable, InsertTimetable, Subject, Teacher, Period } from "@shared/schema";

export default function Timetable() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"weekly" | "monthly" | "yearly">("weekly");
  const [selectedClass, setSelectedClass] = useState("Grade 6");
  const [selectedSection, setSelectedSection] = useState("A");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showSubjectManager, setShowSubjectManager] = useState(false);
  const [showPeriodManager, setShowPeriodManager] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectCode, setNewSubjectCode] = useState("");
  const [newSubjectDescription, setNewSubjectDescription] = useState("");
  const { toast } = useToast();

  // Data queries
  const { data: timetableData = [] } = useQuery({
    queryKey: ["/api/timetable", selectedClass, selectedSection],
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["/api/subjects"],
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ["/api/teachers"],
  });

  const { data: periods = [] } = useQuery({
    queryKey: ["/api/periods"],
  });

  // Mutations
  const saveTimetableMutation = useMutation({
    mutationFn: async (data: InsertTimetable[]) => {
      return await apiRequest("POST", "/api/timetable/bulk", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timetable"] });
      toast({
        title: "Success",
        description: "Timetable saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addSubjectMutation = useMutation({
    mutationFn: async (data: { name: string; code: string; description?: string | null }) => {
      return await apiRequest("POST", "/api/subjects", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
      setNewSubjectName("");
      setNewSubjectCode("");
      setNewSubjectDescription("");
      setShowSubjectManager(false);
      toast({
        title: "Success",
        description: "Subject added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Local state for timetable editing
  const [localTimetable, setLocalTimetable] = useState<Record<string, Record<string, { subjectId: number | null; teacherId: number | null }>>>({});

  useEffect(() => {
    if (Array.isArray(timetableData)) {
      const timetableMap: Record<string, Record<string, { subjectId: number | null; teacherId: number | null }>> = {};
      timetableData.forEach((entry: Timetable) => {
        if (!timetableMap[entry.day]) {
          timetableMap[entry.day] = {};
        }
        timetableMap[entry.day][entry.period] = {
          subjectId: entry.subjectId,
          teacherId: entry.teacherId,
        };
      });
      setLocalTimetable(timetableMap);
    }
  }, [timetableData]);

  const timeSlots = Array.isArray(periods) ? periods : [
    { id: 1, label: "Period 1", startTime: "08:00", endTime: "08:45", periodNumber: 1, isBreak: false },
    { id: 2, label: "Period 2", startTime: "08:45", endTime: "09:30", periodNumber: 2, isBreak: false },
    { id: 3, label: "Break", startTime: "09:30", endTime: "09:45", periodNumber: 3, isBreak: true },
    { id: 4, label: "Period 3", startTime: "09:45", endTime: "10:30", periodNumber: 3, isBreak: false },
    { id: 5, label: "Period 4", startTime: "10:30", endTime: "11:15", periodNumber: 4, isBreak: false },
  ];

  const getTimetableSlot = (day: string, period: string) => {
    return localTimetable[day]?.[period] || { subjectId: null, teacherId: null };
  };

  const updateTimetableSlot = (day: string, period: string, subjectId: number | null, teacherId: number | null) => {
    setLocalTimetable(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [period]: { subjectId, teacherId }
      }
    }));
  };

  const saveTimetable = () => {
    const timetableEntries: InsertTimetable[] = [];
    Object.entries(localTimetable).forEach(([day, periods]) => {
      Object.entries(periods).forEach(([periodLabel, data]) => {
        if (data.subjectId && data.teacherId) {
          const timeSlot = timeSlots.find(slot => slot.label === periodLabel);
          if (timeSlot) {
            timetableEntries.push({
              class: selectedClass,
              section: selectedSection,
              day,
              period: timeSlot.periodNumber,
              startTime: timeSlot.startTime,
              endTime: timeSlot.endTime,
              subjectId: data.subjectId,
              teacherId: data.teacherId,
            });
          }
        }
      });
    });
    saveTimetableMutation.mutate(timetableEntries);
  };

  const getViewTitle = () => {
    switch (viewMode) {
      case "weekly":
        return `Week of ${format(startOfWeek(currentDate), 'MMM d, yyyy')}`;
      case "monthly":
        return format(currentDate, 'MMMM yyyy');
      case "yearly":
        return `Academic Year ${selectedYear}`;
      default:
        return "";
    }
  };

  const getWeekDays = (): Date[] => {
    const start = startOfWeek(currentDate);
    return Array.from({ length: 5 }, (_, i) => addDays(start, i));
  };

  const getMonthWeeks = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const weeks: Date[][] = [];
    let currentWeekStart = startOfWeek(start);
    
    while (currentWeekStart <= end) {
      const weekDays = Array.from({ length: 5 }, (_, i) => addDays(currentWeekStart, i))
        .filter(date => date >= start && date <= end);
      if (weekDays.length > 0) {
        weeks.push(weekDays);
      }
      currentWeekStart = addWeeks(currentWeekStart, 1);
    }
    return weeks;
  };

  const getYearMonths = () => {
    return Array.from({ length: 12 }, (_, i) => new Date(selectedYear, i, 1));
  };

  const renderWeeklyView = () => (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <tr>
              <th className="p-4 text-left font-semibold">Time Slot</th>
              {getWeekDays().map(date => (
                <th key={date.toISOString()} className="p-4 text-center font-semibold min-w-[150px]">
                  <div className="flex flex-col items-center">
                    <span className="text-sm opacity-90">{format(date, 'EEE')}</span>
                    <span className="text-lg">{format(date, 'd')}</span>
                    {isToday(date) && <div className="w-2 h-2 bg-yellow-300 rounded-full mt-1"></div>}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((timeSlot, index) => (
              <tr key={timeSlot.id} className={`border-b border-gray-200 dark:border-gray-700 ${index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-900'}`}>
                <td className="p-4">
                  <div className="space-y-1">
                    <div className="font-semibold text-gray-900 dark:text-white">{timeSlot.label}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {timeSlot.startTime} - {timeSlot.endTime}
                    </div>
                  </div>
                </td>
                {getWeekDays().map(date => {
                  const dayName = format(date, 'EEEE');
                  const slotData = getTimetableSlot(dayName, timeSlot.label);
                  
                  if (timeSlot.isBreak) {
                    return (
                      <td key={date.toISOString()} className="p-4 text-center">
                        <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-2 rounded-lg font-medium">
                          {timeSlot.label}
                        </div>
                      </td>
                    );
                  }
                  
                  const subject = Array.isArray(subjects) ? subjects.find((s: Subject) => s.id === slotData.subjectId) : null;
                  const teacher = Array.isArray(teachers) ? teachers.find((t: Teacher) => t.id === slotData.teacherId) : null;
                  
                  return (
                    <td key={date.toISOString()} className="p-4">
                      <div className="space-y-2">
                        <Select
                          value={slotData.subjectId?.toString() || "none"}
                          onValueChange={(value: string) => {
                            const subjectId = (value && value !== "none") ? parseInt(value) : null;
                            updateTimetableSlot(dayName, timeSlot.label, subjectId, slotData.teacherId);
                          }}
                        >
                          <SelectTrigger className="w-full">
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
                        {slotData.subjectId && (
                          <Select
                            value={slotData.teacherId?.toString() || "none"}
                            onValueChange={(value: string) => {
                              const teacherId = (value && value !== "none") ? parseInt(value) : null;
                              updateTimetableSlot(dayName, timeSlot.label, slotData.subjectId, teacherId);
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select Teacher" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No Teacher</SelectItem>
                              {Array.isArray(teachers) && teachers.map((teacher: Teacher) => (
                                <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                  {teacher.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        {subject && (
                          <div className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-2 rounded">
                            <div className="font-medium">{subject.name}</div>
                            {teacher && <div className="text-blue-600 dark:text-blue-400">{teacher.name}</div>}
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
    </div>
  );

  const renderMonthlyView = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          {getViewTitle()}
        </h2>
        <p className="text-muted-foreground">Click on any time slot to edit assignments</p>
      </div>
      
      {getMonthWeeks().map((week, weekIndex) => (
        <div key={weekIndex} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Week {weekIndex + 1}</h3>
              <span className="text-sm opacity-90">
                {format(week[0], 'MMM d')} - {format(week[week.length - 1], 'MMM d')}
              </span>
            </div>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-5 gap-4">
              {week.map(date => {
                const isCurrentDay = date.toDateString() === new Date().toDateString();
                const dayClasses = `relative rounded-xl border-2 p-4 min-h-[200px] transition-all duration-300 hover:shadow-lg ${
                  isCurrentDay
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md' 
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600'
                }`;
                
                return (
                  <div key={date.toISOString()} className={dayClasses}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {format(date, 'd')}
                      </div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        {format(date, 'EEE')}
                      </div>
                    </div>
                    
                    {isCurrentDay && (
                      <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    )}
                    
                    <div className="space-y-2">
                      {timeSlots.slice(0, 3).map(timeSlot => {
                        const dayName = format(date, 'EEEE');
                        const slotData = getTimetableSlot(dayName, timeSlot.label);
                        
                        if (timeSlot.isBreak) {
                          return (
                            <div key={timeSlot.id} className="text-xs p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-700 dark:text-orange-300 font-medium">
                              {timeSlot.label}
                            </div>
                          );
                        }
                        
                        return (
                          <div key={timeSlot.id} className="bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-600">
                            <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                              {timeSlot.label}
                            </div>
                            <Select
                              value={slotData?.subjectId?.toString() || "none"}
                              onValueChange={(value: string) => {
                                const subjectId = (value && value !== "none") ? parseInt(value) : null;
                                const teacherId = slotData?.teacherId || null;
                                updateTimetableSlot(dayName, timeSlot.label, subjectId, teacherId);
                              }}
                            >
                              <SelectTrigger className="h-7 text-xs border-0 bg-gray-50 dark:bg-gray-700">
                                <SelectValue placeholder="Subject" />
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
                                value={slotData?.teacherId?.toString() || "none"}
                                onValueChange={(value: string) => {
                                  const teacherId = (value && value !== "none") ? parseInt(value) : null;
                                  updateTimetableSlot(dayName, timeSlot.label, slotData.subjectId, teacherId);
                                }}
                              >
                                <SelectTrigger className="h-7 text-xs border-0 bg-gray-50 dark:bg-gray-700 mt-1">
                                  <SelectValue placeholder="Teacher" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">No Teacher</SelectItem>
                                  {Array.isArray(teachers) && teachers.map((teacher: Teacher) => (
                                    <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                      {teacher.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderYearlyView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {getYearMonths().map(monthDate => (
          <div key={monthDate.toISOString()} className="border rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 text-center">
              <h3 className="font-semibold">{format(monthDate, 'MMMM')}</h3>
              <p className="text-sm opacity-90">{selectedYear}</p>
            </div>
            <div className="p-3 space-y-2">
              <div className="grid grid-cols-7 gap-1 text-xs">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                  <div key={i} className="text-center font-medium text-muted-foreground p-1">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {eachDayOfInterval({
                  start: startOfMonth(monthDate),
                  end: endOfMonth(monthDate)
                }).map(date => {
                  const dayName = format(date, 'EEEE');
                  const hasClasses = timeSlots.slice(0, 3).some(timeSlot => 
                    getTimetableSlot(dayName, timeSlot.label)
                  );
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  
                  let className = "text-xs p-1 text-center rounded";
                  if (isWeekend) className += " bg-gray-100 dark:bg-gray-800 text-muted-foreground";
                  if (hasClasses && !isWeekend) className += " bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
                  if (isToday(date)) className += " ring-2 ring-blue-500";
                  
                  return (
                    <div 
                      key={date.toISOString()} 
                      className={`${className} cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/20`}
                      onClick={() => {
                        if (!isWeekend) {
                          setCurrentDate(date);
                          setViewMode("weekly");
                        }
                      }}
                      title={`Click to edit ${format(date, 'MMM d, yyyy')} schedule`}
                    >
                      {format(date, 'd')}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Timetable Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage class schedules and subject assignments
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => setShowSubjectManager(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Subject
              </Button>
              <Button
                onClick={() => setShowPeriodManager(true)}
                variant="outline"
                className="border-gray-300 hover:bg-gray-50"
              >
                <Settings className="w-4 h-4 mr-2" />
                Manage Periods
              </Button>
              <Button
                onClick={saveTimetable}
                disabled={saveTimetableMutation.isPending}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              >
                {saveTimetableMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Timetable
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200 dark:bg-gray-900/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600 dark:text-gray-400">View Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                {["weekly", "monthly", "yearly"].map((mode) => (
                  <Button
                    key={mode}
                    size="sm"
                    variant={viewMode === mode ? "default" : "ghost"}
                    onClick={() => setViewMode(mode as any)}
                    className={viewMode === mode ? "bg-white dark:bg-gray-700 shadow-sm" : ""}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-gray-200 dark:bg-gray-900/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600 dark:text-gray-400">Class & Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"].map((cls) => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Section" />
                </SelectTrigger>
                <SelectContent>
                  {["A", "B", "C", "D"].map((section) => (
                    <SelectItem key={section} value={section}>Section {section}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-gray-200 dark:bg-gray-900/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600 dark:text-gray-400">Navigation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (viewMode === "weekly") setCurrentDate(addWeeks(currentDate, -1));
                    if (viewMode === "monthly") setCurrentDate(addMonths(currentDate, -1));
                    if (viewMode === "yearly") setSelectedYear(selectedYear - 1);
                  }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium">
                  {getViewTitle()}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (viewMode === "weekly") setCurrentDate(addWeeks(currentDate, 1));
                    if (viewMode === "monthly") setCurrentDate(addMonths(currentDate, 1));
                    if (viewMode === "yearly") setSelectedYear(selectedYear + 1);
                  }}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-gray-200 dark:bg-gray-900/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600 dark:text-gray-400">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="w-4 h-4 text-blue-500" />
                <span>{Array.isArray(subjects) ? subjects.length : 0} Subjects</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-green-500" />
                <span>{Array.isArray(teachers) ? teachers.length : 0} Teachers</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-purple-500" />
                <span>{timeSlots.filter(slot => !slot.isBreak).length} Periods</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {viewMode === "weekly" && renderWeeklyView()}
          {viewMode === "monthly" && renderMonthlyView()}
          {viewMode === "yearly" && renderYearlyView()}
        </div>

        {/* Subject Management Dialog */}
        <Dialog open={showSubjectManager} onOpenChange={setShowSubjectManager}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add New Subject
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="subjectName">Subject Name *</Label>
                <Input
                  id="subjectName"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="e.g., Advanced Mathematics, Environmental Science"
                />
              </div>
              <div>
                <Label htmlFor="subjectCode">Subject Code *</Label>
                <Input
                  id="subjectCode"
                  value={newSubjectCode}
                  onChange={(e) => setNewSubjectCode(e.target.value.toUpperCase())}
                  placeholder="e.g., AMATH, ENVS"
                  maxLength={10}
                />
              </div>
              <div>
                <Label htmlFor="subjectDescription">Description</Label>
                <Input
                  id="subjectDescription"
                  value={newSubjectDescription}
                  onChange={(e) => setNewSubjectDescription(e.target.value)}
                  placeholder="Brief description of the subject"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    if (!newSubjectName || !newSubjectCode) {
                      toast({
                        title: "Missing Information",
                        description: "Please provide both subject name and code",
                        variant: "destructive",
                      });
                      return;
                    }
                    
                    addSubjectMutation.mutate({
                      name: newSubjectName,
                      code: newSubjectCode,
                      description: newSubjectDescription || null
                    });
                  }}
                  disabled={addSubjectMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {addSubjectMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add Subject
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setNewSubjectName("");
                    setNewSubjectCode("");
                    setNewSubjectDescription("");
                    setShowSubjectManager(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}