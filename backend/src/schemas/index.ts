
import { pgTable, text, serial, integer, boolean, timestamp, decimal } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull().default('student'),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  isActive: boolean('is_active').default(true),
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
  admissionDate: timestamp('admission_date').defaultNow(),
  isActive: boolean('is_active').default(true),
});

// Add other tables as needed (teachers, attendance, fees, etc.)
