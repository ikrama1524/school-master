
# School Management System - Modular Architecture

⚠️ **IMPORTANT**: If you see "endpoint has been disabled" error, your Neon database needs to be re-enabled in the Replit Database tab.

This project is split into two completely independent modules:

## 🗂️ Project Structure

```
project/
├── backend/          # Independent backend API
│   ├── src/
│   ├── package.json
│   └── .env
├── frontend/         # Independent frontend app
│   ├── src/
│   ├── package.json
│   └── .env
└── README.md
```

## 🚀 Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Configure Supabase credentials in .env
npm run dev
```

Backend runs on: `http://localhost:5000`

## 🎨 Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL to backend URL
npm run dev
```

Frontend runs on: `http://localhost:3000`

## 🔑 Environment Variables

### Backend (.env)
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_KEY` - Supabase service role key
- `JWT_SECRET` - Secret for JWT token generation
- `PORT` - Backend port (default: 5000)
- `FRONTEND_URL` - Frontend URL for CORS

### Frontend (.env)
- `VITE_API_URL` - Backend API URL

## 📦 Complete Independence

- **Frontend** can be deployed separately and connect to any backend instance
- **Backend** can serve any frontend or mobile app via REST API
- No shared code between frontend and backend
- Each module has its own dependencies and configuration
