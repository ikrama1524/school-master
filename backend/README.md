
# School Management System - Backend

A Node.js/Express backend API for the school management system with JWT authentication and role-based access control.

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Database - PostgreSQL connection URL
DATABASE_URL=postgresql://user:password@localhost:5432/school_db

# JWT Secret - Use a long random string (at least 32 characters)
JWT_SECRET=your_super_secure_random_secret_key_here_at_least_32_chars

# Server
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### 3. Setup Database

Push the schema to your database:

```bash
npm run db:push
```

Initialize with test users:

```bash
npm run db:init
```

### 4. Start the Server

```bash
npm run dev
```

The API will be available at `http://localhost:5000`

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

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/auth/me` | Get current user info |
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
| DELETE | `/api/teachers/:id` | Delete teacher |

### Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/attendance` | List attendance records |
| POST | `/api/attendance` | Mark attendance |

### Fees
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/fees` | List fee records |
| GET | `/api/fees/student/:studentId` | Get student fees |
| POST | `/api/fees` | Create fee record |
| PUT | `/api/fees/:id` | Update fee |

### Timetable
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/timetable` | List all timetable entries |
| GET | `/api/timetable/class/:className` | Get class timetable |
| POST | `/api/timetable` | Create timetable entry |

### Results
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/results` | List all results |
| GET | `/api/results/student/:studentId` | Get student results |
| POST | `/api/results` | Create result |

---

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts   # Database connection
│   │   └── env.ts        # Environment config
│   ├── middleware/
│   │   └── auth.middleware.ts  # JWT authentication
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── student.routes.ts
│   │   ├── teacher.routes.ts
│   │   └── ...
│   ├── schemas/
│   │   └── index.ts      # Drizzle ORM schemas
│   ├── services/
│   │   ├── student.service.ts
│   │   └── ...
│   ├── scripts/
│   │   └── init-db.ts    # Database initialization
│   └── index.ts          # Main entry point
├── drizzle.config.ts     # Drizzle configuration
├── package.json
└── tsconfig.json
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:push` | Push schema to database |
| `npm run db:generate` | Generate migrations |
| `npm run db:init` | Initialize test users |

---

## Role-Based Access Control (RBAC)

| Role | Access Level |
|------|-------------|
| super_admin | Full access to all modules |
| admin | Full access to all modules |
| principal | Full access to all modules |
| class_teacher | Read/write to assigned class modules |
| subject_teacher | Read/write to subject-specific modules |
| accountant | Full access to fees and payroll |
| student_parent | Read-only access to own data |
| non_teaching | Limited access to basic modules |

---

## Troubleshooting

### Database Connection Issues
1. Make sure PostgreSQL is running
2. Check DATABASE_URL format: `postgresql://user:password@host:port/database`
3. Verify the database exists

### JWT Token Issues
1. Ensure JWT_SECRET is set in .env
2. Token expires after 7 days by default
3. Check Authorization header format: `Bearer <token>`

### CORS Issues
1. Set FRONTEND_URL in .env to match your frontend URL
2. For local dev: `FRONTEND_URL=http://localhost:5173`

---

## Port

Backend runs on port **5000** by default.
