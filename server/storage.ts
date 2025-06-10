import { 
  users, students, teachers, attendance, fees, notices,
  type User, type InsertUser,
  type Student, type InsertStudent,
  type Teacher, type InsertTeacher,
  type Attendance, type InsertAttendance,
  type Fee, type InsertFee,
  type Notice, type InsertNotice
} from "@shared/schema";
import { db } from "./db";
import { eq, count } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Students
  getStudents(): Promise<Student[]>;
  getStudent(id: number): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, student: Partial<Student>): Promise<Student | undefined>;
  deleteStudent(id: number): Promise<boolean>;
  
  // Teachers
  getTeachers(): Promise<Teacher[]>;
  getTeacher(id: number): Promise<Teacher | undefined>;
  createTeacher(teacher: InsertTeacher): Promise<Teacher>;
  updateTeacher(id: number, teacher: Partial<Teacher>): Promise<Teacher | undefined>;
  deleteTeacher(id: number): Promise<boolean>;
  
  // Attendance
  getAttendance(date?: Date): Promise<Attendance[]>;
  getStudentAttendance(studentId: number): Promise<Attendance[]>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  
  // Fees
  getFees(): Promise<Fee[]>;
  getStudentFees(studentId: number): Promise<Fee[]>;
  createFee(fee: InsertFee): Promise<Fee>;
  updateFee(id: number, fee: Partial<Fee>): Promise<Fee | undefined>;
  
  // Notices
  getNotices(): Promise<Notice[]>;
  createNotice(notice: InsertNotice): Promise<Notice>;
  
  // Stats
  getStats(): Promise<{
    totalStudents: number;
    totalTeachers: number;
    attendanceRate: number;
    feeCollection: number;
    pendingFees: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeData();
  }

  private async initializeData() {
    try {
      // Check if admin user already exists
      const existingAdmin = await db.select().from(users).where(eq(users.username, "admin")).limit(1);
      
      if (existingAdmin.length === 0) {
        // Create admin user
        await db.insert(users).values({
          username: "admin",
          password: "admin123", // In real app, this would be hashed
          role: "admin",
          name: "John Anderson",
          email: "admin@school.edu",
          phone: "+1234567890",
        });
      }
    } catch (error) {
      console.error("Error initializing data:", error);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Student methods
  async getStudents(): Promise<Student[]> {
    return await db.select().from(students);
  }

  async getStudent(id: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student || undefined;
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    // Generate roll number if not provided
    const rollNumber = insertStudent.rollNumber || `${new Date().getFullYear()}${String(Date.now()).slice(-3)}`;
    
    const [student] = await db
      .insert(students)
      .values({
        ...insertStudent,
        rollNumber,
      })
      .returning();
    return student;
  }

  async updateStudent(id: number, updateData: Partial<Student>): Promise<Student | undefined> {
    const [student] = await db
      .update(students)
      .set(updateData)
      .where(eq(students.id, id))
      .returning();
    return student || undefined;
  }

  async deleteStudent(id: number): Promise<boolean> {
    const result = await db.delete(students).where(eq(students.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Teacher methods
  async getTeachers(): Promise<Teacher[]> {
    return await db.select().from(teachers);
  }

  async getTeacher(id: number): Promise<Teacher | undefined> {
    const [teacher] = await db.select().from(teachers).where(eq(teachers.id, id));
    return teacher || undefined;
  }

  async createTeacher(insertTeacher: InsertTeacher): Promise<Teacher> {
    // Generate employee ID if not provided
    const employeeId = insertTeacher.employeeId || `TCH${String(Date.now()).slice(-3)}`;
    
    const [teacher] = await db
      .insert(teachers)
      .values({
        ...insertTeacher,
        employeeId,
      })
      .returning();
    return teacher;
  }

  async updateTeacher(id: number, updateData: Partial<Teacher>): Promise<Teacher | undefined> {
    const [teacher] = await db
      .update(teachers)
      .set(updateData)
      .where(eq(teachers.id, id))
      .returning();
    return teacher || undefined;
  }

  async deleteTeacher(id: number): Promise<boolean> {
    const result = await db.delete(teachers).where(eq(teachers.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Attendance methods
  async getAttendance(date?: Date): Promise<Attendance[]> {
    if (!date) {
      return await db.select().from(attendance);
    }
    return await db.select().from(attendance).where(eq(attendance.date, date));
  }

  async getStudentAttendance(studentId: number): Promise<Attendance[]> {
    return await db.select().from(attendance).where(eq(attendance.studentId, studentId));
  }

  async createAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    const [attendanceRecord] = await db
      .insert(attendance)
      .values(insertAttendance)
      .returning();
    return attendanceRecord;
  }

  // Fee methods
  async getFees(): Promise<Fee[]> {
    return await db.select().from(fees);
  }

  async getStudentFees(studentId: number): Promise<Fee[]> {
    return await db.select().from(fees).where(eq(fees.studentId, studentId));
  }

  async createFee(insertFee: InsertFee): Promise<Fee> {
    const [fee] = await db
      .insert(fees)
      .values(insertFee)
      .returning();
    return fee;
  }

  async updateFee(id: number, updateData: Partial<Fee>): Promise<Fee | undefined> {
    const [fee] = await db
      .update(fees)
      .set(updateData)
      .where(eq(fees.id, id))
      .returning();
    return fee || undefined;
  }

  // Notice methods
  async getNotices(): Promise<Notice[]> {
    return await db.select().from(notices).where(eq(notices.isActive, true));
  }

  async createNotice(insertNotice: InsertNotice): Promise<Notice> {
    const [notice] = await db
      .insert(notices)
      .values(insertNotice)
      .returning();
    return notice;
  }

  // Stats method
  async getStats(): Promise<{
    totalStudents: number;
    totalTeachers: number;
    attendanceRate: number;
    feeCollection: number;
    pendingFees: number;
  }> {
    const [studentCount] = await db.select({ count: count() }).from(students);
    const [teacherCount] = await db.select({ count: count() }).from(teachers);
    const allFees = await db.select().from(fees);
    
    const totalStudents = studentCount.count;
    const totalTeachers = teacherCount.count;
    
    // Calculate attendance rate (simplified)
    const attendanceRate = 85; // Mock calculation for now
    
    // Calculate fee collection
    const totalFeesAmount = allFees.reduce((sum, fee) => sum + parseFloat(fee.amount), 0);
    const paidFeesAmount = allFees
      .filter(fee => fee.status === 'paid')
      .reduce((sum, fee) => sum + parseFloat(fee.amount), 0);
    
    return {
      totalStudents,
      totalTeachers,
      attendanceRate,
      feeCollection: paidFeesAmount,
      pendingFees: totalFeesAmount - paidFeesAmount,
    };
  }
}

export const storage = new DatabaseStorage();