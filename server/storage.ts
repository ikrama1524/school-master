import { 
  users, students, teachers, attendance, fees, notices, timetable, periods, results, exams, semesters, semesterResults, documents,
  type User, type InsertUser,
  type Student, type InsertStudent,
  type Teacher, type InsertTeacher,
  type Attendance, type InsertAttendance,
  type Fee, type InsertFee,
  type Notice, type InsertNotice,
  type Timetable, type InsertTimetable,
  type Period, type InsertPeriod,
  type Result, type InsertResult,
  type Exam, type InsertExam,
  type Semester, type InsertSemester,
  type SemesterResult, type InsertSemesterResult,
  type Document, type InsertDocument
} from "@shared/schema";
import { db } from "./db";
import { eq, count, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  updateUserLastLogin(id: number): Promise<void>;
  
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
  
  // Timetable
  getTimetables(className?: string, section?: string): Promise<Timetable[]>;
  createTimetable(timetableEntry: InsertTimetable): Promise<Timetable>;
  updateTimetable(id: number, timetableEntry: Partial<Timetable>): Promise<Timetable | undefined>;
  deleteTimetable(id: number): Promise<boolean>;
  bulkCreateTimetables(entries: InsertTimetable[]): Promise<Timetable[]>;
  
  // Periods
  getPeriods(): Promise<Period[]>;
  createPeriod(period: InsertPeriod): Promise<Period>;
  updatePeriod(id: number, period: Partial<Period>): Promise<Period | undefined>;
  deletePeriod(id: number): Promise<boolean>;
  
  // Results
  getResults(): Promise<Result[]>;
  getResult(id: number): Promise<Result | undefined>;
  createResult(result: InsertResult): Promise<Result>;
  updateResult(id: number, result: Partial<Result>): Promise<Result | undefined>;
  deleteResult(id: number): Promise<boolean>;
  getStudentResults(studentId: number): Promise<Result[]>;
  
  // Exams
  getExams(): Promise<Exam[]>;
  getExam(id: number): Promise<Exam | undefined>;
  createExam(exam: InsertExam): Promise<Exam>;
  updateExam(id: number, exam: Partial<Exam>): Promise<Exam | undefined>;
  deleteExam(id: number): Promise<boolean>;
  
  // Semesters
  getSemesters(): Promise<Semester[]>;
  getSemester(id: number): Promise<Semester | undefined>;
  createSemester(semester: InsertSemester): Promise<Semester>;
  updateSemester(id: number, semester: Partial<Semester>): Promise<Semester | undefined>;
  deleteSemester(id: number): Promise<boolean>;
  getActiveSemester(): Promise<Semester | undefined>;
  
  // Semester Results
  getSemesterResults(): Promise<SemesterResult[]>;
  getSemesterResult(id: number): Promise<SemesterResult | undefined>;
  createSemesterResult(semesterResult: InsertSemesterResult): Promise<SemesterResult>;
  updateSemesterResult(id: number, semesterResult: Partial<SemesterResult>): Promise<SemesterResult | undefined>;
  deleteSemesterResult(id: number): Promise<boolean>;
  getStudentSemesterResults(studentId: number, semesterId?: number): Promise<SemesterResult[]>;
  getSemesterResultsBySemester(semesterId: number): Promise<SemesterResult[]>;
  
  // Documents
  getDocuments(): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<Document>): Promise<Document | undefined>;  
  deleteDocument(id: number): Promise<boolean>;
  getDocumentsByStatus(status: string): Promise<Document[]>;
  getDocumentsByType(documentType: string): Promise<Document[]>;
  getStudentDocuments(studentId: number): Promise<Document[]>;
  
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

  async updateUserLastLogin(id: number): Promise<void> {
    await db
      .update(users)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUser(id: number, updateData: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount || 0) > 0;
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

  // Timetable methods
  async getTimetables(className?: string, section?: string): Promise<Timetable[]> {
    if (className && section) {
      return await db.select().from(timetable)
        .where(and(eq(timetable.class, className), eq(timetable.section, section)));
    } else if (className) {
      return await db.select().from(timetable)
        .where(eq(timetable.class, className));
    }
    
    return await db.select().from(timetable);
  }

  async createTimetable(timetableEntry: InsertTimetable): Promise<Timetable> {
    const [entry] = await db.insert(timetable).values(timetableEntry).returning();
    return entry;
  }

  async updateTimetable(id: number, timetableEntry: Partial<Timetable>): Promise<Timetable | undefined> {
    const [entry] = await db.update(timetable)
      .set(timetableEntry)
      .where(eq(timetable.id, id))
      .returning();
    return entry;
  }

  async deleteTimetable(id: number): Promise<boolean> {
    const result = await db.delete(timetable).where(eq(timetable.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async bulkCreateTimetables(entries: InsertTimetable[]): Promise<Timetable[]> {
    const createdEntries = await db.insert(timetable).values(entries).returning();
    return createdEntries;
  }

  // Period methods
  async getPeriods(): Promise<Period[]> {
    return await db.select().from(periods).where(eq(periods.isActive, true));
  }

  async createPeriod(period: InsertPeriod): Promise<Period> {
    const [newPeriod] = await db.insert(periods).values(period).returning();
    return newPeriod;
  }

  async updatePeriod(id: number, period: Partial<Period>): Promise<Period | undefined> {
    const [updatedPeriod] = await db.update(periods)
      .set(period)
      .where(eq(periods.id, id))
      .returning();
    return updatedPeriod;
  }

  async deletePeriod(id: number): Promise<boolean> {
    const result = await db.update(periods)
      .set({ isActive: false })
      .where(eq(periods.id, id));
    return (result.rowCount ?? 0) > 0;
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

  // Results methods
  async getResults(): Promise<Result[]> {
    return await db.select().from(results);
  }

  async getResult(id: number): Promise<Result | undefined> {
    const [result] = await db.select().from(results).where(eq(results.id, id));
    return result || undefined;
  }

  async createResult(insertResult: InsertResult): Promise<Result> {
    const [result] = await db.insert(results).values(insertResult).returning();
    return result;
  }

  async updateResult(id: number, updateData: Partial<Result>): Promise<Result | undefined> {
    const [result] = await db.update(results).set(updateData).where(eq(results.id, id)).returning();
    return result || undefined;
  }

  async deleteResult(id: number): Promise<boolean> {
    const deleted = await db.delete(results).where(eq(results.id, id));
    return deleted.rowCount ? deleted.rowCount > 0 : false;
  }

  async getStudentResults(studentId: number): Promise<Result[]> {
    return await db.select().from(results).where(eq(results.studentId, studentId));
  }

  // Exams methods
  async getExams(): Promise<Exam[]> {
    return await db.select().from(exams);
  }

  async getExam(id: number): Promise<Exam | undefined> {
    const [exam] = await db.select().from(exams).where(eq(exams.id, id));
    return exam || undefined;
  }

  async createExam(insertExam: InsertExam): Promise<Exam> {
    const [exam] = await db.insert(exams).values(insertExam).returning();
    return exam;
  }

  async updateExam(id: number, updateData: Partial<Exam>): Promise<Exam | undefined> {
    const [exam] = await db.update(exams).set(updateData).where(eq(exams.id, id)).returning();
    return exam || undefined;
  }

  async deleteExam(id: number): Promise<boolean> {
    const deleted = await db.delete(exams).where(eq(exams.id, id));
    return deleted.rowCount ? deleted.rowCount > 0 : false;
  }

  // Semesters methods
  async getSemesters(): Promise<Semester[]> {
    return await db.select().from(semesters);
  }

  async getSemester(id: number): Promise<Semester | undefined> {
    const [semester] = await db.select().from(semesters).where(eq(semesters.id, id));
    return semester || undefined;
  }

  async createSemester(insertSemester: InsertSemester): Promise<Semester> {
    const [semester] = await db.insert(semesters).values(insertSemester).returning();
    return semester;
  }

  async updateSemester(id: number, updateData: Partial<Semester>): Promise<Semester | undefined> {
    const [semester] = await db.update(semesters).set(updateData).where(eq(semesters.id, id)).returning();
    return semester || undefined;
  }

  async deleteSemester(id: number): Promise<boolean> {
    const deleted = await db.delete(semesters).where(eq(semesters.id, id));
    return deleted.rowCount ? deleted.rowCount > 0 : false;
  }

  async getActiveSemester(): Promise<Semester | undefined> {
    const [semester] = await db.select().from(semesters).where(eq(semesters.isActive, true));
    return semester || undefined;
  }

  // Semester Results methods
  async getSemesterResults(): Promise<SemesterResult[]> {
    return await db.select().from(semesterResults);
  }

  async getSemesterResult(id: number): Promise<SemesterResult | undefined> {
    const [result] = await db.select().from(semesterResults).where(eq(semesterResults.id, id));
    return result || undefined;
  }

  async createSemesterResult(insertSemesterResult: InsertSemesterResult): Promise<SemesterResult> {
    const [result] = await db.insert(semesterResults).values(insertSemesterResult).returning();
    return result;
  }

  async updateSemesterResult(id: number, updateData: Partial<SemesterResult>): Promise<SemesterResult | undefined> {
    const [result] = await db.update(semesterResults).set(updateData).where(eq(semesterResults.id, id)).returning();
    return result || undefined;
  }

  async deleteSemesterResult(id: number): Promise<boolean> {
    const deleted = await db.delete(semesterResults).where(eq(semesterResults.id, id));
    return deleted.rowCount ? deleted.rowCount > 0 : false;
  }

  async getStudentSemesterResults(studentId: number, semesterId?: number): Promise<SemesterResult[]> {
    if (semesterId) {
      return await db.select().from(semesterResults)
        .where(and(eq(semesterResults.studentId, studentId), eq(semesterResults.semesterId, semesterId)));
    }
    return await db.select().from(semesterResults).where(eq(semesterResults.studentId, studentId));
  }

  async getSemesterResultsBySemester(semesterId: number): Promise<SemesterResult[]> {
    return await db.select().from(semesterResults).where(eq(semesterResults.semesterId, semesterId));
  }

  // Document Management Methods
  async getDocuments(): Promise<Document[]> {
    return await db.select().from(documents);
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || undefined;
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db.insert(documents).values(insertDocument).returning();
    return document;
  }

  async updateDocument(id: number, updateData: Partial<Document>): Promise<Document | undefined> {
    const [document] = await db.update(documents).set(updateData).where(eq(documents.id, id)).returning();
    return document || undefined;
  }

  async deleteDocument(id: number): Promise<boolean> {
    const deleted = await db.delete(documents).where(eq(documents.id, id));
    return deleted.rowCount ? deleted.rowCount > 0 : false;
  }

  async getDocumentsByStatus(status: string): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.status, status));
  }

  async getDocumentsByType(documentType: string): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.documentType, documentType));
  }

  async getStudentDocuments(studentId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.studentId, studentId));
  }
}

export const storage = new DatabaseStorage();