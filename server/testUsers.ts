import { storage } from "./storage";
import { hashPassword } from "./auth";
import { ROLES } from "./roles";

// Create test users for different roles
export async function createTestUsers() {
  const testUsers = [
    {
      username: "admin",
      password: "admin123",
      name: "System Administrator",
      email: "admin@school.edu",
      role: ROLES.SUPER_ADMIN
    },
    {
      username: "principal",
      password: "principal123",
      name: "John Principal",
      email: "principal@school.edu",
      role: ROLES.PRINCIPAL
    },
    {
      username: "teacher",
      password: "teacher123",
      name: "Sarah Teacher",
      email: "teacher@school.edu",
      role: ROLES.CLASS_TEACHER
    },
    {
      username: "subject_teacher",
      password: "subject123",
      name: "Math Teacher",
      email: "math@school.edu",
      role: ROLES.SUBJECT_TEACHER
    },
    {
      username: "accountant",
      password: "accountant123",
      name: "Finance Manager",
      email: "finance@school.edu",
      role: ROLES.ACCOUNTANT
    },
    {
      username: "student",
      password: "student123",
      name: "Student/Parent User",
      email: "student@school.edu",
      role: ROLES.STUDENT_PARENT
    },
    {
      username: "staff",
      password: "staff123",
      name: "Non Teaching Staff",
      email: "staff@school.edu",
      role: ROLES.NON_TEACHING
    }
  ];

  console.log("Creating test users...");
  
  for (const user of testUsers) {
    try {
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(user.username);
      if (!existingUser) {
        const hashedPassword = await hashPassword(user.password);
        await storage.createUser({
          ...user,
          password: hashedPassword
        });
        console.log(`✓ Created test user: ${user.username} (${user.role})`);
      } else {
        console.log(`→ User already exists: ${user.username}`);
      }
    } catch (error) {
      console.error(`✗ Failed to create user ${user.username}:`, error);
    }
  }
  
  console.log("\nTest users setup complete!");
  console.log("\n=== TEST CREDENTIALS ===");
  console.log("Super Admin: admin / admin123");
  console.log("Principal: principal / principal123");
  console.log("Class Teacher: teacher / teacher123");
  console.log("Subject Teacher: subject_teacher / subject123");
  console.log("Accountant: accountant / accountant123");
  console.log("Student/Parent: student / student123");
  console.log("Staff: staff / staff123");
  console.log("========================\n");
}