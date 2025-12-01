import { Router } from 'express';
import { db } from '../config/database.js';
import { attendance } from '../schemas/index.js';
import { eq } from 'drizzle-orm';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const allAttendance = await db.select().from(attendance);
    res.json(allAttendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Failed to fetch attendance' });
  }
});

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const [record] = await db.insert(attendance).values(req.body).returning();
    res.status(201).json(record);
  } catch (error) {
    console.error('Error creating attendance:', error);
    res.status(500).json({ message: 'Failed to create attendance' });
  }
});

export default router;