@echo off
echo 🔧 Fixing EcoGuard Pro - Docker Only Method...

REM Check if Docker is available
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed or not in PATH
    echo Please install Docker Desktop: https://docs.docker.com/get-docker/
    pause
    exit /b 1
)

echo 🛑 Stopping existing containers...
docker-compose down 2>nul

echo 🧹 Cleaning up Docker...
docker system prune -f

echo 📋 Setting up demo environment...
echo # Demo Environment Configuration > .env
echo VITE_SUPABASE_URL= >> .env
echo VITE_SUPABASE_ANON_KEY= >> .env
echo. >> .env
echo # API Configuration >> .env
echo VITE_API_URL=http://localhost:3001/api/v1 >> .env
echo VITE_WEBSOCKET_URL=ws://localhost:3001 >> .env
echo. >> .env
echo # Feature Flags >> .env
echo VITE_ENABLE_WEBSOCKETS=false >> .env
echo VITE_ENABLE_AUTH=false >> .env
echo VITE_DEMO_MODE=true >> .env
echo. >> .env
echo # App Configuration >> .env
echo VITE_APP_NAME=EcoGuard Pro >> .env
echo VITE_APP_VERSION=1.0.0 >> .env

echo 🏗️ Building containers (this may take a few minutes)...
docker-compose build --no-cache

if errorlevel 1 (
    echo ❌ Docker build failed. Checking common issues...
    echo.
    echo 🔍 Troubleshooting steps:
    echo 1. Make sure Docker Desktop is running
    echo 2. Check if you have enough disk space (need ~2GB)
    echo 3. Check Docker logs: docker-compose logs
    pause
    exit /b 1
)

echo 🚀 Starting containers...
docker-compose up -d

echo ⏳ Waiting for services to start...
timeout /t 30 /nobreak > nul

echo 🧪 Testing services...

REM Test frontend
echo Testing frontend...
curl -s -f http://localhost/ >nul 2>&1
if errorlevel 1 (
    echo ❌ Frontend not responding
) else (
    echo ✅ Frontend is running
)

REM Test backend
echo Testing backend...
curl -s -f http://localhost:3001/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Backend not responding
) else (
    echo ✅ Backend is running
)

echo.
echo 📊 Container status:
docker-compose ps

echo.
echo 📝 Recent logs:
echo === Frontend ===
docker-compose logs frontend --tail=3
echo.
echo === Backend ===
docker-compose logs backend --tail=3

echo.
echo ✅ Setup complete!
echo.
echo 🌐 Access your application:
echo   Frontend: http://localhost
echo   Backend API: http://localhost:3001
echo   Health Check: http://localhost:3001/health
echo.
echo 🔍 If you see issues:
echo   1. Check logs: docker-compose logs [service-name]
echo   2. Restart: docker-compose restart
echo   3. Hard refresh browser (Ctrl+F5)
echo.
echo 📱 The app runs in demo mode with mock sensor data

pause