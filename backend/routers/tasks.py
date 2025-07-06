from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Task, Goal, User, TaskStatus
from schemas import TaskCreate, TaskUpdate, TaskResponse
from auth_utils import get_current_user

router = APIRouter()

@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new task."""
    
    # Verify that the goal belongs to the current user
    goal = db.query(Goal).filter(
        Goal.id == task.goal_id,
        Goal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    db_task = Task(
        title=task.title,
        description=task.description,
        due_date=task.due_date,
        priority=task.priority,
        estimated_hours=task.estimated_hours,
        goal_id=task.goal_id
    )
    
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    return db_task

@router.get("/", response_model=List[TaskResponse])
async def get_tasks(
    goal_id: int = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all tasks for the current user, optionally filtered by goal."""
    
    query = db.query(Task).join(Goal).filter(Goal.user_id == current_user.id)
    
    if goal_id:
        query = query.filter(Task.goal_id == goal_id)
    
    tasks = query.all()
    return tasks

@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific task by ID."""
    
    task = db.query(Task).join(Goal).filter(
        Task.id == task_id,
        Goal.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    return task

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a specific task."""
    
    task = db.query(Task).join(Goal).filter(
        Task.id == task_id,
        Goal.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Update fields if provided
    if task_update.title is not None:
        task.title = task_update.title
    if task_update.description is not None:
        task.description = task_update.description
    if task_update.due_date is not None:
        task.due_date = task_update.due_date
    if task_update.priority is not None:
        task.priority = task_update.priority
    if task_update.estimated_hours is not None:
        task.estimated_hours = task_update.estimated_hours
    if task_update.status is not None:
        # Update status using the model methods
        if task_update.status == TaskStatus.COMPLETED:
            task.mark_completed()
        elif task_update.status == TaskStatus.IN_PROGRESS:
            task.mark_in_progress()
        elif task_update.status == TaskStatus.NOT_STARTED:
            task.mark_not_started()
    
    db.commit()
    db.refresh(task)
    
    return task

@router.patch("/{task_id}/status", response_model=TaskResponse)
async def update_task_status(
    task_id: int,
    status: TaskStatus,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update only the status of a task."""
    
    task = db.query(Task).join(Goal).filter(
        Task.id == task_id,
        Goal.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Update status using the model methods
    if status == TaskStatus.COMPLETED:
        task.mark_completed()
    elif status == TaskStatus.IN_PROGRESS:
        task.mark_in_progress()
    elif status == TaskStatus.NOT_STARTED:
        task.mark_not_started()
    
    db.commit()
    db.refresh(task)
    
    return task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a specific task."""
    
    task = db.query(Task).join(Goal).filter(
        Task.id == task_id,
        Goal.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    db.delete(task)
    db.commit()
    
    return None 