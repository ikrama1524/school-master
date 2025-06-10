import { User } from "@shared/schema";

// Simple authentication utility for the school management system
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Mock authentication for demo purposes - in a real app this would integrate with backend auth
class AuthService {
  private user: User | null = null;
  private listeners: ((state: AuthState) => void)[] = [];

  constructor() {
    // Check for existing session on initialization
    this.checkExistingSession();
  }

  private checkExistingSession() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        this.user = JSON.parse(storedUser);
        this.notifyListeners();
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
  }

  private notifyListeners() {
    const state: AuthState = {
      user: this.user,
      isAuthenticated: !!this.user,
      isLoading: false,
    };
    this.listeners.forEach(listener => listener(state));
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    // Immediately call with current state
    listener({
      user: this.user,
      isAuthenticated: !!this.user,
      isLoading: false,
    });

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  async login(username: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Login failed' };
      }

      const user = await response.json();
      this.user = user;
      localStorage.setItem('user', JSON.stringify(user));
      this.notifyListeners();

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  }

  logout() {
    this.user = null;
    localStorage.removeItem('user');
    this.notifyListeners();
  }

  getCurrentUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.user;
  }

  hasRole(role: string): boolean {
    return this.user?.role === role;
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  isTeacher(): boolean {
    return this.hasRole('teacher');
  }

  isStudent(): boolean {
    return this.hasRole('student');
  }

  isParent(): boolean {
    return this.hasRole('parent');
  }

  // Auto-login for demo purposes with admin credentials
  async autoLogin(): Promise<void> {
    const result = await this.login('admin', 'admin123');
    if (!result.success) {
      console.warn('Auto-login failed:', result.error);
    }
  }
}

export const authService = new AuthService();

// React hook for using auth in components
export function useAuth(): AuthState & {
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
  isTeacher: () => boolean;
  isStudent: () => boolean;
  isParent: () => boolean;
} {
  const [state, setState] = useState<AuthState>({
    user: authService.getCurrentUser(),
    isAuthenticated: authService.isAuthenticated(),
    isLoading: false,
  });

  useEffect(() => {
    const unsubscribe = authService.subscribe(setState);
    return unsubscribe;
  }, []);

  return {
    ...state,
    login: authService.login.bind(authService),
    logout: authService.logout.bind(authService),
    hasRole: authService.hasRole.bind(authService),
    isAdmin: authService.isAdmin.bind(authService),
    isTeacher: authService.isTeacher.bind(authService),
    isStudent: authService.isStudent.bind(authService),
    isParent: authService.isParent.bind(authService),
  };
}

// Auto-login on app initialization for demo purposes
if (typeof window !== 'undefined') {
  // Only run in browser environment
  setTimeout(() => {
    if (!authService.isAuthenticated()) {
      authService.autoLogin();
    }
  }, 100);
}

// Import React hooks
import { useState, useEffect } from "react";
