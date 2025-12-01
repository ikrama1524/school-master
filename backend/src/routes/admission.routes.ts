
import { Router } from 'express';
import { db } from '../config/database.js';
import { students } from '../schemas/index.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const [student] = await db.insert(students).values(req.body).returning();
    res.status(201).json(student);
  } catch (error) {
    console.error('Error creating admission:', error);
    res.status(500).json({ message: 'Failed to create admission' });
  }
});

export default router;
