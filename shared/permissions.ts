// Role-based permissions system for school management

export type UserRole = 
  | 'student' 
  | 'parent' 
  | 'subject_teacher' 
  | 'class_teacher' 
  | 'non_teaching_staff' 
  | 'accountant' 
  | 'principal' 
  | 'admin' 
  | 'super_admin';

export type ModulePermission = 
  | 'dashboard'
  | 'students'
  | 'teachers'
  | 'attendance'
  | 'timetable'
  | 'homework'
  | 'results'
  | 'reports'
  | 'fees'
  | 'payroll'
  | 'admissions'
  | 'documents'
  | 'calendar'
  | 'settings'
  | 'users';

export type AccessLevel = 'read' | 'write' | 'admin';

export interface Permission {
  module: ModulePermission;
  access: AccessLevel;
  restrictions?: string[];
}

// Define role-based permissions
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  student: [
    { module: 'dashboard', access: 'read', restrictions: ['notices', 'attendance_graph', 'results', 'pending_fees', 'timetable'] },
    { module: 'timetable', access: 'read' },
    { module: 'homework', access: 'read' },
    { module: 'results', access: 'read' },
    { module: 'reports', access: 'read', restrictions: ['fees', 'attendance'] },
  ],

  parent: [
    { module: 'dashboard', access: 'read', restrictions: ['notices', 'attendance_graph', 'results', 'pending_fees', 'timetable'] },
    { module: 'timetable', access: 'read' },
    { module: 'homework', access: 'read' },
    { module: 'results', access: 'read' },
    { module: 'reports', access: 'read', restrictions: ['fees', 'attendance'] },
  ],

  subject_teacher: [
    { module: 'dashboard', access: 'read', restrictions: ['notices', 'holidays', 'attendance_own'] },
    { module: 'timetable', access: 'read' },
    { module: 'homework', access: 'write' },
    { module: 'results', access: 'write' },
    { module: 'reports', access: 'read' },
  ],

  class_teacher: [
    { module: 'dashboard', access: 'read', restrictions: ['notices', 'holidays', 'attendance'] },
    { module: 'attendance', access: 'write' },
    { module: 'timetable', access: 'read' },
    { module: 'homework', access: 'write' },
    { module: 'results', access: 'write' },
    { module: 'reports', access: 'read' },
    { module: 'fees', access: 'read' },
  ],

  non_teaching_staff: [
    { module: 'dashboard', access: 'read', restrictions: ['attendance', 'notices'] },
  ],

  accountant: [
    { module: 'fees', access: 'admin' },
    { module: 'payroll', access: 'admin' },
    { module: 'attendance', access: 'read', restrictions: ['teachers'] },
  ],

  principal: [
    { module: 'dashboard', access: 'admin' },
    { module: 'students', access: 'admin' },
    { module: 'teachers', access: 'admin' },
    { module: 'attendance', access: 'admin' },
    { module: 'timetable', access: 'admin' },
    { module: 'homework', access: 'admin' },
    { module: 'results', access: 'admin' },
    { module: 'reports', access: 'admin' },
    { module: 'fees', access: 'admin' },
    { module: 'payroll', access: 'admin' },
    { module: 'admissions', access: 'admin' },
    { module: 'documents', access: 'admin' },
    { module: 'calendar', access: 'admin' },
    { module: 'settings', access: 'admin' },
  ],

  admin: [
    { module: 'dashboard', access: 'admin' },
    { module: 'students', access: 'admin' },
    { module: 'teachers', access: 'admin' },
    { module: 'attendance', access: 'admin' },
    { module: 'timetable', access: 'admin' },
    { module: 'homework', access: 'admin' },
    { module: 'results', access: 'admin' },
    { module: 'reports', access: 'admin' },
    { module: 'fees', access: 'admin' },
    { module: 'payroll', access: 'admin' },
    { module: 'admissions', access: 'admin' },
    { module: 'documents', access: 'admin' },
    { module: 'calendar', access: 'admin' },
    { module: 'settings', access: 'admin' },
  ],

  super_admin: [
    { module: 'dashboard', access: 'admin' },
    { module: 'students', access: 'admin' },
    { module: 'teachers', access: 'admin' },
    { module: 'attendance', access: 'admin' },
    { module: 'timetable', access: 'admin' },
    { module: 'homework', access: 'admin' },
    { module: 'results', access: 'admin' },
    { module: 'reports', access: 'admin' },
    { module: 'fees', access: 'admin' },
    { module: 'payroll', access: 'admin' },
    { module: 'admissions', access: 'admin' },
    { module: 'documents', access: 'admin' },
    { module: 'calendar', access: 'admin' },
    { module: 'settings', access: 'admin' },
    { module: 'users', access: 'admin' },
  ],
};

