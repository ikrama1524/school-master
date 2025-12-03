
import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull().default('student_parent'),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  assignedClass: text('assigned_class'),
  assignedSubject: text('assigned_subject'),
  permissions: text('permissions').array().default([]),
  isActive: boolean('is_active').default(true),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const students = pgTable('students', {
  id: serial('id').primaryKey(),
  rollNumber: text('roll_number').notNull().unique(),
  admissionNumber: text('admission_number').notNull().unique(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  dateOfBirth: timestamp('date_of_birth').notNull(),
  gender: text('gender').notNull(),
  class: text('class').notNull(),
  section: text('section').notNull(),
  division: text('division').notNull(),
  parentName: text('parent_name').notNull(),
  parentPhone: text('parent_phone').notNull(),
  parentEmail: text('parent_email'),
  address: text('address'),
  previousSchool: text('previous_school'),
  admissionDate: timestamp('admission_date').defaultNow(),
  isActive: boolean('is_active').default(true),
});

export const teachers = pgTable('teachers', {
  id: serial('id').primaryKey(),
  employeeId: text('employee_id').notNull().unique(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  dateOfBirth: timestamp('date_of_birth'),
  gender: text('gender'),
  subject: text('subject'),
  qualification: text('qualification'),
  experience: integer('experience'),
  salary: decimal('salary', { precision: 10, scale: 2 }),
  joinDate: timestamp('join_date').defaultNow(),
  isActive: boolean('is_active').default(true),
});

export const attendance = pgTable('attendance', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => students.id).notNull(),
  date: timestamp('date').notNull(),
  status: text('status').notNull(),
  remarks: text('remarks'),
});

export const fees = pgTable('fees', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => students.id).notNull(),
  feeType: text('fee_type').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp('due_date').notNull(),
  paidDate: timestamp('paid_date'),
  status: text('status').notNull().default('pending'),
  paymentMethod: text('payment_method'),
  remarks: text('remarks'),
  academicYear: text('academic_year'),
  installmentNumber: integer('installment_number').default(1),
  totalInstallments: integer('total_installments').default(1),
});

export const subjects = pgTable('subjects', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  description: text('description'),
  teacherId: integer('teacher_id').references(() => teachers.id),
  class: text('class').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const timetable = pgTable('timetable', {
  id: serial('id').primaryKey(),
  class: text('class').notNull(),
  section: text('section').notNull(),
  day: text('day').notNull(),
  period: integer('period').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  subjectId: integer('subject_id').references(() => subjects.id).notNull(),
  teacherId: integer('teacher_id').references(() => teachers.id).notNull(),
  room: text('room'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const results = pgTable('results', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => students.id).notNull(),
  subjectId: integer('subject_id').references(() => subjects.id).notNull(),
  examType: text('exam_type').notNull(),
  examDate: timestamp('exam_date').notNull(),
  maxMarks: integer('max_marks').notNull(),
  obtainedMarks: integer('obtained_marks').notNull(),
  percentage: decimal('percentage', { precision: 5, scale: 2 }).notNull(),
  grade: text('grade').notNull(),
  remarks: text('remarks'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  documentType: text('document_type').notNull(),
  studentId: integer('student_id').references(() => students.id),
  studentName: text('student_name').notNull(),
  studentClass: text('student_class').notNull(),
  studentSection: text('student_section').notNull(),
  rollNumber: text('roll_number').notNull(),
  purpose: text('purpose'),
  fromDate: timestamp('from_date'),
  toDate: timestamp('to_date'),
  reason: text('reason'),
  parentName: text('parent_name').notNull(),
  parentPhone: text('parent_phone').notNull(),
  transferSchool: text('transfer_school'),
  lastAttendanceDate: timestamp('last_attendance_date'),
  conductGrade: text('conduct_grade').default('Good'),
  status: text('status').notNull().default('pending'),
  issuedBy: integer('issued_by').references(() => users.id),
  issuedDate: timestamp('issued_date'),
  remarks: text('remarks'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertStudentSchema = createInsertSchema(students).omit({ id: true, admissionDate: true });
export const insertTeacherSchema = createInsertSchema(teachers).omit({ id: true, joinDate: true });
export const insertAttendanceSchema = createInsertSchema(attendance).omit({ id: true });
export const insertFeeSchema = createInsertSchema(fees).omit({ id: true });
export const insertTimetableSchema = createInsertSchema(timetable).omit({ id: true, createdAt: true });
export const insertResultSchema = createInsertSchema(results).omit({ id: true, createdAt: true });

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
export type Timetable = typeof timetable.$inferSelect;
export type InsertTimetable = z.infer<typeof insertTimetableSchema>;
export type Result = typeof results.$inferSelect;
export type InsertResult = z.infer<typeof insertResultSchema>;
export type Subject = typeof subjects.$inferSelect;
export type Document = typeof documents.$inferSelect;
