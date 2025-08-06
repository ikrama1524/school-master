# School Management System

## Overview

This is a comprehensive school management system built with React (TypeScript) frontend and Express.js backend. The system manages student lifecycle from admission to graduation, including academic management, staff administration, fee collection, and reporting. It uses PostgreSQL with Drizzle ORM for data management and includes a role-based permission system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with Tailwind CSS
- **State Management**: React Query (TanStack Query) for server state
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with custom design tokens
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **API**: RESTful endpoints with proper error handling
- **Development**: Hot reload with middleware integration

## Key Components

### Authentication & Authorization System
- **JWT Authentication**: Token-based authentication with 7-day expiration and secure secret management
- **6 User Roles**: student_parent (merged), subject_teacher, class_teacher, non_teaching, accountant, principal, admin, super_admin
- **Modular RBAC Architecture**: Clean separation with roles.ts, roleMiddleware.ts, and rbacRoutes.ts
- **Access Matrix**: Detailed permissions for dashboard, timetable, homework, result, reports, fees, payroll, attendance modules
- **Password Security**: bcrypt hashing with 12 salt rounds for all user credentials
- **Middleware Protection**: Route-level protection with automatic token validation and role verification
- **Test System**: Comprehensive test users with demo credentials for all roles

### Database Schema
- **Users**: Core authentication and user management
- **Students**: Student information, admission details, class assignments
- **Teachers**: Staff details, subjects, qualifications
- **Attendance**: Daily attendance tracking with multiple methods
- **Fees**: Enhanced fee management with academic year and installment tracking
- **Fee Structures**: Template-based fee configuration system for reusable fee plans
- **Fee Structure Items**: Detailed fee components with frequency and due date management
- **Timetable**: Class schedules, period management
- **Results**: Academic performance, exams, semester results
- **Documents**: Certificate generation and management
- **Calendar**: Events, academic calendar integration

### Recent Enhancements (January 2025)
- **Complete RBAC System**: Implemented comprehensive Role-Based Access Control with JWT authentication and 6 distinct user roles (student/parent merged)
- **Modular Authorization Architecture**: Created roles.ts, roleMiddleware.ts, and rbacRoutes.ts for clean separation of concerns
- **JWT Authentication Flow**: 7-day token expiration with automatic secret generation and consistent token validation
- **Test User System**: Created comprehensive test users for all roles with demo credentials for system testing
- **Access Matrix Implementation**: Detailed permissions for 8 modules (dashboard, timetable, homework, result, reports, fees, payroll, attendance)
- **Role-Specific Endpoints**: Protected routes with middleware validation ensuring proper access control
- **Smart Fee Management**: Implemented comprehensive fee structure templates with automated fee generation for entire classes
- **Fee Analytics Dashboard**: Real-time collection metrics with class-wise performance tracking
- **Advanced Payment Processing**: Multiple payment methods (cash, card, UPI, online, cheque) with detailed tracking
- **Enhanced Admission Workflow**: Fixed disappearing approved applications issue and improved admission-to-student creation process
- **Complete Module Hierarchy**: Fully implemented Admissions → Student → Division → Class workflow with all interconnected modules
- **Comprehensive Reports**: Added reports module for attendance, fees, results, and academic performance analysis

### Permission System
- Hierarchical role-based permissions
- Module-level access control (dashboard, students, teachers, etc.)
- Access levels: read, write, admin
- Navigation items filtered by user role

### Core Modules
1. **Student Management**: Admission, enrollment, profile management
2. **Teacher Management**: Staff profiles, subject assignments
3. **Attendance System**: Daily tracking, reports, multiple input methods
4. **Fee Management**: Structure setup, payment processing, collection reports
5. **Timetable**: Class scheduling, period management
6. **Results Management**: Exam results, grade management
7. **Document Generation**: Certificates, applications, reports
8. **Payroll**: Staff salary management, payslip generation

## Data Flow

### Authentication Flow
1. User submits credentials to `/api/auth/login`
2. Backend validates credentials against database
3. JWT token generated and returned with user info
4. Frontend stores token in localStorage
5. Subsequent requests include token in Authorization header
6. Middleware validates token and attaches user to request

### Data Management Flow
1. React Query manages server state with automatic caching
2. API requests use centralized `apiRequest` function
3. Automatic token refresh and logout on 401 responses
4. Optimistic updates with error rollback
5. Real-time data synchronization through query invalidation

### Form Handling
1. React Hook Form with Zod schema validation
2. Type-safe form data with TypeScript
3. Client-side validation with server-side confirmation
4. Error handling with toast notifications

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives (@radix-ui/react-*)
- **Styling**: Tailwind CSS, class-variance-authority
- **Forms**: React Hook Form, Zod validation
- **Data Fetching**: TanStack React Query
- **Icons**: Lucide React
- **Date Handling**: date-fns

### Backend Dependencies
- **Database**: @neondatabase/serverless, Drizzle ORM
- **Authentication**: jsonwebtoken, bcryptjs
- **Security**: Input validation, password hashing
- **Development**: tsx for TypeScript execution

### Build Tools
- **Vite**: Frontend build tool with React plugin
- **ESBuild**: Backend bundling for production
- **TypeScript**: Type checking and compilation
- **Drizzle Kit**: Database migrations and schema management

## Deployment Strategy

### Development Environment
- Vite dev server for frontend with HMR
- tsx for backend TypeScript execution
- Automatic database migration with Drizzle
- Environment-based configuration

### Production Build
1. Frontend: Vite builds React app to `dist/public`
2. Backend: ESBuild bundles server code to `dist/index.js`
3. Database: Drizzle migrations applied via `db:push`
4. Static files served from Express in production

### Database Management
- PostgreSQL database with connection pooling
- Drizzle ORM for type-safe database operations
- Migration system for schema changes
- Environment-based database URL configuration

### Security Considerations
- JWT token validation on protected routes
- Password hashing with bcrypt
- Input validation with Zod schemas
- Role-based access control
- SQL injection prevention through ORM

The system is designed to be scalable and maintainable, with clear separation of concerns between frontend and backend, comprehensive error handling, and a flexible permission system that can accommodate different educational institution needs.