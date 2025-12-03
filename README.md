
# School Management System - Local Development Setup

A comprehensive school management system split into two independent modules for local development and mobile app integration.

## Project Structure

```
project/
├── backend/          # Node.js/Express REST API
│   ├── src/
│   │   ├── routes/   # API endpoints
│   │   ├── services/ # Business logic
│   │   ├── schemas/  # Database models
│   │   └── middleware/
│   └── README.md
└── frontend/         # React/TypeScript UI
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   └── services/
    └── README.md
```

---

## Prerequisites

- **Node.js** v18 or higher
- **npm** (comes with Node.js)
- **PostgreSQL** database (local, Neon, Supabase, or Railway)

---

## Quick Start (Both Apps)

### Step 1: Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your database credentials:
# DATABASE_URL=postgresql://user:password@localhost:5432/school_db
# JWT_SECRET=your_secure_random_secret_key_here
# PORT=5000
# FRONTEND_URL=http://localhost:5173

# Push database schema
npm run db:push

# Initialize test users
npm run db:init

# Start backend
npm run dev
```

Backend runs at: `http://localhost:5000`

### Step 2: Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env:
# VITE_API_URL=http://localhost:5000/api

# Start frontend
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Test Credentials

| Role | Username | Password |
|------|----------|----------|
| Super Admin | admin | admin123 |
| Principal | principal | principal123 |
| Class Teacher | teacher | teacher123 |
| Subject Teacher | subject_teacher | subject123 |
| Accountant | accountant | accountant123 |
| Student/Parent | student | student123 |
| Staff | staff | staff123 |

---

## API Documentation (21 Endpoints)

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout |

### Students
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/students` | List all students |
| GET | `/api/students/:id` | Get student by ID |
| POST | `/api/students` | Create student |
| PUT | `/api/students/:id` | Update student |
| DELETE | `/api/students/:id` | Delete student |

### Teachers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/teachers` | List all teachers |
| GET | `/api/teachers/:id` | Get teacher by ID |
| POST | `/api/teachers` | Create teacher |
| PUT | `/api/teachers/:id` | Update teacher |

### Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/attendance` | Get attendance records |
| POST | `/api/attendance` | Mark attendance |

### Fees
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/fees` | List fee records |
| GET | `/api/fees/student/:id` | Get student fees |
| POST | `/api/fees` | Create fee record |

### Timetable
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/timetable` | Get all timetables |
| GET | `/api/timetable/class/:class` | Get class timetable |

### Results
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/results/student/:id` | Get student results |

---

## Role-Based Access Control (RBAC)

| Role | Access Level |
|------|-------------|
| super_admin | Full access to all modules |
| admin | Full access to all modules |
| principal | Full access to all modules |
| class_teacher | Read/write to assigned class |
| subject_teacher | Read/write to subject modules |
| accountant | Full access to fees/payroll |
| **student_parent** | **Read-only access to own data** |
| non_teaching | Limited access |

**Note for Mobile App:** The `student_parent` role is read-only and can only access their own data via the authenticated endpoints.

---

## Mobile App Integration

The backend API is designed for mobile app integration:

1. **Authentication**: Use `/api/auth/login` to get JWT token
2. **Authorization**: Include token in `Authorization: Bearer <token>` header
3. **Student Role**: Limited to read-only endpoints for their own data

Example API call from mobile:
```javascript
// Login
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'student', password: 'student123' })
});
const { token } = await response.json();

// Use token for subsequent requests
const meResponse = await fetch('http://localhost:5000/api/auth/me', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## Scripts Reference

### Backend (`cd backend`)
| Command | Description |
|---------|-------------|
| `npm run dev` | Start with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:push` | Push schema to database |
| `npm run db:init` | Initialize test users |

### Frontend (`cd frontend`)
| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## Troubleshooting

### Database Connection Error
1. Verify PostgreSQL is running
2. Check `DATABASE_URL` format: `postgresql://user:password@host:port/database`
3. Ensure the database exists

### CORS Error
1. Set `FRONTEND_URL=http://localhost:5173` in backend `.env`
2. Restart backend after changing `.env`

### JWT Token Issues
1. Ensure `JWT_SECRET` is set in backend `.env`
2. Token format: `Authorization: Bearer <token>`
3. Tokens expire after 7 days

### Port Already in Use
```bash
# Find and kill process on port 5000
lsof -i :5000
kill -9 <PID>
```

### Clean Install
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Project Independence

- **Frontend** can connect to any backend instance
- **Backend** can serve any frontend or mobile app
- Each module has its own dependencies and configuration
- No shared code between frontend and backend
