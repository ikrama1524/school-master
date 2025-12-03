
# School Management System - Frontend

A React + TypeScript frontend for the school management system with role-based dashboards and modern UI.

## Prerequisites

- Node.js 18+
- npm or yarn

## Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api
```

### 3. Start the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## Important: Start Backend First!

Make sure the backend is running on port 5000 before starting the frontend.
See the [Backend README](../backend/README.md) for setup instructions.

---

## Features

- **Authentication**: JWT-based login with role-based access
- **Dashboard**: Overview of school metrics and quick actions
- **Student Management**: CRUD operations for student records
- **Teacher Management**: Manage teacher profiles and assignments
- **Attendance Tracking**: Mark and view attendance records
- **Fee Management**: Track fee payments and collections
- **Timetable**: View and manage class schedules
- **Results**: Record and view exam results
- **Reports**: Generate various reports

---

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── dashboard/      # Dashboard widgets
│   │   ├── layout/         # Sidebar, TopBar, etc.
│   │   ├── modals/         # Student/Teacher modals
│   │   └── ui/             # Shadcn UI components
│   ├── config/
│   │   └── api.ts          # Axios API configuration
│   ├── contexts/
│   │   └── AuthContext.tsx # Authentication context
│   ├── lib/
│   │   ├── queryClient.ts  # React Query setup
│   │   └── utils.ts        # Utility functions
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Students.tsx
│   │   ├── Teachers.tsx
│   │   ├── Login.tsx
│   │   └── ...
│   ├── services/
│   │   ├── auth.service.ts # Auth API calls
│   │   └── student.service.ts
│   ├── App.tsx             # Main app component
│   ├── Router.tsx          # Route definitions
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 5173) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## Technologies

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Axios** - HTTP client
- **React Query (TanStack Query)** - Data fetching and caching
- **Wouter** - Lightweight routing
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible UI primitives
- **Lucide React** - Icons

---

## Role-Based UI

The UI adapts based on user role:

| Role | Dashboard View |
|------|---------------|
| Admin/Principal | Full access to all modules |
| Teacher | Class-specific data and attendance |
| Accountant | Fee collection and financial reports |
| Student/Parent | View-only access to own data |

---

## Troubleshooting

### "Network Error" on Login
1. Ensure backend is running on port 5000
2. Check VITE_API_URL in .env
3. Verify CORS settings in backend

### Blank Page After Login
1. Check browser console for errors
2. Ensure AuthContext is properly set up
3. Verify token is stored in localStorage

### Styling Issues
1. Run `npm install` to ensure Tailwind is installed
2. Check that index.css is imported in main.tsx

---

## Port

Frontend runs on port **5173** by default.
