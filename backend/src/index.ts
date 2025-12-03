import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import studentRoutes from './routes/student.routes.js';
import teacherRoutes from './routes/teacher.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import feeRoutes from './routes/fee.routes.js';
import resultRoutes from './routes/result.routes.js';
import documentRoutes from './routes/document.routes.js';
import timetableRoutes from './routes/timetable.routes.js';
import admissionRoutes from './routes/admission.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/admissions', admissionRoutes);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on http://0.0.0.0:${PORT}`);
});