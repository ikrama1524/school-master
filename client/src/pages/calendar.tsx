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
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { CalendarEvent, Subject, Teacher } from "@shared/schema";

interface EventWithDetails extends CalendarEvent {
  subject?: Subject;
  teacher?: Teacher;
}

export default function CalendarPage() {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventWithDetails | null>(null);
  const [filterType, setFilterType] = useState("all");

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
    queryFn: () => apiRequest("GET", `/api/calendar?month=${format(currentDate, "yyyy-MM")}`),
  });

  // Fetch subjects and teachers
  const { data: subjects = [] } = useQuery({
    queryKey: ["/api/subjects"],
    queryFn: () => apiRequest("GET", "/api/subjects"),
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ["/api/teachers"],
    queryFn: () => apiRequest("GET", "/api/teachers"),
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
    return events.filter((event: EventWithDetails) => 
      isSameDay(new Date(event.startDate), date) ||
      (new Date(event.startDate) <= date && new Date(event.endDate) >= date)
    );
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
                        {subjects.map((subject: Subject) => (
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
                      {teachers.map((teacher: Teacher) => (
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
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-xl font-semibold min-w-48 text-center">
                  {format(currentDate, "MMMM yyyy")}
                </h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
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
              Monthly Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="p-2 text-center font-semibold text-sm text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date) => {
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