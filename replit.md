# School Management System

## Overview

This is a comprehensive school management system built with React, TypeScript, and Express.js. The system provides end-to-end workflow management for educational institutions, covering student lifecycle from admission to graduation, academic management, staff administration, and financial operations.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom configuration
- **UI Framework**: Radix UI with shadcn/ui components
- **Styling**: Tailwind CSS with custom educational theme
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **API Design**: RESTful API with proper error handling
- **Database Provider**: Neon serverless PostgreSQL

### Key Components

#### Authentication System
- Role-based access control (RBAC) with 9 distinct roles
- JWT token authentication with 7-day expiration
- Password hashing using bcrypt with 12 salt rounds
- Protected routes and middleware authentication

#### Role Management
The system supports the following roles with specific permissions:
- Student, Parent, Subject Teacher, Class Teacher
- Non-teaching Staff, Accountant, Principal
- Admin, Super Admin

#### Database Schema
- **Users**: Authentication and role management
- **Students**: Student records with admission tracking
- **Teachers**: Staff management with qualifications
- **Attendance**: Daily attendance tracking
- **Fees**: Financial management and payment tracking
- **Timetable**: Class scheduling and period management
- **Results**: Academic performance tracking
- **Documents**: Certificate and document generation

#### Module Structure
- **Dashboard**: Overview with statistics and quick actions
- **Students**: Student management and enrollment
- **Teachers**: Staff management and assignments
- **Attendance**: Daily attendance tracking with multiple methods
- **Timetable**: Class scheduling and period management
- **Fees**: Payment processing and financial tracking
- **Results**: Academic performance and grading
- **Reports**: Data analysis and export functionality
- **Admissions**: Application processing workflow
- **Documents**: Certificate generation and management

## Data Flow

1. **Authentication Flow**: Users login → JWT token generation → Role-based access control
2. **Student Management**: Admission → Enrollment → Academic tracking → Graduation
3. **Academic Flow**: Timetable creation → Attendance tracking → Assessment → Results
4. **Financial Flow**: Fee structure → Payment processing → Receipt generation
5. **Reporting Flow**: Data aggregation → Analysis → Export functionality

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, React DOM, React Router via Wouter)
- UI libraries (Radix UI, Lucide React icons)
- Form management (React Hook Form, Zod validation)
- HTTP client (TanStack Query for server state)
- Styling (Tailwind CSS, clsx, tailwind-merge)

### Backend Dependencies
- Express.js for HTTP server
- Drizzle ORM for database operations
- JWT for authentication
- bcrypt for password hashing
- Neon serverless PostgreSQL client

### Development Dependencies
- TypeScript for type safety
- Vite for build tooling
- PostCSS for CSS processing
- ESBuild for server bundling

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds React app to `dist/public`
2. **Backend Build**: ESBuild bundles server code to `dist/index.js`
3. **Database**: Drizzle migrations applied to PostgreSQL

### Environment Configuration
- Development: Hot reloading with Vite dev server
- Production: Served as static files from Express server
- Database: Neon serverless PostgreSQL with connection pooling

### Scripts
- `npm run dev`: Development server with hot reloading
- `npm run build`: Production build for frontend and backend
- `npm run start`: Production server
- `npm run db:push`: Database schema deployment

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 08, 2025. Initial setup