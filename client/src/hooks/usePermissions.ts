import { useAuth } from '@/contexts/AuthContext';
import { hasPermission, canAccessModule, getNavigationItems, getAccessibleModules } from '@shared/permissions';
import type { UserRole, ModulePermission, AccessLevel } from '@shared/permissions';

export function usePermissions() {
  const { user } = useAuth();
  
  const userRole = (user?.role || 'student') as UserRole;

  const checkPermission = (module: ModulePermission, access: AccessLevel = 'read'): boolean => {
    if (!user) return false;
    return hasPermission(userRole, module, access);
  };

  const checkModuleAccess = (module: ModulePermission): boolean => {
    if (!user) return false;
    return canAccessModule(userRole, module);
  };

  const getNavItems = () => {
    if (!user) return [];
    return getNavigationItems(userRole);
  };

  const getModules = () => {
    if (!user) return [];
    return getAccessibleModules(userRole);
  };

  return {
    userRole,
    checkPermission,
    checkModuleAccess,
    getNavItems,
    getModules,
    isStudent: userRole === 'student',
    isParent: userRole === 'parent',
    isTeacher: userRole === 'subject_teacher' || userRole === 'class_teacher',
    isStaff: userRole === 'non_teaching_staff',
    isAccountant: userRole === 'accountant',
    isPrincipal: userRole === 'principal',
    isAdmin: userRole === 'admin',
    isSuperAdmin: userRole === 'super_admin',
  };
}