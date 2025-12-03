
import { db } from '../config/database';
import { students, type Student, type InsertStudent } from '../schemas';
import { eq } from 'drizzle-orm';

export class StudentService {
  async getAll(): Promise<Student[]> {
    return await db.select().from(students);
  }

  async getById(id: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student || undefined;
  }

  async create(data: InsertStudent): Promise<Student> {
    const [student] = await db.insert(students).values(data).returning();
    return student;
  }

  async update(id: number, data: Partial<Student>): Promise<Student | undefined> {
    const [student] = await db
      .update(students)
      .set(data)
      .where(eq(students.id, id))
      .returning();
    return student || undefined;
  }

  async delete(id: number): Promise<boolean> {
    const result = await db.delete(students).where(eq(students.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
}

export const studentService = new StudentService();
