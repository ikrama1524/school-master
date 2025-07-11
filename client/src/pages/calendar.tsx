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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  CalendarIcon, Plus, Edit, Trash2, Clock, Users, BookOpen, 
  ChevronLeft, ChevronRight, Download, Filter, Search, MapPin,
  GraduationCap, AlertCircle, Bell, Eye, MoreHorizontal
} from "lucide-react";
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday
} from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { CalendarEvent } from "@shared/schema";

interface EventFormData {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  type: string;
  class: string;
}

function EventForm({ isOpen, onClose, event }: { isOpen: boolean; onClose: () => void; event?: CalendarEvent | null }) {
  const [formData, setFormData] = useState<EventFormData>({
    title: event?.title || '',
    description: event?.description || '',
    startDate: event?.startDate ? new Date(event.startDate) : new Date(),
    endDate: event?.endDate ? new Date(event.endDate) : new Date(),
    type: event?.type || 'event',
    class: event?.class || 'All Classes'
  });

  const { toast } = useToast();

  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      return await apiRequest(event ? "PUT" : "POST", 
        event ? `/api/calendar/${event.id}` : "/api/calendar", 
        data
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar"] });
      toast({
        title: event ? "Event Updated" : "Event Created",
        description: `Event has been ${event ? "updated" : "created"} successfully.`,
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to ${event ? "update" : "create"} event. Please try again.`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEventMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{event ? "Edit Event" : "Create New Event"}</DialogTitle>
          <DialogDescription>
            {event ? "Update the event details below." : "Add a new event to the calendar."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter event title"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter event description"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={format(formData.startDate, "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: new Date(e.target.value) }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={format(formData.endDate, "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: new Date(e.target.value) }))}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Event Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="class">Class</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="holiday">Holiday</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="class">Class</Label>
              <Select value={formData.class} onValueChange={(value) => setFormData(prev => ({ ...prev, class: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Classes">All Classes</SelectItem>
                  <SelectItem value="Grade 1">Grade 1</SelectItem>
                  <SelectItem value="Grade 2">Grade 2</SelectItem>
                  <SelectItem value="Grade 3">Grade 3</SelectItem>
                  <SelectItem value="Grade 4">Grade 4</SelectItem>
                  <SelectItem value="Grade 5">Grade 5</SelectItem>
                  <SelectItem value="Grade 6">Grade 6</SelectItem>
                  <SelectItem value="Grade 7">Grade 7</SelectItem>
                  <SelectItem value="Grade 8">Grade 8</SelectItem>
                  <SelectItem value="Grade 9">Grade 9</SelectItem>
                  <SelectItem value="Grade 10">Grade 10</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createEventMutation.isPending}>
              {createEventMutation.isPending ? "Saving..." : event ? "Update Event" : "Create Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { toast } = useToast();

  const { data: events = [], isLoading } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/calendar"],
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/calendar/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar"] });
      toast({
        title: "Event Deleted",
        description: "Event has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = eventTypeFilter === "all" || event.type === eventTypeFilter;
    return matchesSearch && matchesType;
  });

  const eventsForSelectedDate = filteredEvents.filter(event => {
    const eventDate = new Date(event.startDate);
    return isSameDay(eventDate, selectedDate);
  });

  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.startDate);
      return isSameDay(eventDate, date);
    });
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const handleDeleteEvent = (id: number) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      deleteEventMutation.mutate(id);
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'class': return 'bg-blue-100 text-blue-800';
      case 'exam': return 'bg-red-100 text-red-800';
      case 'event': return 'bg-green-100 text-green-800';
      case 'holiday': return 'bg-yellow-100 text-yellow-800';
      case 'meeting': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'class': return BookOpen;
      case 'exam': return AlertCircle;
      case 'event': return Calendar;
      case 'holiday': return Bell;
      case 'meeting': return Users;
      default: return CalendarIcon;
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading calendar...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--edu-text)]">Calendar</h1>
          <p className="text-gray-600">Manage school events and schedules</p>
        </div>
        <Button 
          onClick={() => {
            setSelectedEvent(null);
            setIsEventModalOpen(true);
          }}
          className="bg-[var(--edu-primary)] hover:bg-[var(--edu-primary)]/90 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Calendar View</CardTitle>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="font-medium">
                  {format(currentMonth, "MMMM yyyy")}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="rounded-md border"
              modifiers={{
                hasEvents: (date) => getEventsForDate(date).length > 0,
                today: isToday,
              }}
              modifiersStyles={{
                hasEvents: { 
                  backgroundColor: 'var(--edu-primary)', 
                  color: 'white',
                  fontWeight: 'bold'
                },
                today: {
                  backgroundColor: 'var(--edu-secondary)',
                  color: 'white'
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Event Details */}
        <Card>
          <CardHeader>
            <CardTitle>
              Events for {format(selectedDate, "MMM d, yyyy")}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-sm"
              />
            </div>
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="class">Classes</SelectItem>
                <SelectItem value="exam">Exams</SelectItem>
                <SelectItem value="event">Events</SelectItem>
                <SelectItem value="holiday">Holidays</SelectItem>
                <SelectItem value="meeting">Meetings</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {eventsForSelectedDate.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No events for this date
                </p>
              ) : (
                eventsForSelectedDate.map((event) => {
                  const IconComponent = getEventTypeIcon(event.type);
                  return (
                    <div
                      key={event.id}
                      className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <IconComponent className="h-5 w-5 mt-0.5 text-[var(--edu-primary)]" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-sm">{event.title}</h3>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditEvent(event)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteEvent(event.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{event.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge className={getEventTypeColor(event.type)}>
                            {event.type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {event.class}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {format(new Date(event.startDate), "HH:mm")} - {format(new Date(event.endDate), "HH:mm")}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <EventForm
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
      />
    </div>
  );
}