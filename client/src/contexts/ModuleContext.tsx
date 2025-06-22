import { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./AuthContext";

interface Module {
  id: number;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  route: string;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
}

interface ModuleContextType {
  modules: Module[];
  isLoading: boolean;
  hasModuleAccess: (moduleName: string) => boolean;
  canWrite: (moduleName: string) => boolean;
  canDelete: (moduleName: string) => boolean;
}

const ModuleContext = createContext<ModuleContextType | undefined>(undefined);

export const useModules = () => {
  const context = useContext(ModuleContext);
  if (!context) {
    throw new Error("useModules must be used within a ModuleProvider");
  }
  return context;
};

interface ModuleProviderProps {
  children: React.ReactNode;
}

export const ModuleProvider = ({ children }: ModuleProviderProps) => {
  const { isAuthenticated, user } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);

  const { data: userModules = [], isLoading } = useQuery<Module[]>({
    queryKey: ["/api/user-modules"],
    enabled: isAuthenticated && !!user,
    retry: false,
  });

  useEffect(() => {
    if (userModules) {
      setModules(userModules);
    }
  }, [userModules]);

  const hasModuleAccess = (moduleName: string): boolean => {
    const module = modules.find(m => m.name === moduleName);
    return module ? module.canRead : false;
  };

  const canWrite = (moduleName: string): boolean => {
    const module = modules.find(m => m.name === moduleName);
    return module ? module.canWrite : false;
  };

  const canDelete = (moduleName: string): boolean => {
    const module = modules.find(m => m.name === moduleName);
    return module ? module.canDelete : false;
  };

  const value: ModuleContextType = {
    modules,
    isLoading,
    hasModuleAccess,
    canWrite,
    canDelete,
  };

  return (
    <ModuleContext.Provider value={value}>
      {children}
    </ModuleContext.Provider>
  );
};