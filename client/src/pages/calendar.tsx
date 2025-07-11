import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, addMonths, subMonths, isToday, isSameMonth } from "date-fns";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  
  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Calendar</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            {format(currentDate, "MMMM yyyy")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => (
              <div
                key={day.toString()}
                className={`
                  p-2 text-center text-sm cursor-pointer hover:bg-muted rounded-md
                  ${!isSameMonth(day, currentDate) ? "text-muted-foreground" : ""}
                  ${isToday(day) ? "bg-primary text-primary-foreground font-bold" : ""}
                `}
              >
                {format(day, "d")}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No events scheduled</p>
            <p className="text-sm">Events and schedules will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}