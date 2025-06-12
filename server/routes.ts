import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertStudentSchema, insertTeacherSchema, insertNoticeSchema, insertTimetableSchema, insertCalendarEventSchema, insertPeriodSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Admissions routes (replaces direct student creation)
  app.post("/api/admissions", async (req, res) => {
    try {
      const applicationData = req.body;
      // Generate application number
      const applicationNumber = `ADM${Date.now().toString().slice(-6)}`;
      
      const admission = {
        ...applicationData,
        applicationNumber,
        status: "pending",
        applicationDate: new Date(),
      };
      
      // Store admission application (would be in database in real app)
      res.status(201).json(admission);
    } catch (error) {
      res.status(500).json({ message: "Failed to create admission application" });
    }
  });

  app.post("/api/admissions/:id/approve", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Create student from admission data with all required fields
      const studentData = {
        name: "Emma Wilson", // From mock admission data
        rollNumber: `2025${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        class: "Grade 6",
        section: "A",
        dateOfBirth: new Date("2010-05-15"),
        gender: "female",
        parentName: "David Wilson",
        parentPhone: "+1234567890",
        email: "david.wilson@email.com",
        address: "123 Oak Street, City"
      };

      const student = await storage.createStudent(studentData);
      res.json({ message: "Application approved and student created", student });
    } catch (error) {
      console.error("Error approving admission:", error);
      res.status(500).json({ message: "Failed to approve admission" });
    }
  });

  // Students routes (now read-only, created through admissions)
  app.get("/api/students", async (req, res) => {
    try {
      const students = await storage.getStudents();
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.get("/api/students/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const student = await storage.getStudent(id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.json(student);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch student" });
    }
  });

  // Direct student creation removed - students are now created through admissions approval

  app.put("/api/students/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const student = await storage.updateStudent(id, req.body);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.json(student);
    } catch (error) {
      res.status(500).json({ message: "Failed to update student" });
    }
  });

  app.delete("/api/students/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteStudent(id);
      if (!deleted) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete student" });
    }
  });

  // Teachers routes
  app.get("/api/teachers", async (req, res) => {
    try {
      const teachers = await storage.getTeachers();
      res.json(teachers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch teachers" });
    }
  });

  app.get("/api/teachers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const teacher = await storage.getTeacher(id);
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      res.json(teacher);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch teacher" });
    }
  });

  app.post("/api/teachers", async (req, res) => {
    try {
      const validatedData = insertTeacherSchema.parse(req.body);
      const teacher = await storage.createTeacher(validatedData);
      res.status(201).json(teacher);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create teacher" });
    }
  });

  app.put("/api/teachers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const teacher = await storage.updateTeacher(id, req.body);
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      res.json(teacher);
    } catch (error) {
      res.status(500).json({ message: "Failed to update teacher" });
    }
  });

  app.delete("/api/teachers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTeacher(id);
      if (!deleted) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete teacher" });
    }
  });

  // Attendance routes
  app.get("/api/attendance", async (req, res) => {
    try {
      const date = req.query.date ? new Date(req.query.date as string) : undefined;
      const attendance = await storage.getAttendance(date);
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  app.get("/api/attendance/student/:studentId", async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId);
      const attendance = await storage.getStudentAttendance(studentId);
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch student attendance" });
    }
  });

  // Fees routes
  app.get("/api/fees", async (req, res) => {
    try {
      const fees = await storage.getFees();
      res.json(fees);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch fees" });
    }
  });

  app.get("/api/fees/student/:studentId", async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId);
      const fees = await storage.getStudentFees(studentId);
      res.json(fees);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch student fees" });
    }
  });

  // Notices routes
  app.get("/api/notices", async (req, res) => {
    try {
      const notices = await storage.getNotices();
      res.json(notices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notices" });
    }
  });

  app.post("/api/notices", async (req, res) => {
    try {
      const validatedData = insertNoticeSchema.parse(req.body);
      const notice = await storage.createNotice(validatedData);
      res.status(201).json(notice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create notice" });
    }
  });

  // Subjects routes
  app.get("/api/subjects", async (req, res) => {
    try {
      // Mock subjects data with teacher assignments
      const mockSubjects = [
        { id: 1, name: "Mathematics", code: "MATH", description: "Advanced Mathematics", teacherId: 1, class: "Grade 6", createdAt: new Date() },
        { id: 2, name: "English", code: "ENG", description: "English Language & Literature", teacherId: 2, class: "Grade 6", createdAt: new Date() },
        { id: 3, name: "Science", code: "SCI", description: "General Science", teacherId: 3, class: "Grade 6", createdAt: new Date() },
        { id: 4, name: "Social Studies", code: "SS", description: "History & Geography", teacherId: 4, class: "Grade 6", createdAt: new Date() },
        { id: 5, name: "Computer Science", code: "CS", description: "Basic Computing", teacherId: 5, class: "Grade 6", createdAt: new Date() },
      ];
      res.json(mockSubjects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  // Timetable routes
  app.get("/api/timetable", async (req, res) => {
    try {
      const { class: className, section } = req.query;
      // Mock timetable data
      const mockTimetable = [
        {
          id: 1,
          class: className || "Grade 6",
          section: section || "A",
          day: "monday",
          period: 1,
          startTime: "09:00",
          endTime: "09:45",
          subjectId: 1,
          teacherId: 1,
          room: "Room 101",
          isActive: true,
          createdAt: new Date(),
          subject: { id: 1, name: "Mathematics", code: "MATH" },
          teacher: { id: 1, name: "Dr. Maria Rodriguez", subject: "Mathematics" }
        },
        {
          id: 2,
          class: className || "Grade 6",
          section: section || "A",
          day: "monday",
          period: 2,
          startTime: "09:45",
          endTime: "10:30",
          subjectId: 2,
          teacherId: 2,
          room: "Room 102",
          isActive: true,
          createdAt: new Date(),
          subject: { id: 2, name: "English", code: "ENG" },
          teacher: { id: 2, name: "Prof. James Wilson", subject: "English" }
        },
        {
          id: 3,
          class: className || "Grade 6",
          section: section || "A",
          day: "tuesday",
          period: 1,
          startTime: "09:00",
          endTime: "09:45",
          subjectId: 3,
          teacherId: 3,
          room: "Lab A",
          isActive: true,
          createdAt: new Date(),
          subject: { id: 3, name: "Science", code: "SCI" },
          teacher: { id: 3, name: "Dr. Sarah Chen", subject: "Science" }
        }
      ];
      res.json(mockTimetable);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch timetable" });
    }
  });

  app.post("/api/timetable", async (req, res) => {
    try {
      // Mock creation response
      const newEntry = {
        id: Math.floor(Math.random() * 1000),
        ...req.body,
        isActive: true,
        createdAt: new Date(),
      };
      res.status(201).json(newEntry);
    } catch (error) {
      res.status(500).json({ message: "Failed to create timetable entry" });
    }
  });

  app.put("/api/timetable/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedEntry = { id, ...req.body, updatedAt: new Date() };
      res.json(updatedEntry);
    } catch (error) {
      res.status(500).json({ message: "Failed to update timetable entry" });
    }
  });

  app.delete("/api/timetable/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      res.json({ message: "Timetable entry deleted", id });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete timetable entry" });
    }
  });

  app.post("/api/timetable/bulk", async (req, res) => {
    try {
      const { entries } = req.body;
      
      // Mock bulk save - in real app, save multiple timetable entries
      const savedEntries = entries.map((entry: any, index: number) => ({
        id: Math.floor(Math.random() * 1000) + index,
        ...entry,
        createdAt: new Date()
      }));

      res.status(201).json(savedEntries);
    } catch (error) {
      res.status(500).json({ message: "Failed to save timetable entries" });
    }
  });

  // Calendar routes
  app.get("/api/calendar", async (req, res) => {
    try {
      const { month } = req.query;
      const currentDate = new Date();
      
      // Generate comprehensive weekly subject schedule
      const mockEvents = [];
      let eventId = 1;
      
      // Daily subject schedules for the current week
      const subjects = [
        { id: 1, name: "Mathematics", teacherId: 1, teacherName: "Dr. Maria Rodriguez", color: "#3b82f6" },
        { id: 2, name: "English", teacherId: 2, teacherName: "Prof. James Wilson", color: "#10b981" },
        { id: 3, name: "Science", teacherId: 3, teacherName: "Dr. Sarah Chen", color: "#f59e0b" },
        { id: 4, name: "Social Studies", teacherId: 4, teacherName: "Ms. Emily Davis", color: "#ef4444" },
        { id: 5, name: "Computer Science", teacherId: 5, teacherName: "Mr. Robert Kim", color: "#8b5cf6" },
        { id: 6, name: "Physical Education", teacherId: 6, teacherName: "Coach Mike Johnson", color: "#06b6d4" },
      ];
      
      // Generate events for the next 30 days
      for (let day = 0; day < 30; day++) {
        const date = new Date(currentDate);
        date.setDate(date.getDate() + day);
        
        // Skip weekends for regular classes
        if (date.getDay() === 0 || date.getDay() === 6) {
          continue;
        }
        
        // Morning Assembly (All-day event)
        mockEvents.push({
          id: eventId++,
          title: "Morning Assembly",
          description: "Daily morning assembly for all students",
          startDate: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 8, 0),
          endDate: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 8, 30),
          type: "class",
          class: "All Classes",
          subjectId: null,
          teacherId: null,
          location: "Main Hall",
          color: "#6b7280",
          isAllDay: false,
          createdAt: new Date()
        });
        
        // Generate subject periods for each day
        const dailySubjects = subjects.slice(0, 6); // 6 periods per day
        const startHour = 9;
        
        dailySubjects.forEach((subject, index) => {
          const periodStart = startHour + index;
          const periodEnd = periodStart + 1;
          
          // Skip lunch break (12-1 PM)
          const adjustedStart = periodStart >= 12 ? periodStart + 1 : periodStart;
          const adjustedEnd = adjustedStart + 1;
          
          mockEvents.push({
            id: eventId++,
            title: `${subject.name} - Grade 6A`,
            description: `${subject.name} class for Grade 6 Section A`,
            startDate: new Date(date.getFullYear(), date.getMonth(), date.getDate(), adjustedStart, 0),
            endDate: new Date(date.getFullYear(), date.getMonth(), date.getDate(), adjustedEnd, 0),
            type: "class",
            class: "Grade 6",
            subjectId: subject.id,
            teacherId: subject.teacherId,
            location: `Room ${101 + index}`,
            color: subject.color,
            isAllDay: false,
            createdAt: new Date(),
            subject: { id: subject.id, name: subject.name, code: subject.name.substring(0, 3).toUpperCase() },
            teacher: { id: subject.teacherId, name: subject.teacherName }
          });
        });
        
        // Lunch Break
        mockEvents.push({
          id: eventId++,
          title: "Lunch Break",
          description: "Lunch break for all students and staff",
          startDate: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0),
          endDate: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 13, 0),
          type: "event",
          class: "All Classes",
          subjectId: null,
          teacherId: null,
          location: "Cafeteria",
          color: "#f97316",
          isAllDay: false,
          createdAt: new Date()
        });
      }
      
      // Add special events
      mockEvents.push(
        {
          id: eventId++,
          title: "Math Exam - Grade 6",
          description: "Monthly assessment for mathematics",
          startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7, 9, 0),
          endDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7, 11, 0),
          type: "exam",
          class: "Grade 6",
          subjectId: 1,
          teacherId: 1,
          location: "Exam Hall",
          color: "#ef4444",
          isAllDay: false,
          createdAt: new Date(),
          subject: { id: 1, name: "Mathematics", code: "MATH" },
          teacher: { id: 1, name: "Dr. Maria Rodriguez" }
        },
        {
          id: eventId++,
          title: "Parent-Teacher Meeting",
          description: "Quarterly parent-teacher conference",
          startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 14, 14, 0),
          endDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 14, 17, 0),
          type: "meeting",
          class: null,
          subjectId: null,
          teacherId: null,
          location: "Auditorium",
          color: "#f59e0b",
          isAllDay: false,
          createdAt: new Date()
        }
      );
      
      res.json(mockEvents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch calendar events" });
    }
  });

  app.post("/api/calendar", async (req, res) => {
    try {
      const newEvent = {
        id: Math.floor(Math.random() * 1000),
        ...req.body,
        createdAt: new Date(),
      };
      res.status(201).json(newEvent);
    } catch (error) {
      res.status(500).json({ message: "Failed to create calendar event" });
    }
  });

  app.put("/api/calendar/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedEvent = { id, ...req.body, updatedAt: new Date() };
      res.json(updatedEvent);
    } catch (error) {
      res.status(500).json({ message: "Failed to update calendar event" });
    }
  });

  app.delete("/api/calendar/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      res.json({ message: "Calendar event deleted", id });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete calendar event" });
    }
  });

  // Monthly Timetable routes
  app.get("/api/monthly-timetable/:class/:month", async (req, res) => {
    try {
      const { class: className, month } = req.params;
      // Mock response - return empty timetable for now
      const mockTimetable = {
        id: 1,
        class: className,
        month: month,
        timetableData: "{}",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      res.json(mockTimetable);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch monthly timetable" });
    }
  });

  app.post("/api/monthly-timetable", async (req, res) => {
    try {
      const { class: className, month, timetableData } = req.body;
      
      // Mock save - in real app, save to database
      const savedTimetable = {
        id: Math.floor(Math.random() * 1000),
        class: className,
        month: month,
        timetableData: JSON.stringify(timetableData),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      res.status(201).json(savedTimetable);
    } catch (error) {
      res.status(500).json({ message: "Failed to save monthly timetable" });
    }
  });

  app.put("/api/monthly-timetable/:id", async (req, res) => {
    try {
      const timetableId = parseInt(req.params.id);
      const { class: className, month, timetableData } = req.body;
      
      // Mock update - in real app, update in database
      const updatedTimetable = {
        id: timetableId,
        class: className,
        month: month,
        timetableData: JSON.stringify(timetableData),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      res.json(updatedTimetable);
    } catch (error) {
      res.status(500).json({ message: "Failed to update monthly timetable" });
    }
  });

  // Stats route
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // User authentication (simple mock)
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
