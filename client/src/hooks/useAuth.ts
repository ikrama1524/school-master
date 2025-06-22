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
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // If there's an auth error, clear the token and reload
  if (error && token) {
    console.log('Auth error detected, clearing token:', error);
    localStorage.removeItem('token');
    // Don't redirect here, let the app handle it
  }

  const isAuthenticated = !!user && !!token && !error;

  return {
    user: user || null,
    isLoading: isLoading && !!token,
    isAuthenticated,
    error,
    hasModuleAccess: (module: ModuleName) => {
      if (!user || !user.role) return false;
      try {
        return hasModuleAccess(user.role, module);
      } catch (e) {
        console.warn('Error checking module access:', e);
        return false;
      }
    },
    canWrite: (module: ModuleName) => {
      if (!user || !user.role) return false;
      try {
        return canWrite(user.role, module);
      } catch (e) {
        console.warn('Error checking write access:', e);
        return false;
      }
    },
    canAdmin: (module: ModuleName) => {
      if (!user || !user.role) return false;
      try {
        return canAdmin(user.role, module);
      } catch (e) {
        console.warn('Error checking admin access:', e);
        return false;
      }
    },
    accessibleModules: user && user.role ? getAccessibleModules(user.role) : [],
  };
}