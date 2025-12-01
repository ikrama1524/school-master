
# School Management System - Backend

This is the backend API server for the School Management System.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
- Copy `.env.example` to `.env`
- Fill in your Supabase credentials

3. Push database schema:
```bash
npm run db:push
```

4. Start development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- POST `/api/auth/login` - User login
- GET `/api/auth/me` - Get current user
- POST `/api/auth/logout` - User logout

### Students
- GET `/api/students` - Get all students
- GET `/api/students/:id` - Get student by ID
- POST `/api/students` - Create student
- PUT `/api/students/:id` - Update student
- DELETE `/api/students/:id` - Delete student

### Teachers
- Similar CRUD endpoints as students

### Attendance, Fees, Results, etc.
- Each module has its own set of endpoints

## Environment Variables

See `.env.example` for required environment variables.

## Port

Backend runs on port **5000** by default.
