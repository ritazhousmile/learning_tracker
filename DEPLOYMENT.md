# 🚀 Personal Learning Tracker - Railway Deployment Guide

## Overview

This guide will help you deploy your Personal Learning Tracker application to Railway, a modern deployment platform that's perfect for full-stack applications like yours.

**Why Railway?**
- ✅ **Easy GitHub integration** - Deploy directly from your repository
- ✅ **Automatic builds** - No complex configuration needed
- ✅ **Free PostgreSQL database** - Production-ready database included
- ✅ **Environment variables** - Secure configuration management
- ✅ **Separate services** - Perfect for your frontend + backend structure
- ✅ **Custom domains** - Professional URLs for your application

## 🎯 Quick Deploy (5 minutes)

### Step 1: Prepare Your Repository
Your code is already pushed to GitHub at `https://github.com/ritazhousmile/learning_tracker.git` ✅

### Step 2: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up using your GitHub account (recommended for easier integration)
3. Verify your email if prompted

### Step 3: Deploy Backend Service

1. **Create New Project**
   - Click "New Project" in Railway dashboard
   - Select "Deploy from GitHub repo"
   - Choose your `learning_tracker` repository

2. **Configure Backend Service**
   - Railway will detect your project structure
   - Click on the backend service (it should auto-detect Python/FastAPI)
   - In the service settings:
     - **Root Directory**: `backend`
     - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Add PostgreSQL Database**
   - In your project dashboard, click "New Service"
   - Select "PostgreSQL"
   - Railway will automatically create the database and provide connection details

4. **Set Environment Variables**
   - Go to your backend service → "Variables" tab
   - Add these variables:
     ```
     DATABASE_URL=postgresql://postgres:password@host:port/database
     SECRET_KEY=your-super-secret-key-here-make-it-long-and-random
     ```
   - The `DATABASE_URL` will be automatically populated by Railway when you connect the PostgreSQL service

### Step 4: Deploy Frontend Service

1. **Add Frontend Service**
   - In the same project, click "New Service"
   - Select "GitHub Repo" → Choose your repository again
   - Configure the service:
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Start Command**: `npx serve -s build -l $PORT`

2. **Set Environment Variables**
   - Go to frontend service → "Variables" tab
   - Add:
     ```
     REACT_APP_API_URL=https://your-backend-service-url.railway.app
     ```
   - Replace `your-backend-service-url` with your actual backend URL from Railway

### Step 5: Connect Services
1. **Link Database to Backend**
   - In your backend service, go to "Variables"
   - Railway should automatically add the `DATABASE_URL` variable
   - If not, copy it from the PostgreSQL service

2. **Update Frontend API URL**
   - Get your backend service URL from Railway
   - Update the `REACT_APP_API_URL` variable in your frontend service

## 🔧 Configuration Files

Your project already includes the necessary configuration:

### Backend Configuration
- ✅ `requirements.txt` - Python dependencies
- ✅ `database.py` - PostgreSQL support
- ✅ `Dockerfile` - Container configuration (optional)

### Frontend Configuration
- ✅ `package.json` - Build scripts configured
- ✅ Environment variable support

## 🌐 Custom Domain (Optional)

1. **Backend Domain**
   - In your backend service → "Settings" → "Domains"
   - Add your custom domain (e.g., `api.mylearningtracker.com`)

2. **Frontend Domain**
   - In your frontend service → "Settings" → "Domains"
   - Add your custom domain (e.g., `mylearningtracker.com`)

## 🔍 Environment Variables Reference

### Backend Variables
```bash
# Required
DATABASE_URL=postgresql://postgres:password@host:port/database
SECRET_KEY=your-super-secret-key-here

# Optional
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend Variables
```bash
# Required
REACT_APP_API_URL=https://your-backend-service-url.railway.app

# Optional
REACT_APP_ENVIRONMENT=production
```

## 🐛 Troubleshooting

### Common Issues

1. **"react-scripts: not found" Error**
   - ✅ **Fixed**: Your `package.json` build script now includes `npm install`
   - The script: `"build": "cd frontend && npm install && npm run build"`

2. **Database Connection Error**
   - Check that PostgreSQL service is running
   - Verify `DATABASE_URL` is correctly set
   - Ensure the database service is linked to your backend

3. **Frontend Can't Connect to Backend**
   - Verify `REACT_APP_API_URL` points to your backend service URL
   - Check that both services are deployed and running
   - Ensure CORS is properly configured in your FastAPI backend

4. **Build Fails**
   - Check the build logs in Railway dashboard
   - Verify all dependencies are listed in `requirements.txt` and `package.json`
   - Ensure the root directory is set correctly for each service

### Checking Deployment Status

1. **Service Health**
   - Each service should show "Active" status
   - Check the logs for any errors
   - Verify the health check endpoints are working

2. **Database Connection**
   - Test the backend API endpoints
   - Check that data is being stored correctly
   - Verify authentication is working

## 📝 Deployment Checklist

### Before Deployment
- [ ] Code pushed to GitHub
- [ ] Environment variables documented
- [ ] Database migrations ready
- [ ] Frontend build tested locally

### During Deployment
- [ ] PostgreSQL service created
- [ ] Backend service configured with correct root directory
- [ ] Frontend service configured with correct root directory
- [ ] Environment variables set for both services
- [ ] Services linked and communicating

### After Deployment
- [ ] Both services showing "Active" status
- [ ] Frontend loads correctly
- [ ] Backend API responding
- [ ] Database operations working
- [ ] Authentication functioning
- [ ] All features tested

## 🎉 Success!

Once deployed, your Learning Tracker will be available at:
- **Frontend**: `https://your-frontend-service.railway.app`
- **Backend API**: `https://your-backend-service.railway.app`
- **API Documentation**: `https://your-backend-service.railway.app/docs`

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Railway GitHub Integration](https://docs.railway.app/deployment/github)
- [Environment Variables Guide](https://docs.railway.app/deployment/environment-variables)
- [Custom Domains](https://docs.railway.app/deployment/custom-domains)

## 🆘 Need Help?

If you encounter any issues:
1. Check the Railway service logs for detailed error messages
2. Verify all environment variables are correctly set
3. Ensure your GitHub repository is up to date
4. Check that both services are using the correct root directories

Your Learning Tracker is now ready for production use! 🎯 