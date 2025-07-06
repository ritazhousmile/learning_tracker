from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
import uvicorn
from database import engine, Base, get_db
from routers import auth, goals, tasks, dashboard
from auth_utils import verify_token, get_current_user
import os
from dotenv import load_dotenv

load_dotenv()

# Create database tables
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup
    Base.metadata.create_all(bind=engine)
    yield
    # Clean up resources on shutdown

app = FastAPI(
    title="Personal Learning Tracker API",
    description="A comprehensive API for tracking personal learning goals and tasks",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security scheme
security = HTTPBearer()

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(goals.router, prefix="/api/goals", tags=["goals"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])

@app.get("/")
async def root():
    return {"message": "Personal Learning Tracker API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is running smoothly"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 