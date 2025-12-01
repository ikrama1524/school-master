
import { Router } from 'express';
import { db } from '../config/database.js';
import { timetable } from '../schemas/index.js';
import { eq } from 'drizzle-orm';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const allTimetables = await db.select().from(timetable);
    res.json(allTimetables);
  } catch (error) {
    console.error('Error fetching timetables:', error);
    res.status(500).json({ message: 'Failed to fetch timetables' });
  }
});

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const [entry] = await db.insert(timetable).values(req.body).returning();
    res.status(201).json(entry);
  } catch (error) {
    console.error('Error creating timetable:', error);
    res.status(500).json({ message: 'Failed to create timetable' });
  }
});

export default router;
