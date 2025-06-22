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

  const isAuthenticated = !!user && !!token;

  return {
    user,
    isLoading,
    isAuthenticated,
    hasModuleAccess: (module: ModuleName) => user ? hasModuleAccess(user.role, module) : false,
    canWrite: (module: ModuleName) => user ? canWrite(user.role, module) : false,
    canAdmin: (module: ModuleName) => user ? canAdmin(user.role, module) : false,
    accessibleModules: user ? getAccessibleModules(user.role) : [],
  };
}