// Permission checking utilities
export function hasPermission(
  userRole: UserRole, 
  module: ModulePermission, 
  requiredAccess: AccessLevel = 'read'
): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  const modulePermission = rolePermissions.find(p => p.module === module);
  
  if (!modulePermission) return false;
  
  // Check access level hierarchy: admin > write > read
  const accessLevels = { read: 1, write: 2, admin: 3 };
  return accessLevels[modulePermission.access] >= accessLevels[requiredAccess];
}

export function getModuleRestrictions(userRole: UserRole, module: ModulePermission): string[] {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  const modulePermission = rolePermissions.find(p => p.module === module);
  return modulePermission?.restrictions || [];
}

export function getAccessibleModules(userRole: UserRole): ModulePermission[] {
  return ROLE_PERMISSIONS[userRole].map(p => p.module);
}

export function canAccessModule(userRole: UserRole, module: ModulePermission): boolean {
  return hasPermission(userRole, module, 'read');
}

// Navigation menu configuration based on roles
export const getNavigationItems = (userRole: UserRole) => {
  const accessibleModules = getAccessibleModules(userRole);
  
  const allNavigationItems = [
    { 
      name: 'Dashboard', 
      path: '/', 
      module: 'dashboard' as ModulePermission,
      icon: 'LayoutDashboard'
    },
    { 
      name: 'Students', 
      path: '/students', 
      module: 'students' as ModulePermission,
      icon: 'Users'
    },
    { 
      name: 'Teachers', 
      path: '/teachers', 
      module: 'teachers' as ModulePermission,
      icon: 'UserCheck'
    },
    { 
      name: 'Attendance', 
      path: '/attendance', 
      module: 'attendance' as ModulePermission,
      icon: 'Calendar'
    },
    { 
      name: 'Timetable', 
      path: '/timetable', 
      module: 'timetable' as ModulePermission,
      icon: 'Clock'
    },
    { 
      name: 'Homework', 
      path: '/homework', 
      module: 'homework' as ModulePermission,
      icon: 'BookOpen'
    },
    { 
      name: 'Results', 
      path: '/results', 
      module: 'results' as ModulePermission,
      icon: 'Trophy'
    },
    { 
      name: 'Reports', 
      path: '/reports', 
      module: 'reports' as ModulePermission,
      icon: 'FileText'
    },
    { 
      name: 'Fees', 
      path: '/fees', 
      module: 'fees' as ModulePermission,
      icon: 'CreditCard'
    },
    { 
      name: 'Payroll', 
      path: '/payroll', 
      module: 'payroll' as ModulePermission,
      icon: 'Banknote'
    },
    { 
      name: 'Admissions', 
      path: '/admissions', 
      module: 'admissions' as ModulePermission,
      icon: 'UserPlus'
    },
    { 
      name: 'Documents', 
      path: '/documents', 
      module: 'documents' as ModulePermission,
      icon: 'FileCheck'
    },
    { 
      name: 'Calendar', 
      path: '/calendar', 
      module: 'calendar' as ModulePermission,
      icon: 'CalendarDays'
    },
    { 
      name: 'Settings', 
      path: '/settings', 
      module: 'settings' as ModulePermission,
      icon: 'Settings'
    },
    { 
      name: 'Users', 
      path: '/users', 
      module: 'users' as ModulePermission,
      icon: 'Users2'
    },
  ];

  return allNavigationItems.filter(item => accessibleModules.includes(item.module));
};