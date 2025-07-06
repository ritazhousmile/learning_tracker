# 🚀 Learning Tracker Deployment Guide

## Option 1: Railway (Recommended - Easiest)

### Step 1: Prepare Your Repository
1. Make sure your code is pushed to GitHub
2. Ensure both `backend/` and `frontend/` directories are in your repository

### Step 2: Deploy Backend on Railway
1. Go to [railway.app](https://railway.app) and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your learning_tracker repository
4. Choose "Add PostgreSQL" from the services menu
5. Configure environment variables:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   SECRET_KEY=your-secret-key-here
   ```
6. Railway will automatically detect your FastAPI app and deploy it

### Step 3: Deploy Frontend on Railway
1. In the same Railway project, click "Add Service"
2. Select "GitHub Repo" and choose your repository again
3. Set the root directory to `frontend/`
4. Add environment variable:
   ```
   REACT_APP_API_URL=https://your-backend-url.railway.app
   ```
5. Railway will build and deploy your React app

### Step 4: Update Frontend API URL
Update `frontend/src/services/api.ts` to use environment variable:
```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
```

---

## Option 2: Vercel (Frontend) + Railway (Backend)

### Step 1: Deploy Backend on Railway
Follow the backend deployment steps from Option 1

### Step 2: Deploy Frontend on Vercel
1. Go to [vercel.com](https://vercel.com) and sign up
2. Import your GitHub repository
3. Set the root directory to `frontend/`
4. Add environment variable:
   ```
   REACT_APP_API_URL=https://your-backend-url.railway.app
   ```
5. Deploy with one click!

---

## Option 3: Render (Full-stack)

### Step 1: Deploy Database
1. Go to [render.com](https://render.com) and sign up
2. Create a new PostgreSQL database
3. Note the database URL provided

### Step 2: Deploy Backend
1. Create a new Web Service
2. Connect your GitHub repository
3. Set the root directory to `backend/`
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables:
   ```
   DATABASE_URL=your-postgresql-url
   SECRET_KEY=your-secret-key
   ```

### Step 3: Deploy Frontend
1. Create a new Static Site
2. Connect your GitHub repository
3. Set the root directory to `frontend/`
4. Set build command: `npm run build`
5. Set publish directory: `build`
6. Add environment variable:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   ```

---

## 🔧 Pre-Deployment Checklist

- [ ] Update `frontend/src/services/api.ts` to use environment variables
- [ ] Ensure `backend/requirements.txt` includes all dependencies
- [ ] Test both frontend and backend locally
- [ ] Push all changes to GitHub
- [ ] Set up environment variables in deployment platform
- [ ] Configure database connection for production

## 📋 Environment Variables Needed

### Backend (.env)
```
DATABASE_URL=postgresql://username:password@host:port/database
SECRET_KEY=your-secret-key-here
```

### Frontend (.env)
```
REACT_APP_API_URL=https://your-backend-url.domain.com
```

## 🎯 My Recommendation

**Use Railway** - it's the easiest option because:
- ✅ Handles both frontend and backend
- ✅ Provides free PostgreSQL database
- ✅ Automatic deployments from GitHub
- ✅ Simple environment variable management
- ✅ Good free tier

## 🆘 Need Help?

If you encounter issues:
1. Check the deployment logs in your platform dashboard
2. Verify environment variables are set correctly
3. Ensure your database is accessible
4. Test API endpoints manually

## 💡 Post-Deployment

After deployment:
1. Test user registration and login
2. Create a sample goal and task
3. Verify all CRUD operations work
4. Check the dashboard displays correctly

Your Learning Tracker will be live and accessible worldwide! 🌍 