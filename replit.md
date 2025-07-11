# School Management System

## Overview

This is a comprehensive school management system built with React, Express.js, and PostgreSQL. The system provides end-to-end workflow management for educational institutions, covering student lifecycle from admission to graduation, academic management, staff administration, and financial operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Components**: Radix UI primitives with custom styling
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: JWT-based authentication with bcryptjs for password hashing
- **API Design**: RESTful API with role-based access control

### Data Storage
- **Database**: PostgreSQL via Neon serverless
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Connection pooling with @neondatabase/serverless

## Key Components

### Authentication System
- JWT token-based authentication
- Role-based access control (RBAC) with 9 different user roles
- Password hashing with bcryptjs
- Session management with localStorage
- Protected routes and API endpoints

### User Roles and Permissions
- **Student**: Limited access to personal data, timetables, and results
- **Parent**: Access to child's information and school communication
- **Teachers**: Subject/class teachers with appropriate permissions
- **Staff**: Non-teaching staff with administrative access
- **Management**: Accountant, principal, admin, and super admin roles
- Module-based permission system for granular access control

### Core Modules
1. **Student Management**: Registration, profile management, class assignments
2. **Teacher Management**: Staff profiles, subject assignments, payroll
3. **Attendance System**: Daily tracking, reporting, multiple input methods
4. **Academic Management**: Timetables, subjects, semesters, results
5. **Fee Management**: Collection, tracking, payment gateway integration
6. **Admission System**: Application processing, document verification
7. **Document Management**: Certificate generation, record keeping
8. **Reporting**: Comprehensive analytics and export capabilities

### UI/UX Design
- Modern, responsive design with mobile-first approach
- Consistent color scheme with CSS custom properties
- Accessible components using Radix UI primitives
- Dark/light theme support through CSS variables
- Intuitive navigation with role-based menu items

## Data Flow

### Client-Server Communication
- RESTful API endpoints for all operations
- Centralized error handling and logging
- Request/response interceptors for authentication
- Optimistic updates with query invalidation

### Database Operations
- Type-safe queries using Drizzle ORM
- Centralized storage layer for data access
- Transaction support for complex operations
- Efficient relationship handling

### State Management
- Server state managed by TanStack Query
- Client state managed by React hooks
- Form state handled by React Hook Form
- Authentication state in React Context

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless database
- **Authentication**: JWT tokens for session management
- **UI Components**: Radix UI component library
- **Styling**: Tailwind CSS framework
- **Validation**: Zod schema validation
- **Date Handling**: date-fns for date manipulation

### Payment Integration
- Stripe integration for fee collection
- Multiple payment gateway support architecture
- Secure payment processing with webhooks

### Development Tools
- **TypeScript**: Type safety across the application
- **ESBuild**: Fast JavaScript/TypeScript bundler
- **PostCSS**: CSS processing and optimization
- **Replit**: Development environment integration

## Deployment Strategy

### Build Process
- Frontend: Vite build with optimized bundle splitting
- Backend: ESBuild compilation to ES modules
- Static assets served from dist/public directory
- Environment-specific configuration

### Production Setup
- Server-side rendering disabled (SPA mode)
- Compressed assets and code splitting
- Environment variable management
- Database connection pooling

### Development Environment
- Hot module replacement for fast development
- Source maps for debugging
- Development-specific error handling
- Automatic database migration on startup

### Security Considerations
- Password hashing with salt rounds
- JWT token expiration and refresh
- Role-based API access control
- Input validation and sanitization
- CORS configuration for secure cross-origin requests

The system is designed to be scalable, maintainable, and user-friendly, with a clear separation of concerns between frontend and backend components. The modular architecture allows for easy extension and customization based on specific school requirements.