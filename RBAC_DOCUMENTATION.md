# Role-Based Access Control (RBAC) System Documentation

## Overview

The school management system implements a comprehensive Role-Based Access Control (RBAC) system with JWT authentication, providing secure access to different modules based on user roles.

## System Architecture

### Core Components

1. **roles.ts** - Role definitions and access matrix
2. **roleMiddleware.ts** - Authentication and authorization middleware
3. **rbacRoutes.ts** - Protected API routes with RBAC implementation
4. **testUsers.ts** - Test user creation for all roles
5. **rbacDemo.ts** - Demonstration endpoint showing access matrix

### Authentication Flow

1. User submits credentials to `/api/auth/login`
2. System validates credentials against database
3. JWT token generated with user info and role (7-day expiration)
4. Token included in Authorization header for subsequent requests
5. Middleware validates token and checks role permissions
6. Access granted or denied based on role permissions

## User Roles & Permissions

### 1. Student Role
- **Access**: Dashboard, Timetable, Homework, Result, Reports (READ only)
- **Restrictions**: Cannot access Fees, Payroll, or Attendance modules
- **Use Case**: Students viewing their academic information

### 2. Parent Role
- **Access**: Dashboard, Timetable, Homework, Result, Reports (READ only)
- **Restrictions**: Cannot access Fees, Payroll, or Attendance modules
- **Use Case**: Parents monitoring their child's academic progress

### 3. Subject Teacher Role
- **Access**: Dashboard (READ), Timetable (READ), Homework (READ/WRITE), Result (READ/WRITE), Reports (READ)
- **Restrictions**: No access to Fees, Payroll, or Attendance modules
- **Use Case**: Teachers managing subject-specific homework and results

### 4. Class Teacher Role
- **Access**: Dashboard (READ), Timetable (READ), Homework (READ/WRITE), Result (READ/WRITE), Reports (READ), Fees (READ), Attendance (READ/WRITE)
- **Restrictions**: No access to Payroll module
- **Use Case**: Teachers managing their assigned classes

### 5. Non-Teaching Staff Role
- **Access**: Dashboard (READ only)
- **Restrictions**: Limited access to most modules
- **Use Case**: Support staff with minimal system access

### 6. Accountant Role
- **Access**: Fees (READ/WRITE/ADMIN), Payroll (READ/WRITE/ADMIN), Attendance (READ)
- **Restrictions**: No access to academic modules
- **Use Case**: Financial management and payroll processing

### 7. Principal Role
- **Access**: Full access to all modules (READ/WRITE/ADMIN)
- **Use Case**: School administration with complete oversight

### 8. Admin Role
- **Access**: Full access to all modules (READ/WRITE/ADMIN)
- **Use Case**: System administrators

### 9. Super Admin Role
- **Access**: Full access to all modules (READ/WRITE/ADMIN)
- **Use Case**: Top-level system administration

## Test Credentials

The system includes pre-created test users for all roles:

- **Super Admin**: admin / admin123
- **Principal**: principal / principal123
- **Class Teacher**: teacher / teacher123
- **Subject Teacher**: subject_teacher / subject123
- **Accountant**: accountant / accountant123
- **Student**: student / student123
- **Parent**: parent / parent123
- **Non-Teaching Staff**: staff / staff123

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login with role-based token generation
- `GET /api/auth/permissions` - Get current user permissions

### Protected Endpoints
- `GET /api/dashboard` - Role-specific dashboard data
- `GET /api/timetable` - Timetable access based on role
- `GET /api/homework` - Homework management
- `GET /api/result` - Academic results
- `GET /api/reports` - Reporting system
- `GET /api/fees` - Fee management (restricted access)
- `GET /api/payroll` - Payroll system (accountant/admin only)
- `GET /api/attendance` - Attendance tracking

### Test Endpoints
- `GET /api/test/student-only` - Student/Parent role test
- `GET /api/test/teacher-only` - Teacher role test
- `GET /api/test/admin-only` - Admin role test

### Demo Endpoint
- `GET /api/rbac-demo` - Complete access matrix demonstration

## Usage Examples

### 1. User Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"student","password":"student123"}'
```

### 2. Accessing Protected Endpoint
```bash
curl -X GET http://localhost:5000/api/homework \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Testing Role Restrictions
```bash
# Student trying to access payroll (should be denied)
curl -X GET http://localhost:5000/api/payroll \
  -H "Authorization: Bearer STUDENT_TOKEN"

# Admin accessing payroll (should succeed)
curl -X GET http://localhost:5000/api/payroll \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## Security Features

1. **JWT Token Security**: 7-day expiration with secure secret management
2. **Password Hashing**: bcrypt with 12 salt rounds
3. **Route Protection**: Middleware-based authentication and authorization
4. **Role Validation**: Granular permissions for each module and access level
5. **Error Handling**: Detailed error messages for debugging while maintaining security

## Testing the System

1. **Get Access Matrix**: Visit `/api/rbac-demo` to see complete permissions
2. **Login with Test Users**: Use provided credentials for different roles
3. **Test Permissions**: Try accessing various endpoints with different role tokens
4. **Verify Restrictions**: Confirm that users cannot access unauthorized resources

## Integration with Frontend

The RBAC system is designed to integrate seamlessly with the React frontend:

1. **Login Flow**: Frontend calls `/api/auth/login` and stores JWT token
2. **Permission Checks**: Frontend can call `/api/auth/permissions` to get user capabilities
3. **Route Protection**: Frontend routes can be protected based on user role
4. **UI Adaptation**: Interface elements can be shown/hidden based on permissions

## Future Enhancements

1. **Dynamic Permissions**: Allow runtime permission modifications
2. **Permission Inheritance**: Implement hierarchical role inheritance
3. **Audit Logging**: Track access attempts and permission changes
4. **Multi-tenant Support**: Extend RBAC for multiple school instances
5. **API Rate Limiting**: Implement role-based API rate limits