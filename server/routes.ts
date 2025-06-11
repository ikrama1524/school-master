import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertStudentSchema, insertTeacherSchema, insertNoticeSchema, insertTimetableSchema, insertCalendarEventSchema } from "@shared/schema";
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

  // Calendar routes
  app.get("/api/calendar", async (req, res) => {
    try {
      const { month } = req.query;
      // Mock calendar events
      const mockEvents = [
        {
          id: 1,
          title: "Math Exam - Grade 6",
          description: "Monthly assessment for mathematics",
          startDate: new Date("2024-12-15T09:00:00"),
          endDate: new Date("2024-12-15T11:00:00"),
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
          id: 2,
          title: "Winter Holiday",
          description: "School closed for winter break",
          startDate: new Date("2024-12-25T00:00:00"),
          endDate: new Date("2024-12-31T23:59:59"),
          type: "holiday",
          class: null,
          subjectId: null,
          teacherId: null,
          location: null,
          color: "#10b981",
          isAllDay: true,
          createdAt: new Date()
        },
        {
          id: 3,
          title: "Parent-Teacher Meeting",
          description: "Quarterly parent-teacher conference",
          startDate: new Date("2024-12-20T14:00:00"),
          endDate: new Date("2024-12-20T17:00:00"),
          type: "meeting",
          class: null,
          subjectId: null,
          teacherId: null,
          location: "Auditorium",
          color: "#f59e0b",
          isAllDay: false,
          createdAt: new Date()
        }
      ];
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
