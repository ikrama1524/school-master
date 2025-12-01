
import api from '../config/api';

export interface Student {
  id: number;
  rollNumber: string;
  admissionNumber: string;
  name: string;
  email: string | null;
  phone: string | null;
  dateOfBirth: Date;
  gender: string;
  class: string;
  section: string;
  division: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string | null;
  address: string | null;
  previousSchool: string | null;
  admissionDate: Date;
  isActive: boolean;
}

export const studentService = {
  async getAll(): Promise<Student[]> {
    const response = await api.get<Student[]>('/students');
    return response.data;
  },

  async getById(id: number): Promise<Student> {
    const response = await api.get<Student>(`/students/${id}`);
    return response.data;
  },

  async create(data: Partial<Student>): Promise<Student> {
    const response = await api.post<Student>('/students', data);
    return response.data;
  },

  async update(id: number, data: Partial<Student>): Promise<Student> {
    const response = await api.put<Student>(`/students/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/students/${id}`);
  },
};
