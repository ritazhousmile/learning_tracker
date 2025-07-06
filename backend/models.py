from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from database import Base

class TaskStatus(enum.Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))
    
    # Relationships
    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")

class Goal(Base):
    __tablename__ = "goals"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    deadline = Column(DateTime, nullable=True)
    category = Column(String, nullable=True)
    priority = Column(String, default="medium")  # low, medium, high
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))
    
    # Foreign key
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="goals")
    tasks = relationship("Task", back_populates="goal", cascade="all, delete-orphan")
    
    @property
    def progress_percentage(self):
        """Calculate progress percentage based on completed tasks"""
        if not self.tasks:
            return 0
        completed_tasks = sum(1 for task in self.tasks if task.status == TaskStatus.COMPLETED)
        return round((completed_tasks / len(self.tasks)) * 100, 2)
    
    @property
    def total_tasks(self):
        """Get total number of tasks"""
        return len(self.tasks)
    
    @property
    def completed_tasks(self):
        """Get number of completed tasks"""
        return sum(1 for task in self.tasks if task.status == TaskStatus.COMPLETED)

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(TaskStatus), default=TaskStatus.NOT_STARTED)
    due_date = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    priority = Column(String, default="medium")  # low, medium, high
    estimated_hours = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))
    
    # Foreign key
    goal_id = Column(Integer, ForeignKey("goals.id"), nullable=False)
    
    # Relationships
    goal = relationship("Goal", back_populates="tasks")
    
    def mark_completed(self):
        """Mark task as completed and set completion timestamp"""
        self.status = TaskStatus.COMPLETED
        self.completed_at = datetime.now(timezone.utc)
    
    def mark_in_progress(self):
        """Mark task as in progress"""
        self.status = TaskStatus.IN_PROGRESS
        self.completed_at = None
    
    def mark_not_started(self):
        """Mark task as not started"""
        self.status = TaskStatus.NOT_STARTED
        self.completed_at = None 