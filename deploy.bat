@echo off
echo 🚀 Starting CineWave Deployment Process...

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Vercel CLI is not installed. Installing now...
    npm install -g vercel
)

REM Check if user is logged in to Vercel
vercel whoami >nul 2>&1
if errorlevel 1 (
    echo [WARNING] You are not logged in to Vercel. Please login first.
    vercel login
)

echo [INFO] Starting backend deployment...

REM Deploy backend
cd backend
echo [INFO] Deploying backend to Vercel...
vercel --prod --yes

cd ..

echo [INFO] Starting frontend deployment...

REM Deploy frontend
cd frontend
echo [INFO] Deploying frontend to Vercel...
vercel --prod --yes

cd ..

echo [INFO] Deployment completed!
echo.
echo 📋 Next Steps:
echo 1. Set environment variables in Vercel dashboard for both projects
echo 2. Update CORS settings in backend with frontend URL
echo 3. Update frontend environment variables with backend URL
echo 4. Test all features
echo.
echo 🔗 Check your Vercel dashboard for the deployed URLs
pause 