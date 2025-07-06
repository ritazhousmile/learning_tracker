import axios from 'axios';
import { Goal, GoalCreate, GoalUpdate, Task, TaskCreate, TaskUpdate, DashboardData, ProgressResponse } from '../types';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Goals API
export const goalService = {
  getGoals: () => api.get<Goal[]>('/api/goals/'),
  getGoal: (id: number) => api.get<Goal>(`/api/goals/${id}`),
  createGoal: (goal: GoalCreate) => api.post<Goal>('/api/goals/', goal),
  updateGoal: (id: number, goal: GoalUpdate) => api.put<Goal>(`/api/goals/${id}`, goal),
  deleteGoal: (id: number) => api.delete(`/api/goals/${id}`),
};

// Tasks API
export const taskService = {
  getTasks: () => api.get<Task[]>('/api/tasks/'),
  getTask: (id: number) => api.get<Task>(`/api/tasks/${id}`),
  createTask: (task: TaskCreate) => api.post<Task>('/api/tasks/', task),
  updateTask: (id: number, task: TaskUpdate) => api.put<Task>(`/api/tasks/${id}`, task),
  deleteTask: (id: number) => api.delete(`/api/tasks/${id}`),
  getTasksByGoal: (goalId: number) => api.get<Task[]>(`/api/tasks/goal/${goalId}`),
};

// Dashboard API
export const dashboardService = {
  getDashboardData: () => api.get<DashboardData>('/api/dashboard/'),
  getProgressData: (days?: number) => api.get<ProgressResponse>(`/api/dashboard/progress?days=${days || 30}`),
};

// Auth API
export const authService = {
  login: (credentials: { username: string; password: string }) => 
    api.post<{ access_token: string; token_type: string }>('/api/auth/login', credentials),
  signup: (userData: { email: string; username: string; password: string; first_name?: string; last_name?: string }) => 
    api.post('/api/auth/signup', userData),
  getMe: () => api.get('/api/auth/me'),
};

export default api; 