import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  CalendarIcon, Plus, Edit, Trash2, Clock, Users, BookOpen, 
  ChevronLeft, ChevronRight, Download, Filter, Search, MapPin,
  GraduationCap, AlertCircle, Bell, Eye, MoreHorizontal
} from "lucide-react";
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday,
  startOfWeek, endOfWeek, addWeeks, subWeeks, addDays, startOfDay, endOfDay, isSameWeek
} from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { CalendarEvent, Subject, Teacher } from "@shared/schema";

interface EventWithDetails extends CalendarEvent {
  subject?: Subject;
  teacher?: Teacher;
}

interface MonthlyTimetableCreatorProps {
  currentDate: Date;
  subjects: Subject[];
  teachers: Teacher[];
  onSave: (timetableData: any) => void;
}

function MonthlyTimetableCreator({ currentDate, subjects, teachers, onSave }: MonthlyTimetableCreatorProps) {
  const [timetableData, setTimetableData] = useState<any>({});
  const [selectedClass, setSelectedClass] = useState("Grade 6");
  
  const classes = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"];
  const timeSlots = [
    "08:00-09:00", "09:00-10:00", "10:00-11:00", "11:00-12:00",
    "12:00-13:00", "13:00-14:00", "14:00-15:00", "15:00-16:00", "16:00-17:00"
  ];
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  
  // Get all weekdays for the current month
  const getMonthWeekdays = () => {
    const startOfCurrentMonth = startOfMonth(currentDate);
    const endOfCurrentMonth = endOfMonth(currentDate);
    const allDays = eachDayOfInterval({ start: startOfCurrentMonth, end: endOfCurrentMonth });
    return allDays.filter(day => day.getDay() >= 1 && day.getDay() <= 5); // Monday to Friday
  };

  const monthWeekdays = getMonthWeekdays();

  const updateTimetableSlot = (date: Date, timeSlot: string, subjectId: number | null, teacherId: number | null) => {
    const dateKey = format(date, "yyyy-MM-dd");
    const newData = { ...timetableData };
    
    if (!newData[selectedClass]) {
      newData[selectedClass] = {};
    }
    if (!newData[selectedClass][dateKey]) {
      newData[selectedClass][dateKey] = {};
    }
    
    if (subjectId && teacherId) {
      const subject = subjects.find(s => s.id === subjectId);
      const teacher = teachers.find(t => t.id === teacherId);
      
      newData[selectedClass][dateKey][timeSlot] = {
        subjectId,
        teacherId,
        subjectName: subject?.name || "",
        teacherName: teacher?.name || "",
        color: getSubjectColor(subjectId)
      };
    } else {
      delete newData[selectedClass][dateKey][timeSlot];
    }
    
    setTimetableData(newData);
  };

  const getSubjectColor = (subjectId: number): string => {
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
    return colors[subjectId % colors.length];
  };

  const getTimetableSlot = (date: Date, timeSlot: string) => {
    const dateKey = format(date, "yyyy-MM-dd");
    return timetableData[selectedClass]?.[dateKey]?.[timeSlot] || null;
  };

  const copyWeekSchedule = (sourceWeek: Date[], targetWeek: Date[]) => {
    const newData = { ...timetableData };
    
    sourceWeek.forEach((sourceDate, index) => {
      if (targetWeek[index]) {
        const sourceDateKey = format(sourceDate, "yyyy-MM-dd");
        const targetDateKey = format(targetWeek[index], "yyyy-MM-dd");
        
        if (newData[selectedClass]?.[sourceDateKey]) {
          if (!newData[selectedClass]) newData[selectedClass] = {};
          newData[selectedClass][targetDateKey] = { ...newData[selectedClass][sourceDateKey] };
        }
      }
    });
    
    setTimetableData(newData);
  };

  const getWeeksInMonth = () => {
    const weeks: Date[][] = [];
    const monthStart = startOfMonth(currentDate);
    let currentWeekStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    
    while (currentWeekStart <= endOfMonth(currentDate)) {
      const week = [];
      for (let i = 0; i < 5; i++) { // Monday to Friday
        const day = addDays(currentWeekStart, i);
        if (day >= monthStart && day <= endOfMonth(currentDate)) {
          week.push(day);
        }
      }
      if (week.length > 0) {
        weeks.push(week);
      }
      currentWeekStart = addWeeks(currentWeekStart, 1);
    }
    
    return weeks;
  };

  return (
    <div className="space-y-6">
      {/* Class Selection */}
      <div className="flex items-center gap-4">
        <Label>Select Class:</Label>
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

      {/* Weekly Timetable Grid */}
      <div className="space-y-8">
        {getWeeksInMonth().map((week, weekIndex) => (
          <Card key={weekIndex} className="p-4">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Week {weekIndex + 1} - {format(week[0], "MMM d")} to {format(week[week.length - 1], "MMM d")}
                </CardTitle>
                {weekIndex > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyWeekSchedule(getWeeksInMonth()[0], week)}
                  >
                    Copy from Week 1
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2 bg-muted font-semibold">Time</th>
                      {week.map(date => (
                        <th key={date.toISOString()} className="border p-2 bg-muted font-semibold min-w-40">
                          {format(date, "EEE, MMM d")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map(timeSlot => (
                      <tr key={timeSlot}>
                        <td className="border p-2 font-medium text-sm bg-muted/50">
                          {timeSlot}
                        </td>
                        {week.map(date => {
                          const slotData = getTimetableSlot(date, timeSlot);
                          return (
                            <td key={`${date.toISOString()}-${timeSlot}`} className="border p-1">
                              <div className="space-y-2">
                                <Select
                                  value={slotData?.subjectId?.toString() || ""}
                                  onValueChange={(value) => {
                                    const subjectId = value ? parseInt(value) : null;
                                    const teacherId = slotData?.teacherId || (subjects.find(s => s.id === subjectId) ? subjects[0]?.id : null);
                                    updateTimetableSlot(date, timeSlot, subjectId, teacherId);
                                  }}
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Subject" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="">No Subject</SelectItem>
                                    {subjects.map(subject => (
                                      <SelectItem key={subject.id} value={subject.id.toString()}>
                                        {subject.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                
                                {slotData?.subjectId && (
                                  <Select
                                    value={slotData?.teacherId?.toString() || ""}
                                    onValueChange={(value) => {
                                      const teacherId = value ? parseInt(value) : null;
                                      updateTimetableSlot(date, timeSlot, slotData.subjectId, teacherId);
                                    }}
                                  >
                                    <SelectTrigger className="h-8 text-xs">
                                      <SelectValue placeholder="Teacher" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {teachers.map(teacher => (
                                        <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                          {teacher.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                                
                                {slotData && (
                                  <div 
                                    className="text-xs p-1 rounded text-white text-center"
                                    style={{ backgroundColor: slotData.color }}
                                  >
                                    {slotData.subjectName}
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
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={() => setTimetableData({})}>
          Clear All
        </Button>
        <Button onClick={() => onSave(timetableData)}>
          Save Monthly Timetable
        </Button>
      </div>
    </div>
  );
}

interface TimetableManagerProps {
  selectedClass: string;
  onClassChange: (className: string) => void;
  subjects: Subject[];
  teachers: Teacher[];
}

function TimetableManager({ selectedClass, onClassChange, subjects, teachers }: TimetableManagerProps) {
  const [timetableData, setTimetableData] = useState<any>({});
  
  const classes = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"];
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

  // Load existing timetable data
  const { data: existingTimetable, isLoading } = useQuery({
    queryKey: ["/api/timetable", selectedClass],
    retry: false,
  });

  const updateTimetableSlot = (day: string, period: number, subjectId: number | null, teacherId: number | null) => {
    const newData = { ...timetableData };
    
    if (!newData[selectedClass]) {
      newData[selectedClass] = {};
    }
    if (!newData[selectedClass][day]) {
      newData[selectedClass][day] = {};
    }
    
    if (subjectId && teacherId && period !== 5) { // Skip lunch break
      const subject = subjects.find(s => s.id === subjectId);
      const teacher = teachers.find(t => t.id === teacherId);
      
      newData[selectedClass][day][period] = {
        subjectId,
        teacherId,
        subjectName: subject?.name || "",
        teacherName: teacher?.name || "",
        color: getSubjectColor(subjectId)
      };
    } else {
      delete newData[selectedClass][day][period];
    }
    
    setTimetableData(newData);
  };

  const getSubjectColor = (subjectId: number): string => {
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
    return colors[subjectId % colors.length];
  };

  const getTimetableSlot = (day: string, period: number) => {
    return timetableData[selectedClass]?.[day]?.[period] || 
           existingTimetable?.find((entry: any) => 
             entry.class === selectedClass && 
             entry.day === day && 
             entry.period === period
           ) || null;
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
            section: "A", // Default section
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

  return (
    <div className="space-y-6">
      {/* Class Selection */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Label>Select Class:</Label>
          <Select value={selectedClass} onValueChange={onClassChange}>
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
        <Button onClick={handleSaveTimetable} disabled={saveTimetableMutation.isPending}>
          {saveTimetableMutation.isPending ? "Saving..." : "Save Timetable"}
        </Button>
      </div>

      {/* Timetable Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Timetable - {selectedClass}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-3 bg-muted font-semibold">Time / Day</th>
                  {daysOfWeek.map(day => (
                    <th key={day} className="border p-3 bg-muted font-semibold min-w-48">
                      {day}
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
                    {daysOfWeek.map(day => {
                      if (timeSlot.period === 5) {
                        // Lunch break row
                        return (
                          <td key={`${day}-${timeSlot.period}`} className="border p-3 text-center bg-orange-50 dark:bg-orange-900/20">
                            <div className="text-orange-600 font-medium">Lunch Break</div>
                          </td>
                        );
                      }

                      const slotData = getTimetableSlot(day, timeSlot.period);
                      return (
                        <td key={`${day}-${timeSlot.period}`} className="border p-2">
                          <div className="space-y-2">
                            <Select
                              value={slotData?.subjectId?.toString() || ""}
                              onValueChange={(value) => {
                                const subjectId = value ? parseInt(value) : null;
                                const teacherId = slotData?.teacherId || (subjects.find(s => s.id === subjectId) ? subjects[0]?.id : null);
                                updateTimetableSlot(day, timeSlot.period, subjectId, teacherId);
                              }}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Select Subject" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">No Subject</SelectItem>
                                {subjects.map(subject => (
                                  <SelectItem key={subject.id} value={subject.id.toString()}>
                                    {subject.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
                            {slotData?.subjectId && (
                              <Select
                                value={slotData?.teacherId?.toString() || ""}
                                onValueChange={(value) => {
                                  const teacherId = value ? parseInt(value) : null;
                                  updateTimetableSlot(day, timeSlot.period, slotData.subjectId, teacherId);
                                }}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue placeholder="Select Teacher" />
                                </SelectTrigger>
                                <SelectContent>
                                  {teachers.map(teacher => (
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
    </div>
  );
}

export default function CalendarPage() {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date>(new Date());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventWithDetails | null>(null);
  const [filterType, setFilterType] = useState("all");
  const [isMonthlyTimetableOpen, setIsMonthlyTimetableOpen] = useState(false);
  const [monthlyTimetableData, setMonthlyTimetableData] = useState<any>({});
  const [isTimetableViewOpen, setIsTimetableViewOpen] = useState(false);
  const [selectedTimetableClass, setSelectedTimetableClass] = useState("Grade 6");

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    type: "event",
    class: "",
    subjectId: "",
    teacherId: "",
    location: "",
    color: "#3b82f6",
    isAllDay: false,
  });

  const eventTypes = [
    { value: "class", label: "Class", color: "#3b82f6" },
    { value: "exam", label: "Exam", color: "#ef4444" },
    { value: "holiday", label: "Holiday", color: "#10b981" },
    { value: "meeting", label: "Meeting", color: "#f59e0b" },
    { value: "event", label: "Event", color: "#8b5cf6" },
    { value: "assignment", label: "Assignment Due", color: "#ec4899" },
  ];

  const classes = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];

  // Fetch calendar events
  const { data: events = [], isLoading: isLoadingEvents } = useQuery({
    queryKey: ["/api/calendar", format(currentDate, "yyyy-MM")],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/calendar?month=${format(currentDate, "yyyy-MM")}`);
      return Array.isArray(response) ? response : [];
    },
  });

  // Fetch subjects and teachers
  const { data: subjects = [] } = useQuery({
    queryKey: ["/api/subjects"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/subjects");
      return Array.isArray(response) ? response : [];
    },
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ["/api/teachers"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/teachers");
      return Array.isArray(response) ? response : [];
    },
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/calendar", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar"] });
      toast({
        title: "Event Created",
        description: "Calendar event has been added successfully",
      });
      setIsCreateModalOpen(false);
      resetForm();
    },
  });

  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest("PUT", `/api/calendar/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar"] });
      toast({
        title: "Event Updated",
        description: "Calendar event has been updated successfully",
      });
      setEditingEvent(null);
    },
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/calendar/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar"] });
      toast({
        title: "Event Deleted",
        description: "Calendar event has been removed",
      });
    },
  });

  const resetForm = () => {
    setNewEvent({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      type: "event",
      class: "",
      subjectId: "",
      teacherId: "",
      location: "",
      color: "#3b82f6",
      isAllDay: false,
    });
  };

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.startDate) {
      toast({
        title: "Missing Information",
        description: "Please provide event title and start date",
        variant: "destructive",
      });
      return;
    }

    const eventData = {
      ...newEvent,
      startDate: new Date(newEvent.startDate).toISOString(),
      endDate: newEvent.endDate ? new Date(newEvent.endDate).toISOString() : new Date(newEvent.startDate).toISOString(),
      subjectId: newEvent.subjectId ? parseInt(newEvent.subjectId) : null,
      teacherId: newEvent.teacherId ? parseInt(newEvent.teacherId) : null,
    };

    createEventMutation.mutate(eventData);
  };

  const handleEditEvent = (event: EventWithDetails) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      description: event.description || "",
      startDate: format(new Date(event.startDate), "yyyy-MM-dd'T'HH:mm"),
      endDate: format(new Date(event.endDate), "yyyy-MM-dd'T'HH:mm"),
      type: event.type,
      class: event.class || "",
      subjectId: event.subjectId?.toString() || "",
      teacherId: event.teacherId?.toString() || "",
      location: event.location || "",
      color: event.color || "#3b82f6",
      isAllDay: event.isAllDay || false,
    });
    setIsCreateModalOpen(true);
  };

  const handleUpdateEvent = () => {
    if (!editingEvent) return;

    const eventData = {
      ...newEvent,
      startDate: new Date(newEvent.startDate).toISOString(),
      endDate: newEvent.endDate ? new Date(newEvent.endDate).toISOString() : new Date(newEvent.startDate).toISOString(),
      subjectId: newEvent.subjectId ? parseInt(newEvent.subjectId) : null,
      teacherId: newEvent.teacherId ? parseInt(newEvent.teacherId) : null,
    };

    updateEventMutation.mutate({ id: editingEvent.id, data: eventData });
  };

  const getEventsForDate = (date: Date): EventWithDetails[] => {
    return Array.isArray(events) ? events.filter((event: EventWithDetails) => 
      isSameDay(new Date(event.startDate), date) ||
      (new Date(event.startDate) <= date && new Date(event.endDate) >= date)
    ) : [];
  };

  const getWeekDays = (startDate: Date): Date[] => {
    const start = startOfWeek(startDate, { weekStartsOn: 1 }); // Monday start
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const getCurrentViewDates = (): Date[] => {
    switch (viewMode) {
      case "day":
        return [selectedDate || currentDate];
      case "week":
        return getWeekDays(selectedDate || currentDate);
      case "month":
        return eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) });
      default:
        return [];
    }
  };

  const navigateDate = (direction: "prev" | "next") => {
    switch (viewMode) {
      case "day":
        const newDay = direction === "next" ? addDays(currentDate, 1) : addDays(currentDate, -1);
        setCurrentDate(newDay);
        break;
      case "week":
        const newWeek = direction === "next" ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1);
        setCurrentDate(newWeek);
        break;
      case "month":
        const newMonth = direction === "next" ? addMonths(currentDate, 1) : subMonths(currentDate, 1);
        setCurrentDate(newMonth);
        break;
    }
  };

  const getViewTitle = (): string => {
    switch (viewMode) {
      case "day":
        return format(currentDate, "EEEE, MMMM d, yyyy");
      case "week":
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
      case "month":
        return format(currentDate, "MMMM yyyy");
      default:
        return "";
    }
  };

  const getEventTypeColor = (type: string): string => {
    const eventType = eventTypes.find(t => t.value === type);
    return eventType?.color || "#3b82f6";
  };

  const getEventTypeLabel = (type: string): string => {
    const eventType = eventTypes.find(t => t.value === type);
    return eventType?.label || type;
  };

  const filteredEvents = filterType === "all" ? events : events.filter((event: EventWithDetails) => event.type === filterType);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Academic Calendar & Events
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage school events, exams, holidays, and academic activities
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isTimetableViewOpen} onOpenChange={setIsTimetableViewOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Clock className="w-4 h-4 mr-2" />
                Class Timetable
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Weekly Class Timetable</DialogTitle>
                <DialogDescription>
                  Manage weekly schedules for each class with subject and teacher assignments
                </DialogDescription>
              </DialogHeader>
              <TimetableManager 
                selectedClass={selectedTimetableClass}
                onClassChange={setSelectedTimetableClass}
                subjects={Array.isArray(subjects) ? subjects : []}
                teachers={Array.isArray(teachers) ? teachers : []}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={isMonthlyTimetableOpen} onOpenChange={setIsMonthlyTimetableOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Monthly Timetable
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Monthly Timetable - {format(currentDate, "MMMM yyyy")}</DialogTitle>
                <DialogDescription>
                  Set up comprehensive monthly schedule with subjects, teachers, and time slots
                </DialogDescription>
              </DialogHeader>
              <MonthlyTimetableCreator 
                currentDate={currentDate}
                subjects={Array.isArray(subjects) ? subjects : []}
                teachers={Array.isArray(teachers) ? teachers : []}
                onSave={(timetableData: any) => {
                  setMonthlyTimetableData(timetableData);
                  setIsMonthlyTimetableOpen(false);
                  toast({
                    title: "Monthly Timetable Created",
                    description: "The monthly timetable has been successfully created.",
                  });
                }}
              />
            </DialogContent>
          </Dialog>
          
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Calendar
          </Button>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingEvent ? "Edit Event" : "Create New Event"}
                </DialogTitle>
                <DialogDescription>
                  Add academic events, exams, meetings, and activities
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Enter event title"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Event description (optional)"
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="type">Event Type</Label>
                  <Select 
                    value={newEvent.type} 
                    onValueChange={(value) => {
                      const selectedType = eventTypes.find(t => t.value === value);
                      setNewEvent({ 
                        ...newEvent, 
                        type: value,
                        color: selectedType?.color || "#3b82f6"
                      });
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: type.color }}
                            />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date & Time *</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={newEvent.startDate}
                      onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date & Time</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={newEvent.endDate}
                      onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                {(newEvent.type === "class" || newEvent.type === "exam") && (
                  <div>
                    <Label htmlFor="class">Class</Label>
                    <Select 
                      value={newEvent.class} 
                      onValueChange={(value) => setNewEvent({ ...newEvent, class: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {(newEvent.type === "class" || newEvent.type === "exam") && (
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Select 
                      value={newEvent.subjectId} 
                      onValueChange={(value) => setNewEvent({ ...newEvent, subjectId: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(subjects) && subjects.map((subject: Subject) => (
                          <SelectItem key={subject.id} value={subject.id.toString()}>
                            {subject.name} ({subject.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="teacher">Teacher (Optional)</Label>
                  <Select 
                    value={newEvent.teacherId} 
                    onValueChange={(value) => setNewEvent({ ...newEvent, teacherId: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(teachers) && teachers.map((teacher: Teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id.toString()}>
                          {teacher.name} - {teacher.subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="e.g., Auditorium, Room 101"
                    className="mt-1"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setEditingEvent(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={editingEvent ? handleUpdateEvent : handleCreateEvent}
                    disabled={createEventMutation.isPending || updateEventMutation.isPending}
                  >
                    {editingEvent ? "Update" : "Create"} Event
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Calendar Navigation and Filters */}
      <Card className="animate-slide-up">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigateDate("prev")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-xl font-semibold min-w-64 text-center">
                  {getViewTitle()}
                </h2>
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
            <div className="flex gap-2">
              <div className="flex gap-1 bg-muted rounded-lg p-1">
                <Button 
                  variant={viewMode === "day" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("day")}
                  className="h-8"
                >
                  Day
                </Button>
                <Button 
                  variant={viewMode === "week" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("week")}
                  className="h-8"
                >
                  Week
                </Button>
                <Button 
                  variant={viewMode === "month" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("month")}
                  className="h-8"
                >
                  Month
                </Button>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {eventTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <Card className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {viewMode === "day" && "Daily Schedule"}
              {viewMode === "week" && "Weekly Schedule"}
              {viewMode === "month" && "Monthly Calendar"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {viewMode === "month" && (
              <>
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <div key={day} className="p-2 text-center font-semibold text-sm text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) }).map((date) => {
                    const dayEvents = getEventsForDate(date);
                    const isCurrentDay = isToday(date);
                    
                    return (
                      <div 
                        key={date.toISOString()}
                        className={`min-h-24 p-2 border rounded-lg cursor-pointer transition-colors ${
                          isCurrentDay 
                            ? "bg-primary/10 border-primary" 
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => setSelectedDate(date)}
                      >
                        <div className={`text-sm font-semibold mb-1 ${
                          isCurrentDay ? "text-primary" : ""
                        }`}>
                          {format(date, "d")}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div 
                              key={event.id}
                              className="text-xs p-1 rounded truncate text-white"
                              style={{ backgroundColor: getEventTypeColor(event.type) }}
                              title={event.title}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {viewMode === "week" && (
              <div className="space-y-4">
                <div className="grid grid-cols-8 gap-2">
                  <div className="p-2 text-center font-semibold text-sm text-muted-foreground">Time</div>
                  {getWeekDays(currentDate).map((date) => (
                    <div key={date.toISOString()} className="p-2 text-center">
                      <div className="font-semibold text-sm">{format(date, "EEE")}</div>
                      <div className={`text-lg font-bold ${isToday(date) ? "text-primary" : ""}`}>
                        {format(date, "d")}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Time slots for weekly view */}
                {Array.from({ length: 12 }, (_, i) => {
                  const hour = 8 + i; // 8 AM to 7 PM
                  const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
                  
                  return (
                    <div key={timeSlot} className="grid grid-cols-8 gap-2 border-t">
                      <div className="p-2 text-sm text-muted-foreground">{timeSlot}</div>
                      {getWeekDays(currentDate).map((date) => {
                        const dayEvents = getEventsForDate(date).filter(event => {
                          const eventHour = new Date(event.startDate).getHours();
                          return eventHour === hour || (event.isAllDay && hour === 9); // Show all-day events at 9 AM
                        });
                        
                        return (
                          <div key={`${date.toISOString()}-${timeSlot}`} className="p-1 min-h-16">
                            {dayEvents.map((event) => (
                              <div 
                                key={event.id}
                                className="text-xs p-2 rounded mb-1 text-white cursor-pointer"
                                style={{ backgroundColor: getEventTypeColor(event.type) }}
                                title={`${event.title} - ${event.description || ''}`}
                                onClick={() => handleEditEvent(event)}
                              >
                                <div className="font-medium truncate">{event.title}</div>
                                {event.class && (
                                  <div className="text-xs opacity-80">{event.class}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}

            {viewMode === "day" && (
              <div className="space-y-2">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold">{format(currentDate, "EEEE, MMMM d, yyyy")}</h3>
                </div>
                
                {/* Hourly schedule for daily view */}
                {Array.from({ length: 12 }, (_, i) => {
                  const hour = 8 + i; // 8 AM to 7 PM
                  const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
                  const dayEvents = getEventsForDate(currentDate).filter(event => {
                    const eventHour = new Date(event.startDate).getHours();
                    return eventHour === hour || (event.isAllDay && hour === 9);
                  });
                  
                  return (
                    <div key={timeSlot} className="flex gap-4 border-b pb-2">
                      <div className="w-20 text-sm text-muted-foreground pt-2">{timeSlot}</div>
                      <div className="flex-1 space-y-2">
                        {dayEvents.length > 0 ? (
                          dayEvents.map((event) => (
                            <div 
                              key={event.id}
                              className="p-3 rounded-lg text-white cursor-pointer"
                              style={{ backgroundColor: getEventTypeColor(event.type) }}
                              onClick={() => handleEditEvent(event)}
                            >
                              <div className="font-semibold">{event.title}</div>
                              <div className="text-sm opacity-90">{event.description}</div>
                              {event.class && (
                                <div className="text-sm opacity-80 flex items-center gap-1 mt-1">
                                  <GraduationCap className="h-3 w-3" />
                                  {event.class}
                                </div>
                              )}
                              {event.location && (
                                <div className="text-sm opacity-80 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {event.location}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-muted-foreground text-sm italic p-2">No events scheduled</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Events List */}
        <Card className="animate-slide-up" style={{ animationDelay: '400ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Upcoming Events
            </CardTitle>
            <CardDescription>
              {selectedDate ? `Events for ${format(selectedDate, "PPP")}` : "Recent and upcoming events"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(selectedDate ? getEventsForDate(selectedDate) : filteredEvents.slice(0, 10))
                .map((event: EventWithDetails) => (
                <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div 
                    className="w-3 h-3 rounded-full mt-1" 
                    style={{ backgroundColor: getEventTypeColor(event.type) }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{event.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Badge variant="outline" className="text-xs">
                        {getEventTypeLabel(event.type)}
                      </Badge>
                      <span>{format(new Date(event.startDate), "MMM d, h:mm a")}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </div>
                    )}
                    {event.class && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <GraduationCap className="h-3 w-3" />
                        {event.class}
                      </div>
                    )}
                    {event.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 w-8 p-0"
                      onClick={() => handleEditEvent(event)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                      onClick={() => deleteEventMutation.mutate(event.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {(selectedDate ? getEventsForDate(selectedDate) : filteredEvents).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No events found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}