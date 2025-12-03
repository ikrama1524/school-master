
import api from '../config/api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  name: string;
  email: string | null;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  message: string;
}

export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', { username, password });
    return response.data;
  },

  async getCurrentUser(): Promise<{ user: User }> {
    const response = await api.get<User>('/auth/me');
    return { user: response.data };
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  getStoredToken(): string | null {
    return localStorage.getItem('token');
  },

  setToken(token: string): void {
    localStorage.setItem('token', token);
  },

  removeToken(): void {
    localStorage.removeItem('token');
  },

  getStoredUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  },

  removeUser(): void {
    localStorage.removeItem('user');
  },
};
