# Personal Learning Tracker

A comprehensive web application for tracking personal learning goals, tasks, and progress. Built with Python FastAPI backend, PostgreSQL database, and React TypeScript frontend.

## Features

✅ **User Authentication**
- Secure signup/login with JWT tokens
- Protected routes and user sessions

✅ **Learning Goals Management**
- Create, edit, and delete learning goals
- Set deadlines and track progress
- Automatic progress calculation based on task completion

✅ **Task Management**
- Create tasks linked to learning goals
- Track task status (Not Started, In Progress, Completed)
- Set due dates and manage priorities

✅ **Progress Tracking**
- Visual progress bars for goals
- Completion percentage calculations
- Progress history and analytics

✅ **Dashboard**
- Overview of all goals and tasks
- Statistics and key metrics
- Recent activity and upcoming deadlines

✅ **Data Visualization**
- Interactive charts showing progress over time
- Completion rates and trends
- Visual feedback on learning journey

## Tech Stack

### Backend
- **Python 3.9+** with FastAPI
- **PostgreSQL** for data storage
- **SQLAlchemy** for ORM
- **JWT** for authentication
- **Pydantic** for data validation

### Frontend
- **React 18** with TypeScript
- **Material-UI (MUI)** for UI components
- **Chart.js** for data visualization
- **Axios** for API communication
- **React Router** for navigation

## Prerequisites

- Python 3.9 or higher
- Node.js 16 or higher
- PostgreSQL 12 or higher
- npm or yarn

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd personal-learning-tracker
```

### 2. Backend Setup

#### Install Python dependencies

```bash
cd backend
pip install -r requirements.txt
```

#### Set up PostgreSQL database

1. Create a PostgreSQL database:
```sql
CREATE DATABASE learning_tracker;
```

2. Create a `.env` file in the backend directory:
```bash
cp env.example .env
```

3. Update the `.env` file with your database credentials:
```env
DATABASE_URL=postgresql://username:password@localhost/learning_tracker
SECRET_KEY=your-very-secure-secret-key-change-this-in-production
```

#### Run database migrations

```bash
# The application will automatically create tables on startup
python main.py
```

### 3. Frontend Setup

#### Install dependencies

```bash
cd frontend
npm install
```

#### Set up environment variables

Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:8000
```

## Running the Application

### Development Mode

#### Start the backend server

```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at `http://localhost:8000`

#### Start the frontend development server

```bash
cd frontend
npm start
```

The frontend will be available at `http://localhost:3000`

#### Run both simultaneously

From the project root:
```bash
npm run dev
```

## API Documentation

Once the backend is running, you can access the automatic API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Project Structure

```
personal-learning-tracker/
├── backend/                    # Python FastAPI backend
│   ├── routers/               # API route handlers
│   │   ├── auth.py           # Authentication endpoints
│   │   ├── goals.py          # Goals management
│   │   ├── tasks.py          # Tasks management
│   │   └── dashboard.py      # Dashboard data
│   ├── models.py             # Database models
│   ├── schemas.py            # Pydantic schemas
│   ├── database.py           # Database configuration
│   ├── auth_utils.py         # Authentication utilities
│   ├── main.py               # FastAPI application
│   └── requirements.txt      # Python dependencies
├── frontend/                  # React TypeScript frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── Auth/        # Authentication components
│   │   │   ├── Dashboard/   # Dashboard components
│   │   │   ├── Goals/       # Goals management
│   │   │   ├── Tasks/       # Tasks management
│   │   │   └── Layout/      # Layout components
│   │   ├── contexts/        # React contexts
│   │   ├── config/          # Configuration files
│   │   ├── types/           # TypeScript type definitions
│   │   └── App.tsx          # Main React component
│   ├── package.json         # Node.js dependencies
│   └── public/              # Static files
├── package.json             # Root package.json for scripts
└── README.md               # This file
```

## Key Features Explained

### Authentication System
- JWT-based authentication with automatic token refresh
- Protected routes that redirect to login if not authenticated
- User session management with localStorage

### Goal Management
- Create goals with titles, descriptions, and deadlines
- Automatic progress calculation based on linked tasks
- Visual progress indicators and completion tracking

### Task Management
- Tasks linked to specific goals
- Three status levels: Not Started, In Progress, Completed
- Due date tracking and overdue task identification

### Dashboard Analytics
- Real-time statistics on goals and tasks
- Progress visualization with interactive charts
- Upcoming deadlines and recent activity

### Data Visualization
- Chart.js integration for progress tracking
- Time-based analytics with selectable periods
- Completion rates and trend analysis

## Database Schema

### Users Table
- id, email, username, password (hashed)
- first_name, last_name, created_at, updated_at

### Goals Table
- id, title, description, deadline, user_id
- created_at, updated_at
- Calculated: progress_percentage, total_tasks, completed_tasks

### Tasks Table
- id, title, description, status, goal_id
- due_date, completed_at, created_at, updated_at

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Future Enhancements

- [ ] Email reminders for upcoming deadlines
- [ ] Goal categories and tags
- [ ] Collaborative goals and shared progress
- [ ] Mobile app version
- [ ] Data export functionality
- [ ] Advanced analytics and reporting
- [ ] Learning streaks and achievements
- [ ] Integration with external learning platforms

## Support

For questions or issues, please open an issue in the repository or contact the development team. 