import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { 
  Clock, Plus, Edit, Trash2, Calendar, Users, BookOpen, 
  ChevronLeft, ChevronRight, Download, Filter, Search,
  MapPin, User, GraduationCap, AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Timetable, Teacher, Subject } from "@shared/schema";

interface TimetableEntry extends Timetable {
  subject: Subject;
  teacher: Teacher;
}

interface TimeSlot {
  period: number;
  startTime: string;
  endTime: string;
  duration: number;
}

export default function TimetablePage() {
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState("Grade 6");
  const [selectedSection, setSelectedSection] = useState("A");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [viewMode, setViewMode] = useState<"weekly" | "daily">("weekly");

  const [newTimetableEntry, setNewTimetableEntry] = useState({
    class: "Grade 6",
    section: "A",
    day: "monday",
    period: 1,
    startTime: "09:00",
    endTime: "09:45",
    subjectId: "",
    teacherId: "",
    room: "",
  });

  // Time slots configuration
  const timeSlots: TimeSlot[] = [
    { period: 1, startTime: "09:00", endTime: "09:45", duration: 45 },
    { period: 2, startTime: "09:45", endTime: "10:30", duration: 45 },
    { period: 3, startTime: "10:45", endTime: "11:30", duration: 45 }, // Break: 10:30-10:45
    { period: 4, startTime: "11:30", endTime: "12:15", duration: 45 },
    { period: 5, startTime: "13:00", endTime: "13:45", duration: 45 }, // Lunch: 12:15-13:00
    { period: 6, startTime: "13:45", endTime: "14:30", duration: 45 },
    { period: 7, startTime: "14:30", endTime: "15:15", duration: 45 },
    { period: 8, startTime: "15:15", endTime: "16:00", duration: 45 },
  ];

  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const classes = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];

  // Fetch timetable data
  const { data: timetableData = [], isLoading: isLoadingTimetable } = useQuery({
    queryKey: ["/api/timetable", selectedClass, selectedSection],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/timetable?class=${selectedClass}&section=${selectedSection}`);
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

  // Create timetable entry mutation
  const createTimetableEntryMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/timetable", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timetable"] });
      toast({
        title: "Timetable Entry Created",
        description: "Subject period has been scheduled successfully",
      });
      setIsCreateModalOpen(false);
      resetForm();
    },
  });

  // Update timetable entry mutation
  const updateTimetableEntryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest("PUT", `/api/timetable/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timetable"] });
      toast({
        title: "Timetable Updated",
        description: "Subject period has been updated successfully",
      });
      setEditingEntry(null);
    },
  });

  // Delete timetable entry mutation
  const deleteTimetableEntryMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/timetable/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timetable"] });
      toast({
        title: "Period Deleted",
        description: "Subject period has been removed from timetable",
      });
    },
  });

  const resetForm = () => {
    setNewTimetableEntry({
      class: selectedClass,
      section: selectedSection,
      day: "monday",
      period: 1,
      startTime: "09:00",
      endTime: "09:45",
      subjectId: "",
      teacherId: "",
      room: "",
    });
  };

  const handleCreateEntry = () => {
    if (!newTimetableEntry.subjectId || !newTimetableEntry.teacherId) {
      toast({
        title: "Missing Information",
        description: "Please select both subject and teacher",
        variant: "destructive",
      });
      return;
    }

    const timeSlot = timeSlots.find(slot => slot.period === newTimetableEntry.period);
    const entryData = {
      ...newTimetableEntry,
      startTime: timeSlot?.startTime || newTimetableEntry.startTime,
      endTime: timeSlot?.endTime || newTimetableEntry.endTime,
      subjectId: parseInt(newTimetableEntry.subjectId),
      teacherId: parseInt(newTimetableEntry.teacherId),
    };

    createTimetableEntryMutation.mutate(entryData);
  };

  const handleEditEntry = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    setNewTimetableEntry({
      class: entry.class,
      section: entry.section,
      day: entry.day,
      period: entry.period,
      startTime: entry.startTime,
      endTime: entry.endTime,
      subjectId: entry.subjectId.toString(),
      teacherId: entry.teacherId.toString(),
      room: entry.room || "",
    });
  };

  const handleUpdateEntry = () => {
    if (!editingEntry) return;

    const timeSlot = timeSlots.find(slot => slot.period === newTimetableEntry.period);
    const entryData = {
      ...newTimetableEntry,
      startTime: timeSlot?.startTime || newTimetableEntry.startTime,
      endTime: timeSlot?.endTime || newTimetableEntry.endTime,
      subjectId: parseInt(newTimetableEntry.subjectId),
      teacherId: parseInt(newTimetableEntry.teacherId),
    };

    updateTimetableEntryMutation.mutate({ id: editingEntry.id, data: entryData });
  };

  const getTimetableEntry = (day: string, period: number): TimetableEntry | undefined => {
    return timetableData.find((entry: TimetableEntry) => 
      entry.day === day && entry.period === period
    );
  };

  const getSubjectName = (subjectId: number): string => {
    const subject = subjects.find((s: Subject) => s.id === subjectId);
    return subject?.name || "Unknown Subject";
  };

  const getTeacherName = (teacherId: number): string => {
    const teacher = teachers.find((t: Teacher) => t.id === teacherId);
    return teacher?.name || "Unknown Teacher";
  };

  const getSubjectColor = (subjectName: string): string => {
    const colors = [
      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
      "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
      "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    ];
    return colors[subjectName.length % colors.length];
  };

  const isBreakTime = (period: number): boolean => {
    return period === 3 || period === 5; // Periods after break
  };

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Subject Timetable & Schedule
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage class schedules, subject periods, and teacher assignments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Schedule
          </Button>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Period
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingEntry ? "Edit Period" : "Add New Period"}
                </DialogTitle>
                <DialogDescription>
                  Schedule a subject period with teacher assignment
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="class">Class</Label>
                    <Select 
                      value={newTimetableEntry.class} 
                      onValueChange={(value) => setNewTimetableEntry({ ...newTimetableEntry, class: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="section">Section</Label>
                    <Select 
                      value={newTimetableEntry.section} 
                      onValueChange={(value) => setNewTimetableEntry({ ...newTimetableEntry, section: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="day">Day</Label>
                    <Select 
                      value={newTimetableEntry.day} 
                      onValueChange={(value) => setNewTimetableEntry({ ...newTimetableEntry, day: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {days.map((day) => (
                          <SelectItem key={day} value={day}>
                            {day.charAt(0).toUpperCase() + day.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="period">Period</Label>
                    <Select 
                      value={newTimetableEntry.period.toString()} 
                      onValueChange={(value) => setNewTimetableEntry({ ...newTimetableEntry, period: parseInt(value) })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot.period} value={slot.period.toString()}>
                            Period {slot.period} ({slot.startTime} - {slot.endTime})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select 
                    value={newTimetableEntry.subjectId} 
                    onValueChange={(value) => setNewTimetableEntry({ ...newTimetableEntry, subjectId: value })}
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

                <div>
                  <Label htmlFor="teacher">Teacher</Label>
                  <Select 
                    value={newTimetableEntry.teacherId} 
                    onValueChange={(value) => setNewTimetableEntry({ ...newTimetableEntry, teacherId: value })}
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
                  <Label htmlFor="room">Room (Optional)</Label>
                  <Input
                    id="room"
                    value={newTimetableEntry.room}
                    onChange={(e) => setNewTimetableEntry({ ...newTimetableEntry, room: e.target.value })}
                    placeholder="e.g., Room 101, Lab A"
                    className="mt-1"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setEditingEntry(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={editingEntry ? handleUpdateEntry : handleCreateEntry}
                    disabled={createTimetableEntryMutation.isPending || updateTimetableEntryMutation.isPending}
                  >
                    {editingEntry ? "Update" : "Create"} Period
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Class and Section Selector */}
      <Card className="animate-slide-up">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex gap-4">
              <div>
                <Label>Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-32 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Section</Label>
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger className="w-24 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 ml-auto">
              <Button 
                variant={viewMode === "weekly" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("weekly")}
              >
                Weekly View
              </Button>
              <Button 
                variant={viewMode === "daily" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("daily")}
              >
                Daily View
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Timetable Grid */}
      <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Timetable - {selectedClass} {selectedSection}
          </CardTitle>
          <CardDescription>
            Subject schedule with teacher assignments and room details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-3 bg-muted font-semibold text-left min-w-24">Period</th>
                  {days.map((day) => (
                    <th key={day} className="border p-3 bg-muted font-semibold text-center min-w-40">
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((slot) => (
                  <tr key={slot.period}>
                    <td className="border p-3 bg-muted/50">
                      <div className="text-sm font-medium">Period {slot.period}</div>
                      <div className="text-xs text-muted-foreground">
                        {slot.startTime} - {slot.endTime}
                      </div>
                      {isBreakTime(slot.period) && slot.period === 3 && (
                        <div className="text-xs text-orange-600 font-medium mt-1">
                          After Break
                        </div>
                      )}
                      {isBreakTime(slot.period) && slot.period === 5 && (
                        <div className="text-xs text-orange-600 font-medium mt-1">
                          After Lunch
                        </div>
                      )}
                    </td>
                    {days.map((day) => {
                      const entry = getTimetableEntry(day, slot.period);
                      return (
                        <td key={`${day}-${slot.period}`} className="border p-2 h-20">
                          {entry ? (
                            <div className={`p-2 rounded-lg text-sm ${getSubjectColor(getSubjectName(entry.subjectId))} h-full flex flex-col justify-between`}>
                              <div>
                                <div className="font-semibold truncate">
                                  {getSubjectName(entry.subjectId)}
                                </div>
                                <div className="text-xs flex items-center gap-1 mt-1">
                                  <User className="h-3 w-3" />
                                  {getTeacherName(entry.teacherId)}
                                </div>
                                {entry.room && (
                                  <div className="text-xs flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {entry.room}
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-1 mt-2">
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-6 w-6 p-0"
                                  onClick={() => {
                                    handleEditEntry(entry);
                                    setIsCreateModalOpen(true);
                                  }}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                                  onClick={() => deleteTimetableEntryMutation.mutate(entry.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-full w-full text-xs"
                                onClick={() => {
                                  setNewTimetableEntry({
                                    ...newTimetableEntry,
                                    day,
                                    period: slot.period,
                                    startTime: slot.startTime,
                                    endTime: slot.endTime,
                                  });
                                  setIsCreateModalOpen(true);
                                }}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add
                              </Button>
                            </div>
                          )}
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

      {/* Break Times Info */}
      <Card className="animate-slide-up" style={{ animationDelay: '400ms' }}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="font-medium">Break Times:</span>
            </div>
            <Badge variant="outline">Morning Break: 10:30 - 10:45 AM</Badge>
            <Badge variant="outline">Lunch Break: 12:15 - 1:00 PM</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}