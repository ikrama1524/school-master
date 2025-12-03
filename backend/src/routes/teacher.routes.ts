
import { Router } from 'express';
import { teacherService } from '../services/teacher.service';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const teachers = await teacherService.getAll();
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch teachers' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const teacher = await teacherService.getById(id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch teacher' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const teacher = await teacherService.create(req.body);
    res.status(201).json(teacher);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create teacher' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const teacher = await teacherService.update(id, req.body);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update teacher' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await teacherService.delete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete teacher' });
  }
});

export default router;
