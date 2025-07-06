export interface User {
  id: number;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  created_at: string;
}

export interface UserCreate {
  email: string;
  username: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export enum TaskStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  goal_id: number;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  priority?: 'low' | 'medium' | 'high';
  estimated_hours?: number;
}

export interface TaskCreate {
  title: string;
  description?: string;
  goal_id: number;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
  estimated_hours?: number;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: TaskStatus;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
  estimated_hours?: number;
  goal_id?: number | null;
}

export interface Goal {
  id: number;
  title: string;
  description?: string;
  deadline?: string;
  target_date?: string;
  user_id: number;
  progress_percentage: number;
  progress: number;
  total_tasks: number;
  completed_tasks: number;
  created_at: string;
  updated_at: string;
  tasks: Task[];
  category?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface GoalCreate {
  title: string;
  description?: string;
  deadline?: string;
  target_date?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface GoalUpdate {
  title?: string;
  description?: string;
  deadline?: string;
  target_date?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  progress?: number;
  progress_percentage?: number;
}

export interface DashboardStats {
  total_goals: number;
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  overdue_tasks: number;
  upcoming_deadlines: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recent_goals: Goal[];
  upcoming_tasks: Task[];
}

export interface ProgressData {
  date: string;
  completed_tasks: number;
  total_tasks: number;
  completion_rate: number;
}

export interface ProgressResponse {
  progress_data: ProgressData[];
  total_days: number;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: UserLogin) => Promise<void>;
  signup: (userData: UserCreate) => Promise<void>;
  logout: () => void;
  loading: boolean;
} 