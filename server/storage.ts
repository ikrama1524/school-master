import { 
  users, students, teachers, attendance, fees, feeStructures, feeStructureItems, notices, timetable, periods, results, exams, semesters, semesterResults, documents, homework, homeworkSubmissions, reports,
  type User, type InsertUser,
  type Student, type InsertStudent,
  type Teacher, type InsertTeacher,
  type Attendance, type InsertAttendance,
  type Fee, type InsertFee,
  type FeeStructure, type InsertFeeStructure,
  type FeeStructureItem, type InsertFeeStructureItem,
  type Notice, type InsertNotice,
  type Timetable, type InsertTimetable,
  type Period, type InsertPeriod,
  type Result, type InsertResult,
  type Exam, type InsertExam,
  type Semester, type InsertSemester,
  type SemesterResult, type InsertSemesterResult,
  type Document, type InsertDocument,
  type Homework, type InsertHomework,
  type HomeworkSubmission, type InsertHomeworkSubmission,
  type Report, type InsertReport
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
  
  // Fee Structures
  getFeeStructures(): Promise<FeeStructure[]>;
  getFeeStructure(id: number): Promise<FeeStructure | undefined>;
  createFeeStructure(structure: InsertFeeStructure): Promise<FeeStructure>;
  updateFeeStructure(id: number, structure: Partial<FeeStructure>): Promise<FeeStructure | undefined>;
  deleteFeeStructure(id: number): Promise<boolean>;
  
  // Fee Structure Items
  getFeeStructureItems(structureId: number): Promise<FeeStructureItem[]>;
  createFeeStructureItem(item: InsertFeeStructureItem): Promise<FeeStructureItem>;
  updateFeeStructureItem(id: number, item: Partial<FeeStructureItem>): Promise<FeeStructureItem | undefined>;
  deleteFeeStructureItem(id: number): Promise<boolean>;
  
  // Fees
  getFees(): Promise<Fee[]>;
  getStudentFees(studentId: number): Promise<Fee[]>;
  createFee(fee: InsertFee): Promise<Fee>;
  updateFee(id: number, fee: Partial<Fee>): Promise<Fee | undefined>;
  generateFeesFromStructure(structureId: number, studentIds: number[]): Promise<Fee[]>;
  
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

      // Add sample fee data if no fees exist
      const existingFees = await db.select().from(fees).limit(1);
      if (existingFees.length === 0) {
        const allStudents = await db.select().from(students);
        if (allStudents.length > 0) {
          const sampleFees = [
            {
              studentId: allStudents[0].id,
              feeType: "Tuition",
              amount: "15000.00",
              dueDate: new Date("2025-02-15"),
              status: "pending",
              academicYear: "2024-25",
              remarks: "First semester tuition fee"
            },
            {
              studentId: allStudents[0].id,
              feeType: "Transport",
              amount: "5000.00",
              dueDate: new Date("2025-02-10"),
              status: "paid",
              paidDate: new Date("2025-01-05"),
              paymentMethod: "online",
              academicYear: "2024-25",
              remarks: "Transport fee for semester 1"
            },
            {
              studentId: allStudents[0].id,
              feeType: "Library",
              amount: "2000.00",
              dueDate: new Date("2025-01-20"),
              status: "overdue",
              academicYear: "2024-25",
              remarks: "Library fee past due"
            }
          ];

          // Add fees for multiple students if they exist
          if (allStudents.length > 1) {
            sampleFees.push(
              {
                studentId: allStudents[1].id,
                feeType: "Tuition",
                amount: "15000.00",
                dueDate: new Date("2025-02-15"),
                status: "paid",
                paidDate: new Date("2025-01-10"),
                paymentMethod: "card",
                academicYear: "2024-25",
                remarks: "First semester tuition fee"
              },
              {
                studentId: allStudents[1].id,
                feeType: "Sports",
                amount: "3000.00",
                dueDate: new Date("2025-02-20"),
                status: "pending",
                academicYear: "2024-25",
                remarks: "Sports activity fee"
              }
            );
          }

          if (allStudents.length > 2) {
            sampleFees.push(
              {
                studentId: allStudents[2].id,
                feeType: "Tuition",
                amount: "15000.00",
                dueDate: new Date("2025-02-15"),
                status: "pending",
                academicYear: "2024-25",
                remarks: "First semester tuition fee"
              },
              {
                studentId: allStudents[2].id,
                feeType: "Exam",
                amount: "1500.00",
                dueDate: new Date("2025-02-05"),
                status: "paid",
                paidDate: new Date("2025-01-15"),
                paymentMethod: "cash",
                academicYear: "2024-25",
                remarks: "Annual examination fee"
              }
            );
          }

          await db.insert(fees).values(sampleFees);
        }
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
    const [student] = await db
      .insert(students)
      .values(insertStudent)
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

  // Fee Structure methods
  async getFeeStructures(): Promise<FeeStructure[]> {
    return await db.select().from(feeStructures).where(eq(feeStructures.isActive, true));
  }

  async getFeeStructure(id: number): Promise<FeeStructure | undefined> {
    const [structure] = await db.select().from(feeStructures).where(eq(feeStructures.id, id));
    return structure || undefined;
  }

  async createFeeStructure(insertStructure: InsertFeeStructure): Promise<FeeStructure> {
    const [structure] = await db
      .insert(feeStructures)
      .values(insertStructure)
      .returning();
    return structure;
  }

  async updateFeeStructure(id: number, updateData: Partial<FeeStructure>): Promise<FeeStructure | undefined> {
    const [structure] = await db
      .update(feeStructures)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(feeStructures.id, id))
      .returning();
    return structure || undefined;
  }

  async deleteFeeStructure(id: number): Promise<boolean> {
    const [structure] = await db
      .update(feeStructures)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(feeStructures.id, id))
      .returning();
    return !!structure;
  }

  // Fee Structure Item methods
  async getFeeStructureItems(structureId: number): Promise<FeeStructureItem[]> {
    return await db.select().from(feeStructureItems).where(eq(feeStructureItems.feeStructureId, structureId));
  }

  async createFeeStructureItem(insertItem: InsertFeeStructureItem): Promise<FeeStructureItem> {
    const [item] = await db
      .insert(feeStructureItems)
      .values(insertItem)
      .returning();
    return item;
  }

  async updateFeeStructureItem(id: number, updateData: Partial<FeeStructureItem>): Promise<FeeStructureItem | undefined> {
    const [item] = await db
      .update(feeStructureItems)
      .set(updateData)
      .where(eq(feeStructureItems.id, id))
      .returning();
    return item || undefined;
  }

  async deleteFeeStructureItem(id: number): Promise<boolean> {
    const result = await db.delete(feeStructureItems).where(eq(feeStructureItems.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async generateFeesFromStructure(structureId: number, studentIds: number[]): Promise<Fee[]> {
    const structure = await this.getFeeStructure(structureId);
    const items = await this.getFeeStructureItems(structureId);
    
    if (!structure || !items.length) {
      return [];
    }

    const fees: Fee[] = [];
    
    for (const studentId of studentIds) {
      for (const item of items) {
        // Calculate due date based on frequency
        const dueDate = new Date();
        dueDate.setDate(item.dueDay);
        
        const feeData = {
          studentId,
          feeType: item.feeType,
          amount: item.amount,
          dueDate,
          status: "pending" as const,
          academicYear: structure.academicYear,
          installmentNumber: 1,
          totalInstallments: item.frequency === "annually" ? 1 : 
                            item.frequency === "quarterly" ? 4 : 12,
          remarks: item.description || `Generated from ${structure.name}`,
        };
        
        const fee = await this.createFee(feeData);
        fees.push(fee);
      }
    }
    
    return fees;
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

  // RBAC-specific methods for different modules with realistic data
  async getHomework(): Promise<any[]> {
    return [
      {
        id: 1,
        subject: "Mathematics",
        title: "Quadratic Equations - Practice Problems",
        description: "Solve problems 1-15 from Chapter 4. Show all working steps.",
        assignedDate: "2025-01-25",
        dueDate: "2025-01-30",
        teacherId: 3,
        teacherName: "Mr. Robert Johnson",
        class: "10th Grade A",
        status: "active",
        attachments: ["quadratic_problems.pdf"]
      },
      {
        id: 2,
        subject: "English",
        title: "Essay on Climate Change",
        description: "Write a 500-word essay on the effects of climate change on marine ecosystems.",
        assignedDate: "2025-01-26",
        dueDate: "2025-02-01",
        teacherId: 4,
        teacherName: "Ms. Sarah Wilson",
        class: "10th Grade A",
        status: "active",
        attachments: []
      },
      {
        id: 3,
        subject: "Physics",
        title: "Light and Optics Lab Report",
        description: "Complete the reflection and refraction experiment report with observations.",
        assignedDate: "2025-01-24",
        dueDate: "2025-01-28",
        teacherId: 5,
        teacherName: "Dr. Michael Brown",
        class: "10th Grade A",
        status: "overdue",
        attachments: ["lab_template.docx"]
      },
      {
        id: 4,
        subject: "Chemistry",
        title: "Periodic Table Quiz Preparation",
        description: "Study elements 1-36, their symbols, and atomic numbers for next week's quiz.",
        assignedDate: "2025-01-27",
        dueDate: "2025-02-03",
        teacherId: 6,
        teacherName: "Ms. Emily Davis",
        class: "10th Grade A",
        status: "active",
        attachments: []
      },
      {
        id: 5,
        subject: "History",
        title: "World War II Research Project",
        description: "Research and prepare a presentation on the causes and consequences of World War II. Include timeline and key figures.",
        assignedDate: "2025-01-22",
        dueDate: "2025-02-05",
        teacherId: 7,
        teacherName: "Dr. Amanda Clark",
        class: "10th Grade B",
        status: "active",
        attachments: ["research_guidelines.pdf", "citation_format.docx"]
      },
      {
        id: 6,
        subject: "Biology",
        title: "Cell Structure Diagram",
        description: "Draw and label detailed diagrams of plant and animal cells. Include functions of each organelle.",
        assignedDate: "2025-01-28",
        dueDate: "2025-02-02",
        teacherId: 8,
        teacherName: "Ms. Lisa Rodriguez",
        class: "9th Grade A",
        status: "active",
        attachments: ["cell_template.pdf"]
      },
      {
        id: 7,
        subject: "Computer Science",
        title: "Python Programming - Loops Practice",
        description: "Complete exercises 5-12 from the Python workbook. Submit your code files.",
        assignedDate: "2025-01-26",
        dueDate: "2025-01-31",
        teacherId: 9,
        teacherName: "Mr. David Kumar",
        class: "11th Grade A",
        status: "active",
        attachments: ["python_exercises.zip"]
      },
      {
        id: 8,
        subject: "Geography",
        title: "Climate Zones Map Activity",
        description: "Create a detailed map showing different climate zones of India with explanations.",
        assignedDate: "2025-01-23",
        dueDate: "2025-01-29",
        teacherId: 10,
        teacherName: "Mrs. Priya Sharma",
        class: "8th Grade A",
        status: "submitted_late",
        attachments: ["india_outline_map.pdf"]
      }
    ];
  }

  async createHomework(homework: any): Promise<any> {
    return { id: Date.now(), ...homework, createdAt: new Date() };
  }

  async getResults(): Promise<any[]> {
    return [
      {
        id: 1,
        studentId: 1,
        studentName: "Alice Johnson",
        class: "10th Grade A",
        subject: "Mathematics",
        examType: "Unit Test 1",
        marks: 85,
        totalMarks: 100,
        grade: "A",
        percentage: 85.0,
        examDate: "2025-01-15",
        teacherId: 3,
        teacherName: "Mr. Robert Johnson",
        remarks: "Excellent understanding of concepts"
      },
      {
        id: 2,
        studentId: 1,
        studentName: "Alice Johnson",
        class: "10th Grade A",
        subject: "English",
        examType: "Unit Test 1",
        marks: 78,
        totalMarks: 100,
        grade: "B+",
        percentage: 78.0,
        examDate: "2025-01-16",
        teacherId: 4,
        teacherName: "Ms. Sarah Wilson",
        remarks: "Good vocabulary, needs improvement in grammar"
      },
      {
        id: 3,
        studentId: 1,
        studentName: "Alice Johnson",
        class: "10th Grade A",
        subject: "Physics",
        examType: "Unit Test 1",
        marks: 92,
        totalMarks: 100,
        grade: "A+",
        percentage: 92.0,
        examDate: "2025-01-17",
        teacherId: 5,
        teacherName: "Dr. Michael Brown",
        remarks: "Outstanding performance in practical applications"
      },
      {
        id: 4,
        studentId: 2,
        studentName: "Bob Smith",
        class: "10th Grade B",
        subject: "Mathematics",
        examType: "Unit Test 1",
        marks: 74,
        totalMarks: 100,
        grade: "B",
        percentage: 74.0,
        examDate: "2025-01-15",
        teacherId: 3,
        teacherName: "Mr. Robert Johnson",
        remarks: "Needs more practice with complex problems"
      },
      {
        id: 5,
        studentId: 3,
        studentName: "Carol Davis",
        class: "9th Grade A",
        subject: "Biology",
        examType: "Monthly Test",
        marks: 88,
        totalMarks: 100,
        grade: "A",
        percentage: 88.0,
        examDate: "2025-01-20",
        teacherId: 8,
        teacherName: "Ms. Lisa Rodriguez",
        remarks: "Strong practical knowledge and lab skills"
      },
      {
        id: 6,
        studentId: 4,
        studentName: "David Wilson",
        class: "11th Grade A",
        subject: "Computer Science",
        examType: "Programming Test",
        marks: 95,
        totalMarks: 100,
        grade: "A+",
        percentage: 95.0,
        examDate: "2025-01-18",
        teacherId: 9,
        teacherName: "Mr. David Kumar",
        remarks: "Exceptional coding skills and logical thinking"
      },
      {
        id: 7,
        studentId: 5,
        studentName: "Emma Thompson",
        class: "8th Grade A",
        subject: "Geography",
        examType: "Unit Test 2",
        marks: 82,
        totalMarks: 100,
        grade: "A",
        percentage: 82.0,
        examDate: "2025-01-19",
        teacherId: 10,
        teacherName: "Mrs. Priya Sharma",
        remarks: "Good map reading skills, excellent project work"
      },
      {
        id: 8,
        studentId: 6,
        studentName: "Frank Miller",
        class: "10th Grade B",
        subject: "History",
        examType: "Quarterly Exam",
        marks: 76,
        totalMarks: 100,
        grade: "B+",
        percentage: 76.0,
        examDate: "2025-01-21",
        teacherId: 7,
        teacherName: "Dr. Amanda Clark",
        remarks: "Strong analytical skills, needs to improve essay writing"
      }
    ];
  }

  async createResult(result: any): Promise<any> {
    return { id: Date.now(), ...result, createdAt: new Date() };
  }

  async getTimetable(): Promise<any[]> {
    return [
      {
        id: 1,
        class: "10th Grade A",
        day: "Monday",
        periods: [
          { period: 1, time: "8:00-8:45", subject: "Mathematics", teacher: "Mr. Robert Johnson", room: "101" },
          { period: 2, time: "8:45-9:30", subject: "English", teacher: "Ms. Sarah Wilson", room: "102" },
          { period: 3, time: "9:30-10:15", subject: "Physics", teacher: "Dr. Michael Brown", room: "Lab 1" },
          { period: 4, time: "10:30-11:15", subject: "Chemistry", teacher: "Ms. Emily Davis", room: "Lab 2" },
          { period: 5, time: "11:15-12:00", subject: "History", teacher: "Mr. David Lee", room: "103" },
          { period: 6, time: "1:00-1:45", subject: "Geography", teacher: "Ms. Lisa Anderson", room: "104" },
          { period: 7, time: "1:45-2:30", subject: "Physical Education", teacher: "Coach Mark Wilson", room: "Gym" }
        ]
      },
      {
        id: 2,
        class: "10th Grade A",
        day: "Tuesday",
        periods: [
          { period: 1, time: "8:00-8:45", subject: "English", teacher: "Ms. Sarah Wilson", room: "102" },
          { period: 2, time: "8:45-9:30", subject: "Mathematics", teacher: "Mr. Robert Johnson", room: "101" },
          { period: 3, time: "9:30-10:15", subject: "Biology", teacher: "Dr. Jennifer Clark", room: "Lab 3" },
          { period: 4, time: "10:30-11:15", subject: "Computer Science", teacher: "Mr. Alex Kumar", room: "Computer Lab" },
          { period: 5, time: "11:15-12:00", subject: "Art", teacher: "Ms. Maria Garcia", room: "Art Room" },
          { period: 6, time: "1:00-1:45", subject: "Music", teacher: "Mr. James Rodriguez", room: "Music Room" },
          { period: 7, time: "1:45-2:30", subject: "Study Hall", teacher: "Various", room: "Library" }
        ]
      }
    ];
  }

  async getAttendanceRecords(): Promise<any[]> {
    return [
      {
        id: 1,
        studentId: 1,
        studentName: "Alice Johnson",
        class: "10th Grade A",
        date: "2025-01-27",
        status: "present",
        period: "full_day",
        markedBy: "Ms. Sarah Wilson",
        markedAt: "2025-01-27T08:15:00Z",
        remarks: ""
      },
      {
        id: 2,
        studentId: 1,
        studentName: "Alice Johnson",
        class: "10th Grade A",
        date: "2025-01-26",
        status: "absent",
        period: "full_day",
        markedBy: "Ms. Sarah Wilson",
        markedAt: "2025-01-26T08:15:00Z",
        remarks: "Sick leave - fever"
      },
      {
        id: 3,
        studentId: 2,
        studentName: "Bob Smith",
        class: "10th Grade B",
        date: "2025-01-27",
        status: "present",
        period: "full_day",
        markedBy: "Mr. Robert Johnson",
        markedAt: "2025-01-27T08:10:00Z",
        remarks: ""
      },
      {
        id: 4,
        studentId: 3,
        studentName: "Carol Brown",
        class: "9th Grade A",
        date: "2025-01-27",
        status: "late",
        period: "full_day",
        markedBy: "Dr. Michael Brown",
        markedAt: "2025-01-27T09:30:00Z",
        remarks: "Arrived at 9:30 AM due to transport delay"
      }
    ];
  }

  async getPayrollData(): Promise<any[]> {
    return [
      {
        id: 1,
        employeeId: 3,
        employeeName: "Mr. Robert Johnson",
        designation: "Mathematics Teacher",
        department: "Academic",
        basicSalary: 45000,
        allowances: {
          houseRent: 13500,
          transport: 3000,
          medical: 2000,
          special: 1500
        },
        deductions: {
          tax: 4200,
          providentFund: 2250,
          insurance: 800
        },
        netSalary: 58750,
        payMonth: "January 2025",
        payDate: "2025-01-31",
        status: "processed",
        bankAccount: "****1234",
        workingDays: 22,
        presentDays: 22,
        leavesTaken: 0
      },
      {
        id: 2,
        employeeId: 4,
        employeeName: "Ms. Sarah Wilson",
        designation: "English Teacher",
        department: "Academic",
        basicSalary: 42000,
        allowances: {
          houseRent: 12600,
          transport: 3000,
          medical: 2000,
          special: 1400
        },
        deductions: {
          tax: 3800,
          providentFund: 2100,
          insurance: 800
        },
        netSalary: 54300,
        payMonth: "January 2025",
        payDate: "2025-01-31",
        status: "processed",
        bankAccount: "****5678",
        workingDays: 22,
        presentDays: 21,
        leavesTaken: 1
      },
      {
        id: 3,
        employeeId: 7,
        employeeName: "Ms. Jennifer Martinez",
        designation: "Accountant",
        department: "Administration",
        basicSalary: 38000,
        allowances: {
          houseRent: 11400,
          transport: 2500,
          medical: 2000,
          special: 1100
        },
        deductions: {
          tax: 3200,
          providentFund: 1900,
          insurance: 750
        },
        netSalary: 49150,
        payMonth: "January 2025",
        payDate: "2025-01-31",
        status: "pending",
        bankAccount: "****9012",
        workingDays: 22,
        presentDays: 22,
        leavesTaken: 0
      },
      {
        id: 4,
        employeeId: 5,
        employeeName: "Dr. Michael Brown",
        designation: "Physics Teacher & Lab Coordinator",
        department: "Academic",
        basicSalary: 48000,
        allowances: {
          houseRent: 14400,
          transport: 3500,
          medical: 2500,
          special: 2000
        },
        deductions: {
          tax: 4800,
          providentFund: 2400,
          insurance: 900
        },
        netSalary: 62300,
        payMonth: "January 2025",
        payDate: "2025-01-31",
        status: "processed",
        bankAccount: "****3456",
        workingDays: 22,
        presentDays: 22,
        leavesTaken: 0
      },
      {
        id: 5,
        employeeId: 8,
        employeeName: "Ms. Lisa Rodriguez",
        designation: "Biology Teacher",
        department: "Academic",
        basicSalary: 43000,
        allowances: {
          houseRent: 12900,
          transport: 3000,
          medical: 2000,
          special: 1500
        },
        deductions: {
          tax: 4000,
          providentFund: 2150,
          insurance: 800
        },
        netSalary: 55450,
        payMonth: "January 2025",
        payDate: "2025-01-31",
        status: "processed",
        bankAccount: "****7890",
        workingDays: 22,
        presentDays: 21,
        leavesTaken: 1
      },
      {
        id: 6,
        employeeId: 11,
        employeeName: "Mr. James Wilson",
        designation: "Physical Education Teacher",
        department: "Sports",
        basicSalary: 35000,
        allowances: {
          houseRent: 10500,
          transport: 2500,
          medical: 1800,
          special: 1000
        },
        deductions: {
          tax: 2800,
          providentFund: 1750,
          insurance: 700
        },
        netSalary: 45550,
        payMonth: "January 2025",
        payDate: "2025-01-31",
        status: "processed",
        bankAccount: "****2468",
        workingDays: 22,
        presentDays: 22,
        leavesTaken: 0
      }
    ];
  }

  async getReportsData(): Promise<any[]> {
    return [
      {
        id: 1,
        reportType: "Academic Performance",
        title: "Class 10A Mathematics Performance Analysis",
        generatedBy: "Mr. Robert Johnson",
        generatedDate: "2025-01-25",
        period: "January 2025",
        data: {
          totalStudents: 35,
          averageMarks: 78.5,
          passPercentage: 94.3,
          gradeDistribution: {
            "A+": 8,
            "A": 12,
            "B+": 10,
            "B": 3,
            "C": 2,
            "F": 0
          }
        },
        status: "completed"
      },
      {
        id: 2,
        reportType: "Attendance Summary",
        title: "Monthly Attendance Report - January 2025",
        generatedBy: "Ms. Sarah Wilson",
        generatedDate: "2025-01-27",
        period: "January 2025",
        data: {
          totalStudents: 150,
          averageAttendance: 92.8,
          totalWorkingDays: 22,
          presentDays: 3036,
          absentDays: 234,
          lateArrivals: 45
        },
        status: "completed"
      },
      {
        id: 3,
        reportType: "Fee Collection",
        title: "Fee Collection Status - Q3 2024-25",
        generatedBy: "Ms. Jennifer Martinez",
        generatedDate: "2025-01-20",
        period: "Q3 2024-25",
        data: {
          totalAmount: 2250000,
          collectedAmount: 1980000,
          pendingAmount: 270000,
          collectionPercentage: 88.0,
          overdueAccounts: 12
        },
        status: "completed"
      }
    ];
  }

  async getDashboardData(userRole: string): Promise<any> {
    const baseData = {
      totalStudents: 450,
      totalTeachers: 28,
      totalClasses: 18,
      totalSubjects: 12
    };

    switch (userRole) {
      case 'student':
        return {
          ...baseData,
          myHomework: 3,
          pendingAssignments: 1,
          upcomingExams: 2,
          attendancePercentage: 94.5,
          recentResults: [
            { subject: "Mathematics", marks: 85, grade: "A" },
            { subject: "Physics", marks: 92, grade: "A+" }
          ],
          notices: [
            { title: "Sports Day", date: "2025-02-05", type: "event" },
            { title: "Parent-Teacher Meeting", date: "2025-02-10", type: "meeting" }
          ]
        };
      
      case 'class_teacher':
      case 'subject_teacher':
        return {
          ...baseData,
          myClasses: userRole === 'class_teacher' ? 2 : 4,
          totalAssignments: 12,
          pendingGrades: 8,
          averageClassPerformance: 78.5,
          todaySchedule: [
            { period: 1, subject: "Mathematics", class: "10A", time: "8:00-8:45" },
            { period: 3, subject: "Mathematics", class: "10B", time: "9:30-10:15" }
          ],
          recentSubmissions: 15
        };
      
      case 'accountant':
        return {
          ...baseData,
          totalFeeCollection: 1980000,
          pendingFees: 270000,
          collectionPercentage: 88.0,
          overdueAccounts: 12,
          monthlyPayroll: 156000,
          pendingPayments: 3,
          recentTransactions: [
            { student: "Alice Johnson", amount: 15000, status: "paid", date: "2025-01-25" },
            { student: "Bob Smith", amount: 15000, status: "pending", date: "2025-01-20" }
          ]
        };
      
      case 'principal':
      case 'admin':
      case 'super_admin':
        return {
          ...baseData,
          overallAttendance: 92.8,
          feeCollectionRate: 88.0,
          staffCount: 35,
          pendingAdmissions: 8,
          recentActivities: [
            { activity: "New teacher joined", time: "2 hours ago", type: "staff" },
            { activity: "Fee payment received", time: "4 hours ago", type: "finance" },
            { activity: "Exam results published", time: "1 day ago", type: "academic" }
          ],
          alerts: [
            { message: "12 students have overdue fees", type: "warning", priority: "medium" },
            { message: "Parent-teacher meeting scheduled", type: "info", priority: "low" }
          ]
        };
      
      default:
        return baseData;
    }
  }

  async getNotices(): Promise<any[]> {
    return [
      {
        id: 1,
        title: "Republic Day Celebration",
        content: "School will celebrate Republic Day on January 26th. Flag hoisting ceremony at 8:00 AM. All students must attend in school uniform.",
        type: "event",
        priority: "high",
        publishedDate: "2025-01-20",
        publishedBy: "Principal",
        targetAudience: ["all"],
        status: "active",
        attachments: ["republic_day_schedule.pdf"]
      },
      {
        id: 2,
        title: "Parent-Teacher Meeting",
        content: "Parent-Teacher Meeting scheduled for February 10th, 2025 from 9:00 AM to 4:00 PM. Parents are requested to meet respective class teachers.",
        type: "meeting",
        priority: "medium",
        publishedDate: "2025-01-22",
        publishedBy: "Academic Coordinator",
        targetAudience: ["parents", "teachers"],
        status: "active",
        attachments: []
      },
      {
        id: 3,
        title: "Annual Sports Day",
        content: "Annual Sports Day will be held on February 15th, 2025. Practice sessions will start from February 1st. Interested students should register with PE teacher.",
        type: "event",
        priority: "medium",
        publishedDate: "2025-01-18",
        publishedBy: "Sports Coordinator",
        targetAudience: ["students", "parents"],
        status: "active",
        attachments: ["sports_day_events.pdf"]
      },
      {
        id: 4,
        title: "Winter Break Holiday Homework",
        content: "Holiday homework has been uploaded to the student portal. Students must complete and submit by January 30th, 2025.",
        type: "academic",
        priority: "high",
        publishedDate: "2025-01-15",
        publishedBy: "Academic Head",
        targetAudience: ["students", "parents"],
        status: "active",
        attachments: ["holiday_homework_list.pdf"]
      },
      {
        id: 5,
        title: "Fee Payment Reminder",
        content: "This is a reminder that Q3 fees are due by January 31st, 2025. Late payment charges will apply after the due date.",
        type: "finance",
        priority: "high",
        publishedDate: "2025-01-24",
        publishedBy: "Accounts Department",
        targetAudience: ["parents"],
        status: "active",
        attachments: []
      }
    ];
  }

  async getStudentAttendance(studentId: number): Promise<any[]> {
    return [
      { date: "2025-01-27", status: "present", period: "full_day", markedBy: "Ms. Sarah Wilson" },
      { date: "2025-01-26", status: "absent", period: "full_day", markedBy: "Ms. Sarah Wilson", reason: "Sick leave" },
      { date: "2025-01-25", status: "present", period: "full_day", markedBy: "Ms. Sarah Wilson" },
      { date: "2025-01-24", status: "present", period: "full_day", markedBy: "Ms. Sarah Wilson" },
      { date: "2025-01-23", status: "late", period: "full_day", markedBy: "Ms. Sarah Wilson", reason: "Transport delay" }
    ];
  }

  async getStudentResults(studentId: number): Promise<any[]> {
    const results = await this.getResults();
    return results.filter((r: any) => r.studentId === studentId);
  }
}

export const storage = new DatabaseStorage();