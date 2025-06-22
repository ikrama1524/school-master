export type UserRole = 
  | 'student' 
  | 'parent' 
  | 'subject_teacher' 
  | 'class_teacher' 
  | 'non_teaching_staff' 
  | 'accountant' 
  | 'principal' 
  | 'super_admin';

export type ModuleName = 
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
  | 'documents'
  | 'calendar'
  | 'settings'
  | 'admissions';

export type Permission = 'read' | 'write' | 'admin';

export interface RolePermissions {
  [key: string]: Permission[];
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  student: {
    dashboard: ['read'],
    timetable: ['read'],
    homework: ['read'],
    results: ['read'],
    reports: ['read'],
  },
  parent: {
    dashboard: ['read'],
    timetable: ['read'],
    homework: ['read'],
    results: ['read'],
    reports: ['read'],
  },
  subject_teacher: {
    dashboard: ['read'], // Notices, holidays, Attendance-own
    timetable: ['read', 'write'],
    homework: ['read', 'write'],
    results: ['read', 'write'],
    reports: ['read'],
  },
  class_teacher: {
    dashboard: ['read'], // Notices, holidays, attendance
    attendance: ['read', 'write'],
    timetable: ['read', 'write'],
    homework: ['read', 'write'],
    results: ['read', 'write'],
    reports: ['read'],
    fees: ['read'], // Fees Management (read only)
  },
  non_teaching_staff: {
    dashboard: ['read'],
  },
  accountant: {
    fees: ['read', 'write', 'admin'],
    payroll: ['read', 'write', 'admin'],
    attendance: ['read'],
    dashboard: ['read'],
  },
  principal: {
    dashboard: ['read', 'write', 'admin'],
    students: ['read', 'write', 'admin'],
    teachers: ['read', 'write', 'admin'],
    attendance: ['read', 'write', 'admin'],
    timetable: ['read', 'write', 'admin'],
    homework: ['read', 'write', 'admin'],
    results: ['read', 'write', 'admin'],
    reports: ['read', 'write', 'admin'],
    fees: ['read', 'write', 'admin'],
    payroll: ['read', 'write', 'admin'],
    documents: ['read', 'write', 'admin'],
    calendar: ['read', 'write', 'admin'],
    settings: ['read', 'write', 'admin'],
    admissions: ['read', 'write', 'admin'],
  },
  super_admin: {
    dashboard: ['read', 'write', 'admin'],
    students: ['read', 'write', 'admin'],
    teachers: ['read', 'write', 'admin'],
    attendance: ['read', 'write', 'admin'],
    timetable: ['read', 'write', 'admin'],
    homework: ['read', 'write', 'admin'],
    results: ['read', 'write', 'admin'],
    reports: ['read', 'write', 'admin'],
    fees: ['read', 'write', 'admin'],
    payroll: ['read', 'write', 'admin'],
    documents: ['read', 'write', 'admin'],
    calendar: ['read', 'write', 'admin'],
    settings: ['read', 'write', 'admin'],
    admissions: ['read', 'write', 'admin'],
  },
};

export function hasPermission(
  userRole: UserRole,
  module: ModuleName,
  permission: Permission
): boolean {
  if (!userRole || !module || !permission) return false;
  
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  if (!rolePermissions) return false;
  
  const modulePermissions = rolePermissions[module];
  if (!modulePermissions) return false;
  
  return modulePermissions.includes(permission);
}

export function hasModuleAccess(userRole: UserRole, module: ModuleName): boolean {
  if (!userRole || !module) return false;
  
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  if (!rolePermissions) return false;
  
  return !!rolePermissions[module];
}

export function getAccessibleModules(userRole: UserRole): ModuleName[] {
  if (!userRole) return [];
  
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  if (!rolePermissions) return [];
  
  return Object.keys(rolePermissions) as ModuleName[];
}

export function canWrite(userRole: UserRole, module: ModuleName): boolean {
  if (!userRole || !module) return false;
  return hasPermission(userRole, module, 'write') || hasPermission(userRole, module, 'admin');
}

export function canAdmin(userRole: UserRole, module: ModuleName): boolean {
  if (!userRole || !module) return false;
  return hasPermission(userRole, module, 'admin');
}

export const ROLE_LABELS: Record<UserRole, string> = {
  student: 'Student',
  parent: 'Parent',
  subject_teacher: 'Subject Teacher',
  class_teacher: 'Class Teacher',
  non_teaching_staff: 'Non-Teaching Staff',
  accountant: 'Accountant',
  principal: 'Principal/Admin',
  super_admin: 'Super Admin',
};