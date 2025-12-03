
import { Router, Request, Response } from 'express';
import { studentService } from '../services/student.service.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const students = await studentService.getAll();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch students' });
  }
});

router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const student = await studentService.getById(id);
    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch student' });
  }
});

router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const student = await studentService.create(req.body);
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create student' });
  }
});

router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const student = await studentService.update(id, req.body);
    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update student' });
  }
});

router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await studentService.delete(id);
    if (!deleted) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete student' });
  }
});

export default router;
