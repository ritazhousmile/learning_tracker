from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List
from datetime import datetime, timedelta, timezone
from database import get_db
from models import Task, Goal, User, TaskStatus
from schemas import DashboardResponse, DashboardStats, GoalResponse, TaskResponse, ProgressResponse, ProgressData
from auth_utils import get_current_user

router = APIRouter()

@router.get("/", response_model=DashboardResponse)
async def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get dashboard data with statistics and recent items."""
    
    # Get basic statistics
    total_goals = db.query(Goal).filter(Goal.user_id == current_user.id).count()
    
    total_tasks = db.query(Task).join(Goal).filter(Goal.user_id == current_user.id).count()
    
    completed_tasks = db.query(Task).join(Goal).filter(
        Goal.user_id == current_user.id,
        Task.status == TaskStatus.COMPLETED
    ).count()
    
    in_progress_tasks = db.query(Task).join(Goal).filter(
        Goal.user_id == current_user.id,
        Task.status == TaskStatus.IN_PROGRESS
    ).count()
    
    # Get overdue tasks (past due date and not completed)
    now = datetime.now(timezone.utc)
    overdue_tasks = db.query(Task).join(Goal).filter(
        Goal.user_id == current_user.id,
        Task.due_date < now,
        Task.status != TaskStatus.COMPLETED
    ).count()
    
    # Get upcoming deadlines (within next 7 days)
    next_week = now + timedelta(days=7)
    upcoming_deadlines = db.query(Goal).filter(
        Goal.user_id == current_user.id,
        Goal.deadline >= now,
        Goal.deadline <= next_week
    ).count()
    
    # Create statistics object
    stats = DashboardStats(
        total_goals=total_goals,
        total_tasks=total_tasks,
        completed_tasks=completed_tasks,
        in_progress_tasks=in_progress_tasks,
        overdue_tasks=overdue_tasks,
        upcoming_deadlines=upcoming_deadlines
    )
    
    # Get recent goals (last 5 created)
    recent_goals = db.query(Goal).filter(Goal.user_id == current_user.id).order_by(Goal.created_at.desc()).limit(5).all()
    
    # Get upcoming tasks (next 10 tasks ordered by due date)
    upcoming_tasks = db.query(Task).join(Goal).filter(
        Goal.user_id == current_user.id,
        Task.status != TaskStatus.COMPLETED,
        Task.due_date >= now
    ).order_by(Task.due_date.asc()).limit(10).all()
    
    return DashboardResponse(
        stats=stats,
        recent_goals=recent_goals,
        upcoming_tasks=upcoming_tasks
    )

@router.get("/progress", response_model=ProgressResponse)
async def get_progress_data(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get progress data for visualization (completed tasks over time)."""
    
    if days <= 0 or days > 365:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Days must be between 1 and 365"
        )
    
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=days)
    
    progress_data = []
    
    # Get data for each day
    for i in range(days):
        current_date = start_date + timedelta(days=i)
        next_date = current_date + timedelta(days=1)
        
        # Count completed tasks on this day
        completed_on_day = db.query(Task).join(Goal).filter(
            Goal.user_id == current_user.id,
            Task.completed_at >= current_date,
            Task.completed_at < next_date
        ).count()
        
        # Count total tasks that existed on this day
        total_tasks_on_day = db.query(Task).join(Goal).filter(
            Goal.user_id == current_user.id,
            Task.created_at <= current_date
        ).count()
        
        # Calculate completion rate
        completion_rate = (completed_on_day / total_tasks_on_day * 100) if total_tasks_on_day > 0 else 0
        
        progress_data.append(ProgressData(
            date=current_date,
            completed_tasks=completed_on_day,
            total_tasks=total_tasks_on_day,
            completion_rate=round(completion_rate, 2)
        ))
    
    return ProgressResponse(
        progress_data=progress_data,
        total_days=days
    )

@router.get("/goals/recent", response_model=List[GoalResponse])
async def get_recent_goals(
    limit: int = 5,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get recent goals."""
    
    if limit <= 0 or limit > 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Limit must be between 1 and 50"
        )
    
    goals = db.query(Goal).filter(Goal.user_id == current_user.id).order_by(Goal.created_at.desc()).limit(limit).all()
    return goals

@router.get("/tasks/upcoming", response_model=List[TaskResponse])
async def get_upcoming_tasks(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get upcoming tasks (ordered by due date)."""
    
    if limit <= 0 or limit > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Limit must be between 1 and 100"
        )
    
    now = datetime.now(timezone.utc)
    tasks = db.query(Task).join(Goal).filter(
        Goal.user_id == current_user.id,
        Task.status != TaskStatus.COMPLETED,
        Task.due_date >= now
    ).order_by(Task.due_date.asc()).limit(limit).all()
    
    return tasks

@router.get("/tasks/overdue", response_model=List[TaskResponse])
async def get_overdue_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get overdue tasks."""
    
    now = datetime.now(timezone.utc)
    tasks = db.query(Task).join(Goal).filter(
        Goal.user_id == current_user.id,
        Task.due_date < now,
        Task.status != TaskStatus.COMPLETED
    ).order_by(Task.due_date.asc()).all()
    
    return tasks 