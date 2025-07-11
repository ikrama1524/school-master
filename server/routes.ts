import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertStudentSchema, insertTeacherSchema, insertNoticeSchema, insertCalendarEventSchema, insertPeriodSchema } from "@shared/schema";
import { z } from "zod";
import { authenticateToken, generateToken, hashPassword, comparePassword, AuthenticatedRequest } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, name, email, role } = req.body;

      if (!username || !password || !name) {
        return res.status(400).json({ message: "Username, password, and name are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const newUser = await storage.createUser({
        username,
        password: hashedPassword,
        name,
        email: email || null,
        role: role || "student",
      });

      // Generate token
      const token = generateToken(newUser.id, newUser.username, newUser.email || '', newUser.role);

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check password
      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({ message: "Account is disabled" });
      }

      // Update last login
      await storage.updateUserLastLogin(user.id);

      // Generate token
      const token = generateToken(user.id, user.username, user.email || '', user.role);

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", authenticateToken, (req, res) => {
    // In a real application, you might want to blacklist the token
    res.json({ message: "Logout successful" });
  });

  // In-memory storage for admissions (temporary until proper database implementation)
  const admissionsStore = new Map();
  
  // Initialize with some sample applications
  const sampleApplications = [
    {
      id: 1,
      applicationNumber: "ADM001",
      studentName: "Alice Johnson",
      dateOfBirth: "2010-03-15",
      parentName: "Robert Johnson",
      email: "robert.johnson@email.com",
      phone: "+1234567890",
      address: "123 Main Street, City",
      previousSchool: "ABC Elementary",
      class: "Grade 6",
      section: "A",
      gender: "female",
      status: "pending",
      applicationDate: new Date("2024-01-15"),
      documents: [
        { id: "1", name: "Birth Certificate", type: "pdf", status: "verified", uploadDate: new Date(), size: "2.1 MB" },
        { id: "2", name: "Previous School Records", type: "pdf", status: "pending", uploadDate: new Date(), size: "1.8 MB" }
      ],
      priority: "normal"
    },
    {
      id: 2,
      applicationNumber: "ADM002",
      studentName: "Michael Chen",
      dateOfBirth: "2009-07-22",
      parentName: "David Chen",
      email: "david.chen@email.com",
      phone: "+1234567891",
      address: "456 Oak Avenue, City",
      previousSchool: "XYZ School",
      class: "Grade 7",
      section: "B",
      gender: "male",
      status: "document_review",
      applicationDate: new Date("2024-01-20"),
      documents: [
        { id: "3", name: "Birth Certificate", type: "pdf", status: "verified", uploadDate: new Date(), size: "2.3 MB" },
        { id: "4", name: "Medical Records", type: "pdf", status: "rejected", uploadDate: new Date(), size: "1.5 MB" }
      ],
      priority: "high"
    }
  ];
  
  // Initialize store with sample data
  sampleApplications.forEach(app => admissionsStore.set(app.id, app));

  // Admissions routes (replaces direct student creation)
  app.post("/api/admissions", async (req, res) => {
    try {
      const applicationData = req.body;
      // Generate application number and ID
      const applicationNumber = `ADM${Date.now().toString().slice(-6)}`;
      const id = Date.now();
      
      const admission = {
        id,
        ...applicationData,
        applicationNumber,
        status: "pending",
        applicationDate: new Date(),
        documents: applicationData.documents || [
          { id: `${id}_1`, name: "Birth Certificate", type: "pdf", status: "pending", uploadDate: new Date(), size: "0 MB" },
          { id: `${id}_2`, name: "Previous School Records", type: "pdf", status: "pending", uploadDate: new Date(), size: "0 MB" }
        ],
        priority: applicationData.priority || "normal"
      };
      
      // Store admission application
      admissionsStore.set(id, admission);
      res.status(201).json(admission);
    } catch (error) {
      console.error("Error creating admission:", error);
      res.status(500).json({ message: "Failed to create admission application" });
    }
  });

  app.get("/api/admissions", async (req, res) => {
    try {
      const admissions = Array.from(admissionsStore.values());
      res.json(admissions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admissions" });
    }
  });

  app.post("/api/admissions/:id/approve", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Get the admission application from storage
      const admission = admissionsStore.get(id);
      if (!admission) {
        return res.status(404).json({ message: "Admission application not found" });
      }
      
      // Create student from the actual admission data
      const studentData = {
        name: admission.studentName,
        rollNumber: `2025${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        class: admission.class,
        section: admission.section || "A",
        dateOfBirth: new Date(admission.dateOfBirth),
        gender: admission.gender || "male",
        parentName: admission.parentName,
        parentPhone: admission.phone,
        email: admission.email,
        address: admission.address,
        previousSchool: admission.previousSchool || null,
        admissionDate: new Date()
      };

      const student = await storage.createStudent(studentData);
      
      // Update admission status to approved
      admission.status = "approved";
      admission.approvedDate = new Date();
      admissionsStore.set(id, admission);
      
      res.json({ message: "Application approved and student created", student, admission });
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
  app.get("/api/subjects", authenticateToken, async (req: AuthenticatedRequest, res) => {
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



  // Calendar routes
  app.get("/api/calendar", async (req, res) => {
    try {
      const events = await storage.getCalendarEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch calendar events" });
    }
  });

  app.post("/api/calendar", async (req, res) => {
    try {
      const validatedData = insertCalendarEventSchema.parse(req.body);
      const event = await storage.createCalendarEvent(validatedData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create calendar event" });
    }
  });

  app.put("/api/calendar/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.updateCalendarEvent(id, req.body);
      if (!event) {
        return res.status(404).json({ message: "Calendar event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to update calendar event" });
    }
  });

  app.delete("/api/calendar/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCalendarEvent(id);
      if (!deleted) {
        return res.status(404).json({ message: "Calendar event not found" });
      }
      res.status(204).send();
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

  // Period management routes
  app.get("/api/periods", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const periods = await storage.getPeriods();
      res.json(periods);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch periods" });
    }
  });

  app.post("/api/periods", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = insertPeriodSchema.parse(req.body);
      const period = await storage.createPeriod(validatedData);
      res.status(201).json(period);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create period" });
    }
  });

  app.put("/api/periods/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const period = await storage.updatePeriod(id, req.body);
      if (!period) {
        return res.status(404).json({ message: "Period not found" });
      }
      res.json(period);
    } catch (error) {
      res.status(500).json({ message: "Failed to update period" });
    }
  });

  app.delete("/api/periods/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePeriod(id);
      if (!deleted) {
        return res.status(404).json({ message: "Period not found" });
      }
      res.json({ message: "Period deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete period" });
    }
  });

  // Results routes
  app.get("/api/results", async (req, res) => {
    try {
      const results = await storage.getResults();
      res.json(results);
    } catch (error) {
      console.error("Error fetching results:", error);
      res.status(500).json({ message: "Failed to fetch results" });
    }
  });

  app.post("/api/results", async (req, res) => {
    try {
      const resultData = {
        ...req.body,
        examDate: req.body.examDate ? new Date(req.body.examDate) : new Date()
      };
      const result = await storage.createResult(resultData);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error creating result:", error);
      res.status(500).json({ message: "Failed to create result" });
    }
  });

  app.get("/api/results/:id", async (req, res) => {
    try {
      const result = await storage.getResult(parseInt(req.params.id));
      if (!result) {
        return res.status(404).json({ message: "Result not found" });
      }
      res.json(result);
    } catch (error) {
      console.error("Error fetching result:", error);
      res.status(500).json({ message: "Failed to fetch result" });
    }
  });

  // Exams routes
  app.get("/api/exams", async (req, res) => {
    try {
      const exams = await storage.getExams();
      res.json(exams);
    } catch (error) {
      console.error("Error fetching exams:", error);
      res.status(500).json({ message: "Failed to fetch exams" });
    }
  });

  app.post("/api/exams", async (req, res) => {
    try {
      const examData = {
        ...req.body,
        startDate: req.body.startDate ? new Date(req.body.startDate) : new Date(),
        endDate: req.body.endDate ? new Date(req.body.endDate) : new Date()
      };
      const exam = await storage.createExam(examData);
      res.status(201).json(exam);
    } catch (error) {
      console.error("Error creating exam:", error);
      res.status(500).json({ message: "Failed to create exam" });
    }
  });

  // Semesters routes
  app.get("/api/semesters", async (req, res) => {
    try {
      const semesters = await storage.getSemesters();
      res.json(semesters);
    } catch (error) {
      console.error("Error fetching semesters:", error);
      res.status(500).json({ message: "Failed to fetch semesters" });
    }
  });

  app.post("/api/semesters", async (req, res) => {
    try {
      const semesterData = {
        ...req.body,
        startDate: req.body.startDate ? new Date(req.body.startDate) : new Date(),
        endDate: req.body.endDate ? new Date(req.body.endDate) : new Date()
      };
      const semester = await storage.createSemester(semesterData);
      res.status(201).json(semester);
    } catch (error) {
      console.error("Error creating semester:", error);
      res.status(500).json({ message: "Failed to create semester" });
    }
  });

  app.get("/api/semesters/active", async (req, res) => {
    try {
      const semester = await storage.getActiveSemester();
      res.json(semester);
    } catch (error) {
      console.error("Error fetching active semester:", error);
      res.status(500).json({ message: "Failed to fetch active semester" });
    }
  });

  app.put("/api/semesters/:id", async (req, res) => {
    try {
      const semester = await storage.updateSemester(parseInt(req.params.id), req.body);
      if (!semester) {
        return res.status(404).json({ message: "Semester not found" });
      }
      res.json(semester);
    } catch (error) {
      console.error("Error updating semester:", error);
      res.status(500).json({ message: "Failed to update semester" });
    }
  });

  // Semester Results routes
  app.get("/api/semester-results", async (req, res) => {
    try {
      const { studentId, semesterId } = req.query;
      let results;
      
      if (studentId) {
        results = await storage.getStudentSemesterResults(
          parseInt(studentId as string), 
          semesterId ? parseInt(semesterId as string) : undefined
        );
      } else if (semesterId) {
        results = await storage.getSemesterResultsBySemester(parseInt(semesterId as string));
      } else {
        results = await storage.getSemesterResults();
      }
      
      res.json(results);
    } catch (error) {
      console.error("Error fetching semester results:", error);
      res.status(500).json({ message: "Failed to fetch semester results" });
    }
  });

  app.post("/api/semester-results", async (req, res) => {
    try {
      const result = await storage.createSemesterResult(req.body);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error creating semester result:", error);
      res.status(500).json({ message: "Failed to create semester result" });
    }
  });

  app.get("/api/semester-results/:id", async (req, res) => {
    try {
      const result = await storage.getSemesterResult(parseInt(req.params.id));
      if (!result) {
        return res.status(404).json({ message: "Semester result not found" });
      }
      res.json(result);
    } catch (error) {
      console.error("Error fetching semester result:", error);
      res.status(500).json({ message: "Failed to fetch semester result" });
    }
  });

  app.put("/api/semester-results/:id", async (req, res) => {
    try {
      const result = await storage.updateSemesterResult(parseInt(req.params.id), req.body);
      if (!result) {
        return res.status(404).json({ message: "Semester result not found" });
      }
      res.json(result);
    } catch (error) {
      console.error("Error updating semester result:", error);
      res.status(500).json({ message: "Failed to update semester result" });
    }
  });

  // Document Management Routes
  app.get("/api/documents", async (req, res) => {
    try {
      const documents = await storage.getDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });

  app.post("/api/documents", async (req, res) => {
    try {
      const document = await storage.createDocument(req.body);
      res.status(201).json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  app.put("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.updateDocument(id, req.body);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      console.error("Error updating document:", error);
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteDocument(id);
      if (!deleted) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  app.post("/api/documents/:id/approve", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const document = await storage.updateDocument(id, {
        status: "approved",
        issuedBy: 1, // Default admin user
        issuedDate: new Date(),
        remarks: req.body.remarks || null
      });
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json(document);
    } catch (error) {
      console.error("Error approving document:", error);
      res.status(500).json({ message: "Failed to approve document" });
    }
  });

  app.post("/api/documents/:id/reject", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const document = await storage.updateDocument(id, {
        status: "rejected",
        issuedBy: 1, // Default admin user
        issuedDate: new Date(),
        remarks: req.body.remarks || "Document rejected"
      });
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json(document);
    } catch (error) {
      console.error("Error rejecting document:", error);
      res.status(500).json({ message: "Failed to reject document" });
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

  // User Management Routes (Super Admin only)
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const { password, ...userData } = req.body;
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({ ...userData, password: hashedPassword });
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      let updateData = { ...req.body };
      
      // Hash password if provided
      if (updateData.password) {
        updateData.password = await hashPassword(updateData.password);
      } else {
        delete updateData.password; // Don't update password if not provided
      }
      
      const user = await storage.updateUser(id, updateData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
