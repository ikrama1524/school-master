import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertStudentSchema, insertTeacherSchema, insertNoticeSchema, insertTimetableSchema, insertCalendarEventSchema, insertPeriodSchema } from "@shared/schema";
import { z } from "zod";
import { authenticateToken, generateToken, hashPassword, comparePassword, AuthenticatedRequest } from "./auth";
import { registerRBACRoutes } from "./rbacRoutes";
import { createTestUsers } from "./testUsers";
import { createRBACDemoRoute } from "./rbacDemo";
import { registerMobileRoutes } from "./mobileRoutes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize test users for RBAC demonstration
  await createTestUsers();

  // Register RBAC routes with role-based access control
  registerRBACRoutes(app);
  
  // Create demo route to show RBAC system
  createRBACDemoRoute(app);

  // Register mobile-specific routes
  registerMobileRoutes(app);

  // Legacy Authentication Routes (keeping for compatibility)
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

  // Helper function to generate unique roll number
  const generateRollNumber = async (className: string, academicYear: string = "2025") => {
    const students = await storage.getStudents();
    const classStudents = students.filter(s => s.class === className);
    const nextNumber = classStudents.length + 1;
    return `${academicYear}${className.toUpperCase().padStart(2, '0')}${nextNumber.toString().padStart(3, '0')}`;
  };

  app.post("/api/admissions/:id/approve", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Get the admission application from storage
      const admission = admissionsStore.get(id);
      if (!admission) {
        return res.status(404).json({ message: "Admission application not found" });
      }
      
      // Generate unique roll number and admission number
      const rollNumber = await generateRollNumber(admission.class);
      const admissionNumber = admission.applicationNumber; // Use application number as admission number
      
      // Create student from the actual admission data following the workflow:
      // Admissions → Student → Division → Class
      const studentData = {
        name: admission.studentName,
        rollNumber: rollNumber,
        admissionNumber: admissionNumber,
        class: admission.class,
        section: admission.section || "A", 
        division: `${admission.class}-${admission.section || "A"}`, // Class-Section as division
        dateOfBirth: new Date(admission.dateOfBirth),
        gender: admission.gender || "male",
        parentName: admission.parentName,
        parentPhone: admission.phone,
        parentEmail: admission.email,
        email: admission.email,
        address: admission.address,
        previousSchool: admission.previousSchool || null,
        admissionDate: new Date()
      };

      const student = await storage.createStudent(studentData);
      
      // Update admission status to approved
      admission.status = "approved";
      admission.approvedDate = new Date();
      admission.studentId = student.id; // Link admission to student
      admissionsStore.set(id, admission);
      
      res.json({ 
        message: "Application approved and student created", 
        student, 
        admission,
        rollNumber: rollNumber,
        admissionNumber: admissionNumber
      });
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

  app.post("/api/fees", async (req, res) => {
    try {
      const feeData = {
        ...req.body,
        dueDate: new Date(req.body.dueDate),
        paidDate: req.body.paidDate ? new Date(req.body.paidDate) : null
      };
      const fee = await storage.createFee(feeData);
      res.status(201).json(fee);
    } catch (error) {
      console.error("Error creating fee:", error);
      res.status(500).json({ message: "Failed to create fee" });
    }
  });

  app.put("/api/fees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const fee = await storage.updateFee(id, req.body);
      if (!fee) {
        return res.status(404).json({ message: "Fee not found" });
      }
      res.json(fee);
    } catch (error) {
      console.error("Error updating fee:", error);
      res.status(500).json({ message: "Failed to update fee" });
    }
  });

  app.post("/api/fees/:id/pay", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { paymentMethod, remarks } = req.body;
      
      const fee = await storage.updateFee(id, {
        status: "paid",
        paidDate: new Date(),
        paymentMethod,
        remarks
      });
      
      if (!fee) {
        return res.status(404).json({ message: "Fee not found" });
      }
      
      res.json({ message: "Payment processed successfully", fee });
    } catch (error) {
      console.error("Error processing payment:", error);
      res.status(500).json({ message: "Failed to process payment" });
    }
  });

  app.post("/api/fees/bulk", async (req, res) => {
    try {
      const { studentIds, feeType, amount, dueDate } = req.body;
      const fees = [];
      
      for (const studentId of studentIds) {
        const fee = await storage.createFee({
          studentId,
          feeType,
          amount,
          dueDate: new Date(dueDate),
          status: "pending"
        });
        fees.push(fee);
      }
      
      res.status(201).json({ message: `${fees.length} fees created successfully`, fees });
    } catch (error) {
      console.error("Error creating bulk fees:", error);
      res.status(500).json({ message: "Failed to create bulk fees" });
    }
  });

  // Fee Structure routes
  app.get("/api/fee-structures", async (req, res) => {
    try {
      const structures = await storage.getFeeStructures();
      res.json(structures);
    } catch (error) {
      console.error("Error fetching fee structures:", error);
      res.status(500).json({ message: "Failed to fetch fee structures" });
    }
  });

  app.get("/api/fee-structures/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const structure = await storage.getFeeStructure(id);
      if (!structure) {
        return res.status(404).json({ message: "Fee structure not found" });
      }
      res.json(structure);
    } catch (error) {
      console.error("Error fetching fee structure:", error);
      res.status(500).json({ message: "Failed to fetch fee structure" });
    }
  });

  app.post("/api/fee-structures", async (req, res) => {
    try {
      const structure = await storage.createFeeStructure(req.body);
      res.status(201).json(structure);
    } catch (error) {
      console.error("Error creating fee structure:", error);
      res.status(500).json({ message: "Failed to create fee structure" });
    }
  });

  app.put("/api/fee-structures/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const structure = await storage.updateFeeStructure(id, req.body);
      if (!structure) {
        return res.status(404).json({ message: "Fee structure not found" });
      }
      res.json(structure);
    } catch (error) {
      console.error("Error updating fee structure:", error);
      res.status(500).json({ message: "Failed to update fee structure" });
    }
  });

  app.delete("/api/fee-structures/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteFeeStructure(id);
      if (!deleted) {
        return res.status(404).json({ message: "Fee structure not found" });
      }
      res.json({ message: "Fee structure deleted successfully" });
    } catch (error) {
      console.error("Error deleting fee structure:", error);
      res.status(500).json({ message: "Failed to delete fee structure" });
    }
  });

  // Fee Structure Items routes
  app.get("/api/fee-structures/:id/items", async (req, res) => {
    try {
      const structureId = parseInt(req.params.id);
      const items = await storage.getFeeStructureItems(structureId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching fee structure items:", error);
      res.status(500).json({ message: "Failed to fetch fee structure items" });
    }
  });

  app.post("/api/fee-structures/:id/items", async (req, res) => {
    try {
      const structureId = parseInt(req.params.id);
      const item = await storage.createFeeStructureItem({
        ...req.body,
        feeStructureId: structureId
      });
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating fee structure item:", error);
      res.status(500).json({ message: "Failed to create fee structure item" });
    }
  });

  app.put("/api/fee-structure-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.updateFeeStructureItem(id, req.body);
      if (!item) {
        return res.status(404).json({ message: "Fee structure item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error updating fee structure item:", error);
      res.status(500).json({ message: "Failed to update fee structure item" });
    }
  });

  app.delete("/api/fee-structure-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteFeeStructureItem(id);
      if (!deleted) {
        return res.status(404).json({ message: "Fee structure item not found" });
      }
      res.json({ message: "Fee structure item deleted successfully" });
    } catch (error) {
      console.error("Error deleting fee structure item:", error);
      res.status(500).json({ message: "Failed to delete fee structure item" });
    }
  });

  // Generate fees from structure
  app.post("/api/fee-structures/:id/generate-fees", async (req, res) => {
    try {
      const structureId = parseInt(req.params.id);
      const { studentIds } = req.body;
      
      const fees = await storage.generateFeesFromStructure(structureId, studentIds);
      res.status(201).json({ 
        message: `Generated ${fees.length} fees successfully`, 
        fees 
      });
    } catch (error) {
      console.error("Error generating fees from structure:", error);
      res.status(500).json({ message: "Failed to generate fees from structure" });
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
      const timetables = await storage.getTimetables(
        className as string, 
        section as string
      );
      res.json(timetables);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch timetable" });
    }
  });

  app.post("/api/timetable", async (req, res) => {
    try {
      const validatedData = insertTimetableSchema.parse(req.body);
      const timetableEntry = await storage.createTimetable(validatedData);
      res.status(201).json(timetableEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
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
      
      if (!Array.isArray(entries) || entries.length === 0) {
        return res.status(400).json({ message: "Invalid entries data" });
      }
      
      const validatedEntries = entries.map(entry => insertTimetableSchema.parse(entry));
      const savedEntries = await storage.bulkCreateTimetables(validatedEntries);

      res.status(201).json(savedEntries);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
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

  // Period management routes
  app.get("/api/periods", async (req, res) => {
    try {
      const periods = await storage.getPeriods();
      res.json(periods);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch periods" });
    }
  });

  app.post("/api/periods", async (req, res) => {
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

  app.put("/api/periods/:id", async (req, res) => {
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

  app.delete("/api/periods/:id", async (req, res) => {
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
