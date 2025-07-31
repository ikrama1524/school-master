# RBAC System Workflow Documentation

## How the Role-Based Access Control System Works

### 1. User Login Flow

```
User enters credentials → Backend validates → JWT token generated → User redirected to dashboard
```

**Step-by-step process:**
1. User visits the login page and enters username/password
2. Frontend sends POST request to `/api/auth/login`
3. Backend validates credentials against database
4. If valid, backend generates JWT token with user info and role
5. Token is sent back to frontend and stored (localStorage/sessionStorage)
6. User is redirected to their role-appropriate dashboard

### 2. Role-Based Navigation

Each user role sees different navigation options:

**Student/Parent:**
- Dashboard (view only)
- Timetable (view only)
- Homework (view only)
- Results (view only)
- Reports (view only)

**Teacher (Subject/Class):**
- Dashboard (view only)
- Timetable (view only)
- Homework (view/edit)
- Results (view/edit)
- Reports (view only)
- Attendance (class teachers only)
- Fees (class teachers can view)

**Accountant:**
- Fees (full access)
- Payroll (full access)
- Attendance (view only)

**Principal/Admin/Super Admin:**
- All modules (full access)

### 3. Request Authentication Flow

```
Frontend request → JWT validation → Role check → Access granted/denied
```

**For every API request:**
1. Frontend includes JWT token in Authorization header
2. Backend middleware validates token signature and expiration
3. If valid, user info is extracted from token
4. Role-based permission check is performed
5. Access is granted or denied with appropriate error message

### 4. Permission Levels

Each module has three permission levels:
- **Read**: Can view data
- **Write**: Can create/edit data
- **Admin**: Can delete data and manage settings

### 5. Practical Usage Examples

#### Example 1: Student Accessing Homework
```
1. Student logs in with credentials: student/student123
2. Gets JWT token with role "student"
3. Clicks on "Homework" in navigation
4. Frontend sends GET /api/homework with token
5. Backend validates token and checks permissions
6. Student has "read" permission for homework
7. Homework data is returned and displayed
```

#### Example 2: Student Trying to Access Payroll
```
1. Student tries to access payroll URL
2. Frontend might redirect or show error
3. If they bypass frontend, backend receives request
4. Backend validates token and checks permissions
5. Student has NO permission for payroll
6. Backend returns 403 Forbidden with detailed error
```

#### Example 3: Teacher Managing Homework
```
1. Teacher logs in with credentials: teacher/teacher123
2. Gets JWT token with role "class_teacher"
3. Accesses homework module
4. Can view all homework (read permission)
5. Can create new homework assignments (write permission)
6. Can edit existing homework (write permission)
7. Cannot delete homework (no admin permission)
```

### 6. Frontend Integration

The frontend adapts based on user role:

**Navigation Menu:**
- Dynamically shows/hides menu items based on permissions
- Uses role information from JWT token

**Page Content:**
- Shows different content based on role
- Hides action buttons if user lacks permissions
- Displays appropriate error messages

**Form Controls:**
- Read-only fields for users with only read access
- Edit buttons only for users with write access
- Delete buttons only for users with admin access

### 7. Security Features

**Token Security:**
- 7-day expiration (automatically logout after expiration)
- Secure secret for token signing
- Token contains minimal necessary information

**Route Protection:**
- Every protected endpoint requires valid token
- Role validation on every request
- Detailed error messages for debugging

**Password Security:**
- bcrypt hashing with 12 salt rounds
- No plain text passwords stored

### 8. Error Handling

**Frontend Errors:**
- Invalid/expired token → Redirect to login
- Insufficient permissions → Show access denied page
- Network errors → Show retry options

**Backend Errors:**
- 401 Unauthorized → Invalid/expired token
- 403 Forbidden → Valid token but insufficient role
- 404 Not Found → Resource doesn't exist
- 500 Server Error → Internal server error

### 9. Real-World Scenarios

#### Scenario A: New Student Enrollment
1. Admin logs in and accesses student management
2. Creates new student record
3. Student gets login credentials
4. Student logs in and can only see their own data
5. Parent gets separate login to monitor student progress

#### Scenario B: Teacher Grade Submission
1. Subject teacher logs in
2. Accesses results/grades module
3. Can enter grades for their subjects only
4. Cannot modify other teachers' grades
5. Changes are logged for audit purposes

#### Scenario C: Fee Payment Processing
1. Accountant logs in
2. Accesses fee management system
3. Can view all student fees
4. Can mark payments as received
5. Can generate fee reports
6. Cannot access academic data

### 10. System Administration

**Super Admin capabilities:**
- Manage all user accounts
- Access all modules and data
- Configure system settings
- View audit logs
- Backup/restore data

**Role Assignment:**
- Users are assigned roles during account creation
- Roles can be modified by admin users
- Role changes take effect on next login

This RBAC system ensures that each user can only access the information and functions appropriate to their role, maintaining data security and system integrity while providing a smooth user experience.