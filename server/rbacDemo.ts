import type { Express } from "express";
import { ROLES, hasModuleAccess, ACCESS_LEVELS, MODULES } from "./roles";

export function createRBACDemoRoute(app: Express) {
  // Demo endpoint to show role-based access control matrix
  app.get("/api/rbac-demo", (req: any, res: any) => {
    const demoUsers = [
      { role: ROLES.STUDENT, name: "Student User" },
      { role: ROLES.PARENT, name: "Parent User" },
      { role: ROLES.SUBJECT_TEACHER, name: "Subject Teacher" },
      { role: ROLES.CLASS_TEACHER, name: "Class Teacher" },
      { role: ROLES.NON_TEACHING, name: "Non Teaching Staff" },
      { role: ROLES.ACCOUNTANT, name: "Accountant" },
      { role: ROLES.PRINCIPAL, name: "Principal" },
      { role: ROLES.ADMIN, name: "Admin" },
      { role: ROLES.SUPER_ADMIN, name: "Super Admin" }
    ];

    const modules = [
      MODULES.DASHBOARD,
      MODULES.TIMETABLE,
      MODULES.HOMEWORK,
      MODULES.RESULT,
      MODULES.REPORTS,
      MODULES.FEES,
      MODULES.PAYROLL,
      MODULES.ATTENDANCE
    ];

    const accessMatrix = {};

    demoUsers.forEach(user => {
      accessMatrix[user.role] = {
        name: user.name,
        permissions: {}
      };

      modules.forEach(module => {
        accessMatrix[user.role].permissions[module] = {
          read: hasModuleAccess(user.role, module, ACCESS_LEVELS.READ),
          write: hasModuleAccess(user.role, module, ACCESS_LEVELS.WRITE),
          admin: hasModuleAccess(user.role, module, ACCESS_LEVELS.ADMIN)
        };
      });
    });

    res.json({
      message: "Role-Based Access Control (RBAC) System Demo",
      testCredentials: {
        "super_admin": "admin / admin123",
        "principal": "principal / principal123", 
        "class_teacher": "teacher / teacher123",
        "subject_teacher": "subject_teacher / subject123",
        "accountant": "accountant / accountant123",
        "student": "student / student123",
        "parent": "parent / parent123",
        "non_teaching": "staff / staff123"
      },
      howToTest: [
        "1. POST /api/auth/login with test credentials above",
        "2. Copy the JWT token from response",
        "3. Add 'Authorization: Bearer <token>' header to requests",
        "4. Try accessing different endpoints based on role permissions below",
        "5. Test endpoints: /api/dashboard, /api/timetable, /api/homework, /api/result, /api/reports, /api/fees, /api/payroll, /api/attendance"
      ],
      accessMatrix
    });
  });
}