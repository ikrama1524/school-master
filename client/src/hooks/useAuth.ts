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
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    hasModuleAccess: (module: ModuleName) => user ? hasModuleAccess(user.role, module) : false,
    canWrite: (module: ModuleName) => user ? canWrite(user.role, module) : false,
    canAdmin: (module: ModuleName) => user ? canAdmin(user.role, module) : false,
    accessibleModules: user ? getAccessibleModules(user.role) : [],
  };
}