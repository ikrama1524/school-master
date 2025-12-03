import { Router } from 'express';
import { db } from '../config/database.js';
import { teachers } from '../schemas/index.js';
import { eq } from 'drizzle-orm';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const allTeachers = await db.select().from(teachers);
    res.json(allTeachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ message: 'Failed to fetch teachers' });
  }
});

router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const [teacher] = await db.select().from(teachers).where(eq(teachers.id, id));

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.json(teacher);
  } catch (error) {
    console.error('Error fetching teacher:', error);
    res.status(500).json({ message: 'Failed to fetch teacher' });
  }
});

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const [teacher] = await db.insert(teachers).values(req.body).returning();
    res.status(201).json(teacher);
  } catch (error) {
    console.error('Error creating teacher:', error);
    res.status(500).json({ message: 'Failed to create teacher' });
  }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const [teacher] = await db.update(teachers).set(req.body).where(eq(teachers.id, id)).returning();

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.json(teacher);
  } catch (error) {
    console.error('Error updating teacher:', error);
    res.status(500).json({ message: 'Failed to update teacher' });
  }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(teachers).where(eq(teachers.id, id));
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({ message: 'Failed to delete teacher' });
  }
});

export default router;