
import { Router } from 'express';
import { studentService } from '../services/student.service';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const students = await studentService.getAll();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch students' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const student = await studentService.getById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch student' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const student = await studentService.create(req.body);
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create student' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const student = await studentService.update(id, req.body);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update student' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await studentService.delete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete student' });
  }
});

export default router;
