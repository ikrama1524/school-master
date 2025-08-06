import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { 
  Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, 
  Filter, Download, Settings, Clock, Users, BookOpen, 
  Edit, Trash2, MapPin, GraduationCap, FileText,
  CheckCircle, AlertCircle, Star, Target
} from "lucide-react";
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, 
  addMonths, subMonths, isSameDay, isToday, addDays, 
  startOfWeek, endOfWeek, subWeeks, addWeeks 
} from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Subject, Teacher } from "@shared/schema";

interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  type: string;
  class?: string;
  subjectId?: number;
  teacherId?: number;
  location?: string;
  color: string;
  isAllDay: boolean;
}

interface EventWithDetails extends CalendarEvent {
  subjectName?: string;
  teacherName?: string;
}

const eventTypes = [
  { value: "class", label: "Class", color: "#3b82f6" },
  { value: "exam", label: "Exam", color: "#ef4444" },
  { value: "meeting", label: "Meeting", color: "#f97316" },
  { value: "holiday", label: "Holiday", color: "#22c55e" },
  { value: "event", label: "School Event", color: "#8b5cf6" },
  { value: "deadline", label: "Deadline", color: "#ec4899" },
  { value: "assembly", label: "Assembly", color: "#06b6d4" },
];

const classes = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"];

export default function CalendarPage() {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("month");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filterType, setFilterType] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventWithDetails | null>(null);

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

  // Fetch calendar events
  const { data: events = [], isLoading: isLoadingEvents } = useQuery({
    queryKey: ["/api/calendar", format(currentDate, "yyyy-MM")],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/calendar?month=${format(currentDate, "yyyy-MM")}`);
      return Array.isArray(response) ? response : [];
    },
  });

  // Fetch subjects and teachers for event creation
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
    mutationFn: async (eventData: any) => {
      return await apiRequest("POST", "/api/calendar", eventData);
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
      setIsCreateModalOpen(false);
      setEditingEvent(null);
      resetForm();
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
        description: "Calendar event has been removed successfully",
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
    setEditingEvent(null);
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
            Academic Calendar
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage school events, exams, holidays, and academic activities
          </p>
        </div>
        <div className="flex gap-2">
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
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {(newEvent.type === "class" || newEvent.type === "meeting") && (
                  <div>
                    <Label htmlFor="teacher">Teacher</Label>
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
                            {teacher.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="Event location (optional)"
                    className="mt-1"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => {
                    setIsCreateModalOpen(false);
                    resetForm();
                  }}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={editingEvent ? handleUpdateEvent : handleCreateEvent}
                    disabled={createEventMutation.isPending || updateEventMutation.isPending}
                  >
                    {editingEvent ? "Update Event" : "Create Event"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Calendar Controls */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate("prev")}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="min-w-[200px] text-center">
                  <h2 className="text-lg font-semibold">{getViewTitle()}</h2>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate("next")}
                >
                  <ChevronRight className="w-4 h-4" />
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

            <div className="flex items-center gap-2">
              <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
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
        </CardHeader>

        <CardContent>
          {viewMode === "month" && (
            <div className="grid grid-cols-7 gap-1">
              {/* Week days header */}
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground border-b">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {calendarDays.map((date, index) => {
                const dayEvents = getEventsForDate(date);
                const isCurrentDay = isToday(date);
                
                return (
                  <div
                    key={index}
                    className={`min-h-[120px] p-2 border border-border hover:bg-muted/50 cursor-pointer transition-colors ${
                      isCurrentDay ? "bg-primary/10 border-primary" : ""
                    }`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <div className={`text-sm ${isCurrentDay ? "font-bold text-primary" : "text-muted-foreground"}`}>
                      {format(date, "d")}
                    </div>
                    <div className="space-y-1 mt-1">
                      {dayEvents.slice(0, 2).map((event: EventWithDetails) => (
                        <div
                          key={event.id}
                          className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80"
                          style={{ backgroundColor: event.color, color: "white" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditEvent(event);
                          }}
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
          )}
        </CardContent>
      </Card>

      {/* Events List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.isArray(filteredEvents) && filteredEvents.length > 0 ? (
              filteredEvents.map((event: EventWithDetails) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: event.color }}
                    />
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(event.startDate), "MMM d, yyyy 'at' h:mm a")}
                        {event.location && ` • ${event.location}`}
                      </p>
                      {event.description && (
                        <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{getEventTypeLabel(event.type)}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditEvent(event)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteEventMutation.mutate(event.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No events scheduled for this period</p>
                <p className="text-sm">Click "Add Event" to create your first event</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}