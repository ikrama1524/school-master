
import { Router } from 'express';
import { db } from '../config/database.js';
import { documents } from '../schemas/index.js';
import { eq } from 'drizzle-orm';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const allDocuments = await db.select().from(documents);
    res.json(allDocuments);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ message: 'Failed to fetch documents' });
  }
});

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const [document] = await db.insert(documents).values(req.body).returning();
    res.status(201).json(document);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ message: 'Failed to create document' });
  }
});

export default router;
