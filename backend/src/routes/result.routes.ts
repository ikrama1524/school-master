
import { Router } from 'express';
import { db } from '../config/database.js';
import { results } from '../schemas/index.js';
import { eq } from 'drizzle-orm';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const allResults = await db.select().from(results);
    res.json(allResults);
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ message: 'Failed to fetch results' });
  }
});

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const [result] = await db.insert(results).values(req.body).returning();
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating result:', error);
    res.status(500).json({ message: 'Failed to create result' });
  }
});

export default router;
