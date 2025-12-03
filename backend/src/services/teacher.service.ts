
import { db } from '../config/database';
import { teachers, type Teacher, type InsertTeacher } from '../schemas';
import { eq } from 'drizzle-orm';

export class TeacherService {
  async getAll(): Promise<Teacher[]> {
    return await db.select().from(teachers);
  }

  async getById(id: number): Promise<Teacher | undefined> {
    const [teacher] = await db.select().from(teachers).where(eq(teachers.id, id));
    return teacher || undefined;
  }

  async create(data: InsertTeacher): Promise<Teacher> {
    const employeeId = data.employeeId || `TCH${String(Date.now()).slice(-3)}`;
    const [teacher] = await db
      .insert(teachers)
      .values({ ...data, employeeId })
      .returning();
    return teacher;
  }

  async update(id: number, data: Partial<Teacher>): Promise<Teacher | undefined> {
    const [teacher] = await db
      .update(teachers)
      .set(data)
      .where(eq(teachers.id, id))
      .returning();
    return teacher || undefined;
  }

  async delete(id: number): Promise<boolean> {
    const result = await db.delete(teachers).where(eq(teachers.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
}

export const teacherService = new TeacherService();
