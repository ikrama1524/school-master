import type { Express } from "express";
import jwt from 'jsonwebtoken';
import { authenticateToken as authTokenFromAuth, AuthenticatedRequest } from "./auth";
import { authenticateToken, requireModuleAccess, requireRoles, requireAnyModuleAccess, getUserPermissions } from "./roleMiddleware";
import { MODULES, ACCESS_LEVELS, ROLES } from "./roles";
import { storage } from "./storage";

export function registerRBACRoutes(app: Express) {
  // Authentication routes with role-based login
  app.post("/api/auth/login", async (req: any, res: any) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      // Find user by username
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // For demo purposes, you can use these test accounts:
      // Username: admin, Password: admin123 (admin role)
      // Username: teacher, Password: teacher123 (class_teacher role)
      // Username: student, Password: student123 (student role)
      
      // Generate JWT token with user info and role
      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username, 
          email: user.email || '', 
          role: user.role 
        },
        process.env.JWT_SECRET || 'school_management_super_secret_key_2025_change_in_production',
        { expiresIn: '7d' }
      );

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

  // Get user permissions endpoint
  app.get("/api/auth/permissions", 
    authenticateToken, 
    getUserPermissions, 
    (req: any, res: any) => {
      res.json({
        user: req.user,
        permissions: req.userPermissions
      });
    }
  );

  // Dashboard routes
  app.get("/api/dashboard", 
    authenticateToken,
    requireModuleAccess(MODULES.DASHBOARD, ACCESS_LEVELS.READ),
    async (req: any, res: any) => {
      const userRole = req.user.role;
      
      // Customize dashboard data based on role
      let dashboardData = {};
      
      switch(userRole) {
        case ROLES.STUDENT:
        case ROLES.PARENT:
          dashboardData = {
            notices: await storage.getNotices(),
            attendanceGraph: await storage.getStudentAttendance(req.user.id),
            results: await storage.getStudentResults(req.user.id),
            pendingFees: [], // Mock data - implement storage.getPendingFees later
            todayTimetable: [] // Mock data - implement storage.getTodayTimetable later
          };
          break;
          
        case ROLES.SUBJECT_TEACHER:
          dashboardData = {
            notices: await storage.getNotices(),
            holidays: [], // Mock data - implement storage.getHolidays later
            myAttendance: [] // Mock data - implement storage.getTeacherAttendance later
          };
          break;
          
        case ROLES.CLASS_TEACHER:
          dashboardData = {
            notices: await storage.getNotices(),
            holidays: [], // Mock data - implement storage.getHolidays later
            classAttendance: {} // Mock data - implement storage.getClassAttendanceStats later
          };
          break;
          
        case ROLES.NON_TEACHING:
          dashboardData = {
            notices: await storage.getNotices(),
            myAttendance: [] // Mock data - implement storage.getStaffAttendance later
          };
          break;
          
        default:
          dashboardData = {
            notices: await storage.getNotices(),
            stats: {}, // Mock data - implement storage.getGeneralStats later
            recentActivities: [] // Mock data - implement storage.getRecentActivities later
          };
      }
      
      res.json(dashboardData);
    }
  );



  // Homework routes
  app.get("/api/homework", 
    authenticateToken,
    requireModuleAccess(MODULES.HOMEWORK, ACCESS_LEVELS.READ),
    async (req: any, res: any) => {
      const homework = await storage.getHomework();
      res.json(homework);
    }
  );

  app.post("/api/homework", 
    authenticateToken,
    requireModuleAccess(MODULES.HOMEWORK, ACCESS_LEVELS.WRITE),
    async (req: any, res: any) => {
      const newHomework = await storage.createHomework(req.body);
      res.status(201).json(newHomework);
    }
  );

  // Result routes
  app.get("/api/result", 
    authenticateToken,
    requireModuleAccess(MODULES.RESULT, ACCESS_LEVELS.READ),
    async (req: any, res: any) => {
      const results = await storage.getResults();
      res.json(results);
    }
  );

  app.post("/api/result", 
    authenticateToken,
    requireModuleAccess(MODULES.RESULT, ACCESS_LEVELS.WRITE),
    async (req: any, res: any) => {
      const newResult = await storage.createResult(req.body);
      res.status(201).json(newResult);
    }
  );

  // Reports routes
  app.get("/api/reports", 
    authenticateToken,
    requireModuleAccess(MODULES.REPORTS, ACCESS_LEVELS.READ),
    async (req: any, res: any) => {
      try {
        const reportsData = await storage.getReportsData();
        res.json({ 
          message: "Reports endpoint - role-based access working!", 
          user: req.user,
          reportsData 
        });
      } catch (error) {
        console.error('Reports error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  );

  app.get("/api/reports/:type", 
    authenticateToken,
    requireModuleAccess(MODULES.REPORTS, ACCESS_LEVELS.READ),
    async (req: any, res: any) => {
      const { type } = req.params;
      res.json({ message: `${type} report endpoint`, user: req.user });
    }
  );

  // Fees routes (restricted access)
  app.get("/api/fees", 
    authenticateToken,
    requireAnyModuleAccess(MODULES.FEES, ACCESS_LEVELS.READ, ACCESS_LEVELS.WRITE, ACCESS_LEVELS.ADMIN),
    async (req: any, res: any) => {
      const fees = await storage.getFees();
      res.json(fees);
    }
  );

  app.post("/api/fees", 
    authenticateToken,
    requireModuleAccess(MODULES.FEES, ACCESS_LEVELS.WRITE),
    async (req: any, res: any) => {
      const newFee = await storage.createFee(req.body);
      res.status(201).json(newFee);
    }
  );

  app.put("/api/fees/:id", 
    authenticateToken,
    requireModuleAccess(MODULES.FEES, ACCESS_LEVELS.WRITE),
    async (req: any, res: any) => {
      const updatedFee = await storage.updateFee(parseInt(req.params.id), req.body);
      res.json(updatedFee);
    }
  );

  // Payroll routes (accountant and admin only)
  app.get("/api/payroll", 
    authenticateToken,
    requireRoles(ROLES.ACCOUNTANT, ROLES.PRINCIPAL, ROLES.ADMIN, ROLES.SUPER_ADMIN),
    async (req: any, res: any) => {
      try {
        const payrollData = await storage.getPayrollData();
        res.json({ 
          message: "Payroll endpoint - restricted access working!", 
          user: req.user,
          payrollData 
        });
      } catch (error) {
        console.error('Payroll error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  );

  app.post("/api/payroll", 
    authenticateToken,
    requireModuleAccess(MODULES.PAYROLL, ACCESS_LEVELS.WRITE),
    async (req: any, res: any) => {
      res.status(201).json({ message: "Payroll created (mock)", user: req.user, data: req.body });
    }
  );

  // Attendance routes
  app.get("/api/attendance", 
    authenticateToken,
    requireModuleAccess(MODULES.ATTENDANCE, ACCESS_LEVELS.READ),
    async (req: any, res: any) => {
      try {
        const attendanceData = await storage.getAttendanceRecords();
        res.json({
          message: "Attendance data retrieved successfully",
          user: req.user,
          attendanceData
        });
      } catch (error) {
        console.error('Attendance error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  );

  app.post("/api/attendance", 
    authenticateToken,
    requireModuleAccess(MODULES.ATTENDANCE, ACCESS_LEVELS.WRITE),
    async (req: any, res: any) => {
      const newAttendance = await storage.createAttendance(req.body);
      res.status(201).json(newAttendance);
    }
  );

  // Role-specific test routes
  app.get("/api/test/student-only", 
    authenticateToken,
    requireRoles(ROLES.STUDENT, ROLES.PARENT),
    (req: any, res: any) => {
      res.json({ message: "This is a student/parent only endpoint", user: req.user });
    }
  );

  app.get("/api/test/teacher-only", 
    authenticateToken,
    requireRoles(ROLES.SUBJECT_TEACHER, ROLES.CLASS_TEACHER),
    (req: any, res: any) => {
      res.json({ message: "This is a teacher only endpoint", user: req.user });
    }
  );

  app.get("/api/test/admin-only", 
    authenticateToken,
    requireRoles(ROLES.PRINCIPAL, ROLES.ADMIN, ROLES.SUPER_ADMIN),
    (req: any, res: any) => {
      res.json({ message: "This is an admin only endpoint", user: req.user });
    }
  );

  // Enhanced timetable endpoint
  app.get("/api/timetable", 
    authenticateToken,
    requireModuleAccess(MODULES.TIMETABLE, ACCESS_LEVELS.READ),
    async (req: any, res: any) => {
      try {
        const timetableData = await storage.getTimetable();
        res.json({
          message: "Timetable data retrieved successfully",
          user: req.user,
          timetableData
        });
      } catch (error) {
        console.error('Timetable error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  );

  // Notices endpoint - accessible to all authenticated users
  app.get("/api/notices", 
    authenticateToken,
    async (req: any, res: any) => {
      try {
        const notices = await storage.getNotices();
        res.json({
          message: "Notices retrieved successfully",
          user: req.user,
          notices
        });
      } catch (error) {
        console.error('Notices error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  );
}