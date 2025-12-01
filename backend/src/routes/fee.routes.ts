
import { Router } from 'express';
import { db } from '../config/database.js';
import { fees } from '../schemas/index.js';
import { eq } from 'drizzle-orm';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const allFees = await db.select().from(fees);
    res.json(allFees);
  } catch (error) {
    console.error('Error fetching fees:', error);
    res.status(500).json({ message: 'Failed to fetch fees' });
  }
});

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const [fee] = await db.insert(fees).values(req.body).returning();
    res.status(201).json(fee);
  } catch (error) {
    console.error('Error creating fee:', error);
    res.status(500).json({ message: 'Failed to create fee' });
  }
});

export default router;
