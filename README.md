
# School Management System - Modular Architecture

This project is split into two completely independent modules that can be downloaded and run separately.

## 📁 Project Structure

```
project/
├── backend/          # Independent backend API
└── frontend/         # Independent frontend app
```

## 🚀 Complete Setup Guide

### Prerequisites

**Required Software:**
- Node.js v18 or higher
- npm (comes with Node.js)
- PostgreSQL database (Supabase or local)

---

## Backend Setup (Download & Run)

### 1. Navigate to backend folder
```bash
cd backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` file with your database credentials:
```env
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your_secure_random_secret_key
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Note:** You can use any PostgreSQL database (local, Neon, Supabase, Railway, etc.)

### 4. Push database schema
```bash
npm run db:push
```

### 5. Create test users (optional)
```bash
npx tsx src/scripts/init-test-users.ts
```

### 6. Start backend server
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

**Test credentials:**
- admin / admin123
- principal / principal123
- teacher / teacher123
- student / student123

---

## Frontend Setup (Download & Run)

### 1. Navigate to frontend folder
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Start frontend server
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

---

## 🔧 Available Scripts

### Backend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push schema to database

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

---

## 📦 Complete Independence

✅ **Frontend** can be deployed separately and connect to any backend instance  
✅ **Backend** can serve any frontend or mobile app via REST API  
✅ No shared code between frontend and backend  
✅ Each module has its own dependencies and configuration

---

## 🐛 Troubleshooting

### Database Connection Error
- Ensure PostgreSQL/Supabase database is running
- Verify `DATABASE_URL` in backend `.env`
- Check if database endpoint is enabled (Replit users)

### CORS Error
- Ensure `FRONTEND_URL` in backend `.env` matches frontend URL
- Check backend CORS configuration in `src/index.ts`

### Port Already in Use
```bash
# Kill process on port 5000
lsof -i :5000
kill -9 <PID>
```

### Module Not Found
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```
