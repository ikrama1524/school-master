import type { Express } from "express";
import { authenticateToken } from "./auth";
import { storage } from "./storage";

export function registerMobileRoutes(app: Express) {
  // Student mobile endpoints
  app.get("/api/students/profile", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // For students, get their own profile
      if (req.user.role === "student") {
        const student = await storage.getStudentByUserId(userId);
        if (!student) {
          return res.status(404).json({ message: "Student profile not found" });
        }
        res.json(student);
      } else {
        res.status(403).json({ message: "Access denied" });
      }
    } catch (error) {
      console.error("Error fetching student profile:", error);
      res.status(500).json({ message: "Failed to fetch student profile" });
    }
  });

  app.get("/api/fees/student", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      if (req.user.role === "student") {
        const student = await storage.getStudentByUserId(userId);
        if (!student) {
          return res.status(404).json({ message: "Student not found" });
        }
        
        const fees = await storage.getStudentFees(student.id);
        res.json(fees);
      } else {
        res.status(403).json({ message: "Access denied" });
      }
    } catch (error) {
      console.error("Error fetching student fees:", error);
      res.status(500).json({ message: "Failed to fetch fees" });
    }
  });

  app.get("/api/attendance/student", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      if (req.user.role === "student") {
        const student = await storage.getStudentByUserId(userId);
        if (!student) {
          return res.status(404).json({ message: "Student not found" });
        }
        
        const attendance = await storage.getStudentAttendance(student.id);
        res.json(attendance);
      } else {
        res.status(403).json({ message: "Access denied" });
      }
    } catch (error) {
      console.error("Error fetching student attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  app.get("/api/results/student", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      if (req.user.role === "student") {
        const student = await storage.getStudentByUserId(userId);
        if (!student) {
          return res.status(404).json({ message: "Student not found" });
        }
        
        const results = await storage.getStudentResults(student.id);
        res.json(results);
      } else {
        res.status(403).json({ message: "Access denied" });
      }
    } catch (error) {
      console.error("Error fetching student results:", error);
      res.status(500).json({ message: "Failed to fetch results" });
    }
  });

  app.get("/api/notices/student", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role === "student") {
        const notices = await storage.getNotices();
        // Filter notices relevant to students
        const studentNotices = notices.filter(notice => 
          notice.targetAudience === "all" || 
          notice.targetAudience === "students"
        );
        res.json(studentNotices);
      } else {
        res.status(403).json({ message: "Access denied" });
      }
    } catch (error) {
      console.error("Error fetching student notices:", error);
      res.status(500).json({ message: "Failed to fetch notices" });
    }
  });

  // Parent mobile endpoints
  app.get("/api/students/children", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      if (req.user.role === "parent") {
        const children = await storage.getParentChildren(userId);
        res.json(children);
      } else {
        res.status(403).json({ message: "Access denied" });
      }
    } catch (error) {
      console.error("Error fetching parent children:", error);
      res.status(500).json({ message: "Failed to fetch children" });
    }
  });

  app.get("/api/fees/children", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      if (req.user.role === "parent") {
        const children = await storage.getParentChildren(userId);
        const allFees = [];
        
        for (const child of children) {
          const fees = await storage.getStudentFees(child.id);
          allFees.push(...fees);
        }
        
        res.json(allFees);
      } else {
        res.status(403).json({ message: "Access denied" });
      }
    } catch (error) {
      console.error("Error fetching children fees:", error);
      res.status(500).json({ message: "Failed to fetch fees" });
    }
  });

  app.get("/api/attendance/children", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      if (req.user.role === "parent") {
        const children = await storage.getParentChildren(userId);
        const allAttendance = [];
        
        for (const child of children) {
          const attendance = await storage.getStudentAttendance(child.id);
          allAttendance.push(...attendance);
        }
        
        res.json(allAttendance);
      } else {
        res.status(403).json({ message: "Access denied" });
      }
    } catch (error) {
      console.error("Error fetching children attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  app.get("/api/results/children", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      if (req.user.role === "parent") {
        const children = await storage.getParentChildren(userId);
        const allResults = [];
        
        for (const child of children) {
          const results = await storage.getStudentResults(child.id);
          allResults.push(...results);
        }
        
        res.json(allResults);
      } else {
        res.status(403).json({ message: "Access denied" });
      }
    } catch (error) {
      console.error("Error fetching children results:", error);
      res.status(500).json({ message: "Failed to fetch results" });
    }
  });

  app.get("/api/notices/parent", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role === "parent") {
        const notices = await storage.getNotices();
        // Filter notices relevant to parents
        const parentNotices = notices.filter(notice => 
          notice.targetAudience === "all" || 
          notice.targetAudience === "parents"
        );
        res.json(parentNotices);
      } else {
        res.status(403).json({ message: "Access denied" });
      }
    } catch (error) {
      console.error("Error fetching parent notices:", error);
      res.status(500).json({ message: "Failed to fetch notices" });
    }
  });

  // Mobile notification endpoints
  app.post("/api/notifications/register", authenticateToken, async (req: any, res) => {
    try {
      const { fcmToken } = req.body;
      const userId = req.user.id;
      
      // Store FCM token for user
      await storage.updateUserFCMToken(userId, fcmToken);
      
      res.json({ message: "FCM token registered successfully" });
    } catch (error) {
      console.error("Error registering FCM token:", error);
      res.status(500).json({ message: "Failed to register FCM token" });
    }
  });
}