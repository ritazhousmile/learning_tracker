from pydantic import BaseModel, EmailStr, validator
from datetime import datetime
from typing import Optional, List
from models import TaskStatus

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Task schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = "medium"
    estimated_hours: Optional[float] = None

class TaskCreate(TaskBase):
    goal_id: int

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = None
    estimated_hours: Optional[float] = None

class TaskResponse(TaskBase):
    id: int
    status: TaskStatus
    goal_id: int
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Goal schemas
class GoalBase(BaseModel):
    title: str
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    category: Optional[str] = None
    priority: Optional[str] = "medium"

class GoalCreate(GoalBase):
    pass

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    category: Optional[str] = None
    priority: Optional[str] = None

class GoalResponse(GoalBase):
    id: int
    user_id: int
    progress_percentage: float
    total_tasks: int
    completed_tasks: int
    created_at: datetime
    updated_at: datetime
    tasks: List[TaskResponse] = []
    
    class Config:
        from_attributes = True

# Dashboard schemas
class DashboardStats(BaseModel):
    total_goals: int
    total_tasks: int
    completed_tasks: int
    in_progress_tasks: int
    overdue_tasks: int
    upcoming_deadlines: int

class DashboardResponse(BaseModel):
    stats: DashboardStats
    recent_goals: List[GoalResponse]
    upcoming_tasks: List[TaskResponse]

# Progress tracking schemas
class ProgressData(BaseModel):
    date: datetime
    completed_tasks: int
    total_tasks: int
    completion_rate: float

class ProgressResponse(BaseModel):
    progress_data: List[ProgressData]
    total_days: int 