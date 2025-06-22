import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb, varchar, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("admin"), // admin, teacher, student, parent
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  rollNumber: text("roll_number").notNull().unique(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  dateOfBirth: timestamp("date_of_birth").notNull(),
  gender: text("gender").notNull(),
  class: text("class").notNull(),
  section: text("section").notNull(),
  parentName: text("parent_name").notNull(),
  parentPhone: text("parent_phone").notNull(),
  parentEmail: text("parent_email"),
  address: text("address"),
  admissionDate: timestamp("admission_date").defaultNow(),
  isActive: boolean("is_active").default(true),
});

export const teachers = pgTable("teachers", {
  id: serial("id").primaryKey(),
  employeeId: text("employee_id").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  dateOfBirth: timestamp("date_of_birth"),
  gender: text("gender"),
  subject: text("subject"),
  qualification: text("qualification"),
  experience: integer("experience"),
  salary: decimal("salary", { precision: 10, scale: 2 }),
  joinDate: timestamp("join_date").defaultNow(),
  isActive: boolean("is_active").default(true),
});

export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  date: timestamp("date").notNull(),
  status: text("status").notNull(), // present, absent, late
  remarks: text("remarks"),
});

export const fees = pgTable("fees", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  feeType: text("fee_type").notNull(), // tuition, transport, library, etc.
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  paidDate: timestamp("paid_date"),
  status: text("status").notNull().default("pending"), // pending, paid, overdue
  paymentMethod: text("payment_method"), // cash, card, online
  remarks: text("remarks"),
});

