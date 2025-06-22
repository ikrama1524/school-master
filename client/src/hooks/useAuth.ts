import { useQuery } from "@tanstack/react-query";
import { UserRole, hasModuleAccess, getAccessibleModules, canWrite, canAdmin, type ModuleName } from "@shared/roles";

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: UserRole;
}

export function useAuth() {
  const token = localStorage.getItem('token');
  
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/me"],
    retry: false,
    enabled: !!token,
  });

  // If there's an auth error, clear the token
  if (error && token) {
    localStorage.removeItem('token');
  }

  const isAuthenticated = !!user && !!token && !error;

  return {
    user: user || null,
    isLoading: isLoading && !!token,
    isAuthenticated,
    hasModuleAccess: (module: ModuleName) => {
      if (!user || !user.role) return false;
      try {
        return hasModuleAccess(user.role, module);
      } catch {
        return false;
      }
    },
    canWrite: (module: ModuleName) => {
      if (!user || !user.role) return false;
      try {
        return canWrite(user.role, module);
      } catch {
        return false;
      }
    },
    canAdmin: (module: ModuleName) => {
      if (!user || !user.role) return false;
      try {
        return canAdmin(user.role, module);
      } catch {
        return false;
      }
    },
    accessibleModules: user && user.role ? getAccessibleModules(user.role) : [],
  };
}