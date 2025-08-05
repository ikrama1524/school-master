import type { Express } from "express";
import { authenticateToken } from "./auth";
import { storage } from "./storage";

export function registerMobileRoutes(app: Express) {
  // Student mobile endpoints - STUDENT ROLE ONLY
  app.get("/api/students/profile", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Only allow students to access their own profile
      if (req.user.role !== "student") {
        return res.status(403).json({ message: "Access denied - Student role required" });
      }
      
      const student = await storage.getStudentByUserId(userId);
      if (!student) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      res.json(student);
    } catch (error) {
      console.error("Error fetching student profile:", error);
      res.status(500).json({ message: "Failed to fetch student profile" });
    }
  });

  app.get("/api/fees/student", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Only allow students to view their own fees
      if (req.user.role !== "student") {
        return res.status(403).json({ message: "Access denied - Student role required" });
      }
      
      const student = await storage.getStudentByUserId(userId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      const fees = await storage.getStudentFees(student.id);
      res.json(fees);
    } catch (error) {
      console.error("Error fetching student fees:", error);
      res.status(500).json({ message: "Failed to fetch fees" });
    }
  });

  app.get("/api/attendance/student", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Only allow students to view their own attendance
      if (req.user.role !== "student") {
        return res.status(403).json({ message: "Access denied - Student role required" });
      }
      
      const student = await storage.getStudentByUserId(userId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      const attendance = await storage.getStudentAttendance(student.id);
      res.json(attendance);
    } catch (error) {
      console.error("Error fetching student attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  app.get("/api/results/student", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Only allow students to view their own results
      if (req.user.role !== "student") {
        return res.status(403).json({ message: "Access denied - Student role required" });
      }
      
      const student = await storage.getStudentByUserId(userId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      const results = await storage.getStudentResults(student.id);
      res.json(results);
    } catch (error) {
      console.error("Error fetching student results:", error);
      res.status(500).json({ message: "Failed to fetch results" });
    }
  });

  app.get("/api/notices/student", authenticateToken, async (req: any, res) => {
    try {
      // Only allow students to view notices
      if (req.user.role !== "student") {
        return res.status(403).json({ message: "Access denied - Student role required" });
      }
      
      const notices = await storage.getNotices();
      // Filter notices relevant to students only
      const studentNotices = notices.filter(notice => 
        notice.targetAudience === "all" || 
        notice.targetAudience === "students"
      );
      res.json(studentNotices);
    } catch (error) {
      console.error("Error fetching student notices:", error);
      res.status(500).json({ message: "Failed to fetch notices" });
    }
  });

  // Parent mobile endpoints - PARENT ROLE ONLY
  app.get("/api/students/children", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Only allow parents to view their children
      if (req.user.role !== "parent") {
        return res.status(403).json({ message: "Access denied - Parent role required" });
      }
      
      const children = await storage.getParentChildren(userId);
      res.json(children);
    } catch (error) {
      console.error("Error fetching parent children:", error);
      res.status(500).json({ message: "Failed to fetch children" });
    }
  });

  app.get("/api/fees/children", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Only allow parents to view their children's fees
      if (req.user.role !== "parent") {
        return res.status(403).json({ message: "Access denied - Parent role required" });
      }
      
      const children = await storage.getParentChildren(userId);
      const allFees = [];
      
      for (const child of children) {
        const fees = await storage.getStudentFees(child.id);
        allFees.push(...fees);
      }
      
      res.json(allFees);
    } catch (error) {
      console.error("Error fetching children fees:", error);
      res.status(500).json({ message: "Failed to fetch fees" });
    }
  });

  app.get("/api/attendance/children", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Only allow parents to view their children's attendance
      if (req.user.role !== "parent") {
        return res.status(403).json({ message: "Access denied - Parent role required" });
      }
      
      const children = await storage.getParentChildren(userId);
      const allAttendance = [];
      
      for (const child of children) {
        const attendance = await storage.getStudentAttendance(child.id);
        allAttendance.push(...attendance);
      }
      
      res.json(allAttendance);
    } catch (error) {
      console.error("Error fetching children attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  app.get("/api/results/children", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Only allow parents to view their children's results
      if (req.user.role !== "parent") {
        return res.status(403).json({ message: "Access denied - Parent role required" });
      }
      
      const children = await storage.getParentChildren(userId);
      const allResults = [];
      
      for (const child of children) {
        const results = await storage.getStudentResults(child.id);
        allResults.push(...results);
      }
      
      res.json(allResults);
    } catch (error) {
      console.error("Error fetching children results:", error);
      res.status(500).json({ message: "Failed to fetch results" });
    }
  });

  app.get("/api/notices/parent", authenticateToken, async (req: any, res) => {
    try {
      // Only allow parents to view notices
      if (req.user.role !== "parent") {
        return res.status(403).json({ message: "Access denied - Parent role required" });
      }
      
      const notices = await storage.getNotices();
      // Filter notices relevant to parents only
      const parentNotices = notices.filter(notice => 
        notice.targetAudience === "all" || 
        notice.targetAudience === "parents"
      );
      res.json(parentNotices);
    } catch (error) {
      console.error("Error fetching parent notices:", error);
      res.status(500).json({ message: "Failed to fetch notices" });
    }
  });

  // Mobile notification endpoints - STUDENTS AND PARENTS ONLY
  app.post("/api/notifications/register", authenticateToken, async (req: any, res) => {
    try {
      const { fcmToken } = req.body;
      const userId = req.user.id;
      
      // Only allow students and parents to register for notifications
      if (req.user.role !== "student" && req.user.role !== "parent") {
        return res.status(403).json({ message: "Access denied - Student or Parent role required" });
      }
      
      // Store FCM token for user
      await storage.updateUserFCMToken(userId, fcmToken);
      
      res.json({ message: "FCM token registered successfully" });
    } catch (error) {
      console.error("Error registering FCM token:", error);
      res.status(500).json({ message: "Failed to register FCM token" });
    }
  });
}