export const notices = pgTable("notices", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  priority: text("priority").notNull().default("normal"), // low, normal, high, urgent
  targetAudience: text("target_audience").notNull(), // all, students, teachers, parents
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  description: text("description"),
  teacherId: integer("teacher_id").references(() => teachers.id),
  class: text("class").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const assignments = pgTable("assignments", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  subjectId: integer("subject_id").references(() => subjects.id).notNull(),
  teacherId: integer("teacher_id").references(() => teachers.id).notNull(),
  class: text("class").notNull(),
  dueDate: timestamp("due_date").notNull(),
  totalMarks: integer("total_marks").notNull(),
  status: text("status").notNull().default("active"), // active, closed, archived
  attachments: text("attachments").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  assignmentId: integer("assignment_id").references(() => assignments.id).notNull(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  content: text("content"),
  attachments: text("attachments").array(),
  submittedAt: timestamp("submitted_at").defaultNow(),
  grade: integer("grade"),
  feedback: text("feedback"),
  status: text("status").notNull().default("submitted"), // submitted, graded, returned
});

export const timetable = pgTable("timetable", {
  id: serial("id").primaryKey(),
  class: text("class").notNull(),
  section: text("section").notNull(),
  day: text("day").notNull(), // monday, tuesday, etc.
  period: integer("period").notNull(), // 1, 2, 3, etc.
  startTime: text("start_time").notNull(), // "09:00"
  endTime: text("end_time").notNull(), // "09:45"
  subjectId: integer("subject_id").references(() => subjects.id).notNull(),
  teacherId: integer("teacher_id").references(() => teachers.id).notNull(),
  room: text("room"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  type: text("type").notNull(), // class, exam, holiday, meeting, event
  class: text("class"), // null for school-wide events
  subjectId: integer("subject_id").references(() => subjects.id),
  teacherId: integer("teacher_id").references(() => teachers.id),
  location: text("location"),
  color: text("color").default("#3b82f6"),
  isAllDay: boolean("is_all_day").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const monthlyTimetables = pgTable("monthly_timetables", {
  id: serial("id").primaryKey(),
  class: text("class").notNull(),
  month: text("month").notNull(), // Format: YYYY-MM
  timetableData: text("timetable_data").notNull(), // Stores the complete monthly schedule as JSON
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const periods = pgTable("periods", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  periodNumber: integer("period_number").notNull(),
  isBreak: boolean("is_break").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  admissionDate: true,
}).extend({
  rollNumber: z.string().optional(),
  dateOfBirth: z.string().transform((str) => new Date(str)),
});

export const insertTeacherSchema = createInsertSchema(teachers).omit({
  id: true,
  joinDate: true,
}).extend({
  employeeId: z.string().optional(),
  dateOfBirth: z.string().transform((str) => new Date(str)).optional(),
  experience: z.string().transform((str) => parseInt(str)).optional(),
  salary: z.string().optional(),
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
});

export const insertFeeSchema = createInsertSchema(fees).omit({
  id: true,
});

export const insertNoticeSchema = createInsertSchema(notices).omit({
  id: true,
  createdAt: true,
});

export const insertSubjectSchema = createInsertSchema(subjects).omit({
  id: true,
  createdAt: true,
});

export const insertAssignmentSchema = createInsertSchema(assignments).omit({
  id: true,
  createdAt: true,
}).extend({
  dueDate: z.string().transform((str) => new Date(str)),
});

export const insertSubmissionSchema = createInsertSchema(submissions).omit({
  id: true,
  submittedAt: true,
});

export const insertTimetableSchema = createInsertSchema(timetable).omit({
  id: true,
  createdAt: true,
});

export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({
  id: true,
  createdAt: true,
}).extend({
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
});

export const insertMonthlyTimetableSchema = createInsertSchema(monthlyTimetables).omit({
  id: true,
  createdAt: true,
});

export const insertPeriodSchema = createInsertSchema(periods).omit({
  id: true,
  createdAt: true,
});

export const results = pgTable("results", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  subjectId: integer("subject_id").references(() => subjects.id).notNull(),
  examType: text("exam_type").notNull(),
  examDate: timestamp("exam_date").notNull(),
  maxMarks: integer("max_marks").notNull(),
  obtainedMarks: integer("obtained_marks").notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
  grade: text("grade").notNull(),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const exams = pgTable("exams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  class: text("class").notNull(),
  section: text("section").notNull(),
  subjects: integer("subjects").array(),
  maxMarks: integer("max_marks").notNull(),
  status: text("status").default("upcoming"),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const semesters = pgTable("semesters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  academicYear: text("academic_year").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const semesterResults = pgTable("semester_results", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  semesterId: integer("semester_id").references(() => semesters.id).notNull(),
  subjectId: integer("subject_id").references(() => subjects.id).notNull(),
  internalMarks: integer("internal_marks").default(0),
  externalMarks: integer("external_marks").default(0),
  totalMarks: integer("total_marks").notNull(),
  obtainedMarks: integer("obtained_marks").notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
  grade: text("grade").notNull(),
  gpa: decimal("gpa", { precision: 3, scale: 2 }),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertResultSchema = createInsertSchema(results).omit({
  id: true,
  createdAt: true,
});

export const insertExamSchema = createInsertSchema(exams).omit({
  id: true,
  createdAt: true,
});

export const insertSemesterSchema = createInsertSchema(semesters).omit({
  id: true,
  createdAt: true,
});

export const insertSemesterResultSchema = createInsertSchema(semesterResults).omit({
  id: true,
  createdAt: true,
});

// Documents table for certificate and application management
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  documentType: text("document_type").notNull(), // leaving_certificate, transfer_certificate, bonafide_certificate, leave_application, etc.
  studentId: integer("student_id").references(() => students.id),
  studentName: text("student_name").notNull(),
  studentClass: text("student_class").notNull(),
  studentSection: text("student_section").notNull(),
  rollNumber: text("roll_number").notNull(),
  purpose: text("purpose"), // Purpose for bonafide certificate, etc.
  fromDate: timestamp("from_date"), // For leave applications
  toDate: timestamp("to_date"), // For leave applications
  reason: text("reason"), // Reason for leave or transfer
  parentName: text("parent_name").notNull(),
  parentPhone: text("parent_phone").notNull(),
  transferSchool: text("transfer_school"), // For transfer certificate
  lastAttendanceDate: timestamp("last_attendance_date"), // For leaving certificate
  conductGrade: text("conduct_grade").default("Good"), // A, B, C, Excellent, Good, Fair
  status: text("status").notNull().default("pending"), // pending, approved, rejected, issued
  issuedBy: integer("issued_by").references(() => users.id),
  issuedDate: timestamp("issued_date"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;

export type Teacher = typeof teachers.$inferSelect;
export type InsertTeacher = z.infer<typeof insertTeacherSchema>;

export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;

export type Fee = typeof fees.$inferSelect;
export type InsertFee = z.infer<typeof insertFeeSchema>;

export type Notice = typeof notices.$inferSelect;
export type InsertNotice = z.infer<typeof insertNoticeSchema>;

export type Subject = typeof subjects.$inferSelect;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;

export type Assignment = typeof assignments.$inferSelect;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;

export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;

export type Timetable = typeof timetable.$inferSelect;
export type InsertTimetable = z.infer<typeof insertTimetableSchema>;

export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;

export type MonthlyTimetable = typeof monthlyTimetables.$inferSelect;
export type InsertMonthlyTimetable = z.infer<typeof insertMonthlyTimetableSchema>;

export type Period = typeof periods.$inferSelect;
export type InsertPeriod = z.infer<typeof insertPeriodSchema>;

export type Result = typeof results.$inferSelect;
export type InsertResult = z.infer<typeof insertResultSchema>;

export type Exam = typeof exams.$inferSelect;
export type InsertExam = z.infer<typeof insertExamSchema>;

export type Semester = typeof semesters.$inferSelect;
export type InsertSemester = z.infer<typeof insertSemesterSchema>;

export type SemesterResult = typeof semesterResults.$inferSelect;
export type InsertSemesterResult = z.infer<typeof insertSemesterResultSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

// Role-Module Access Control Tables
export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  route: varchar("route", { length: 100 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const roleModules = pgTable("role_modules", {
  id: serial("id").primaryKey(),
  role: varchar("role", { length: 50 }).notNull(),
  moduleId: integer("module_id").notNull().references(() => modules.id),
  canRead: boolean("can_read").default(true),
  canWrite: boolean("can_write").default(false),
  canDelete: boolean("can_delete").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertModuleSchema = createInsertSchema(modules).omit({
  id: true,
  createdAt: true,
});

export const insertRoleModuleSchema = createInsertSchema(roleModules).omit({
  id: true,
  createdAt: true,
});

export type Module = typeof modules.$inferSelect;
export type InsertModule = z.infer<typeof insertModuleSchema>;

export type RoleModule = typeof roleModules.$inferSelect;
export type InsertRoleModule = z.infer<typeof insertRoleModuleSchema>;
