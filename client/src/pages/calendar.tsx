import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Calendar as CalendarIcon, Clock, Users, BookOpen, 
  GraduationCap, ChevronLeft, ChevronRight, Download, Filter
} from "lucide-react";
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, 
  addWeeks, subWeeks, addMonths, subMonths, addDays, isToday, startOfYear, endOfYear, addYears, subYears
} from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { Timetable } from "@shared/schema";

export default function CalendarPage() {
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState("Grade 6");
  const [selectedSection, setSelectedSection] = useState("A");
  const [viewMode, setViewMode] = useState<"weekly" | "monthly" | "yearly">("monthly");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const classes = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"];
  const sections = ["A", "B", "C"];
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const { data: timetableEntries } = useQuery({
    queryKey: ["/api/timetable"],
  });

  const { data: periods } = useQuery({
    queryKey: ["/api/periods"],
  });

  // Filter timetable entries based on selected class and section
  const filteredEntries = (timetableEntries || []).filter(
    (entry: Timetable) => entry.class === selectedClass && entry.section === selectedSection
  );

  // Generate calendar dates based on view mode
  const getCalendarDates = () => {
    switch (viewMode) {
      case "weekly":
        const startOfWeekDate = startOfWeek(currentDate, { weekStartsOn: 1 });
        const endOfWeekDate = endOfWeek(currentDate, { weekStartsOn: 1 });
        return eachDayOfInterval({ start: startOfWeekDate, end: endOfWeekDate });
      
      case "monthly":
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
        const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
        return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
      
      case "yearly":
        const yearStart = startOfYear(new Date(selectedYear, 0, 1));
        const yearEnd = endOfYear(new Date(selectedYear, 11, 31));
        return eachDayOfInterval({ start: yearStart, end: yearEnd });
      
      default:
        return [];
    }
  };

  const calendarDates = getCalendarDates();

  // Navigation handlers
  const handlePreviousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const handlePreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handlePreviousYear = () => setSelectedYear(selectedYear - 1);
  const handleNextYear = () => setSelectedYear(selectedYear + 1);

  const getEventsForDate = (date: Date) => {
    const dayName = format(date, "EEEE");
    return filteredEntries.filter((entry: Timetable) => entry.dayOfWeek === dayName);
  };

  const exportCalendar = () => {
    toast({
      title: "Export Started",
      description: "Calendar is being exported to PDF...",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <CalendarIcon className="h-10 w-10 text-blue-600" />
            Academic Calendar
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            View and manage academic schedules and events
          </p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Class</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Section</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section} value={section}>{section}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">View Mode</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Select value={viewMode} onValueChange={(value: "weekly" | "monthly" | "yearly") => setViewMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Button 
                onClick={exportCalendar}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={
                    viewMode === "weekly" ? handlePreviousWeek :
                    viewMode === "monthly" ? handlePreviousMonth : handlePreviousYear
                  }
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {viewMode === "weekly" && format(currentDate, "MMMM dd, yyyy")}
                  {viewMode === "monthly" && format(currentDate, "MMMM yyyy")}
                  {viewMode === "yearly" && selectedYear}
                </h2>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={
                    viewMode === "weekly" ? handleNextWeek :
                    viewMode === "monthly" ? handleNextMonth : handleNextYear
                  }
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentDate(new Date());
                  setSelectedYear(new Date().getFullYear());
                }}
              >
                Today
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Calendar Grid */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
          <CardContent className="p-6">
            {viewMode === "monthly" && (
              <div className="grid grid-cols-7 gap-1 mb-4">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <div key={day} className="p-2 text-center font-medium text-gray-700 dark:text-gray-300">
                    {day}
                  </div>
                ))}
              </div>
            )}
            
            <div className={`grid gap-2 ${
              viewMode === "weekly" ? "grid-cols-7" : 
              viewMode === "monthly" ? "grid-cols-7" : "grid-cols-12"
            }`}>
              {calendarDates.map((date, index) => {
                const events = getEventsForDate(date);
                const isCurrentMonth = format(date, "MM") === format(currentDate, "MM");
                
                return (
                  <div
                    key={index}
                    className={`p-2 min-h-[80px] border border-gray-200 dark:border-gray-700 rounded-lg ${
                      isToday(date) ? "bg-blue-100 dark:bg-blue-900/30" : "bg-gray-50 dark:bg-gray-700/30"
                    } ${!isCurrentMonth && viewMode === "monthly" ? "opacity-50" : ""}`}
                  >
                    <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      {format(date, "d")}
                    </div>
                    <div className="space-y-1">
                      {events.slice(0, 3).map((event: Timetable, idx: number) => (
                        <div
                          key={idx}
                          className="text-xs p-1 rounded bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 truncate"
                        >
                          {event.subject}
                        </div>
                      ))}
                      {events.length > 3 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          +{events.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}