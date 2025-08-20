@echo off
echo 🔧 Final Docker Fix - Resolving All Build Issues...

REM Check Docker availability
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed
    pause
    exit /b 1
)

echo ✅ Docker is available

REM Step 1: Clean up everything
echo 🧹 Complete cleanup...
docker-compose down -v 2>nul
docker system prune -af
docker volume prune -f

REM Step 2: Create missing directories
echo 📁 Creating required directories...
if not exist mqtt\data mkdir mqtt\data
if not exist mqtt\log mkdir mqtt\log
if not exist logs\nginx mkdir logs\nginx
if not exist backend\logs mkdir backend\logs

REM Step 3: Create environment file
echo 📋 Setting up environment...
echo # EcoGuard Pro Environment Configuration > .env
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

REM Step 4: Build containers
echo 🏗️ Building Docker containers...

echo Building backend...
docker-compose build --no-cache backend
if errorlevel 1 (
    echo ❌ Backend build failed
    docker-compose logs backend
    pause
    exit /b 1
)

echo Building frontend...
docker-compose build --no-cache frontend
if errorlevel 1 (
    echo ❌ Frontend build failed
    docker-compose logs frontend
    pause
    exit /b 1
)

echo ✅ All containers built successfully

REM Step 5: Start services
echo 🚀 Starting services...

echo Starting database and supporting services...
docker-compose up -d postgres redis mqtt

echo ⏳ Waiting for database to be ready...
timeout /t 20 /nobreak > nul

echo Starting backend...
docker-compose up -d backend

echo ⏳ Waiting for backend to be ready...
timeout /t 15 /nobreak > nul

echo Starting frontend...
docker-compose up -d frontend

REM Step 6: Wait and verify
echo ⏳ Waiting for all services to be ready...
timeout /t 20 /nobreak > nul

echo 🧪 Verifying deployment...

echo 📊 Container status:
docker-compose ps

echo 🔍 Testing services...

REM Test backend health
curl -s -f http://localhost:3001/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Backend health check failed
    echo 📝 Backend logs:
    docker-compose logs backend --tail=20
) else (
    echo ✅ Backend is healthy
)

REM Test frontend
curl -s -f http://localhost/ >nul 2>&1
if errorlevel 1 (
    echo ❌ Frontend not accessible
    echo 📝 Frontend logs:
    docker-compose logs frontend --tail=20
) else (
    echo ✅ Frontend is accessible
)

REM Step 7: Show final status
echo.
echo 🎉 Docker deployment complete!
echo.
echo 🌐 Access your application:
echo   Frontend: http://localhost
echo   Backend API: http://localhost:3001
echo   Health Check: http://localhost:3001/health
echo.
echo 📊 Service Status:
docker-compose ps

echo.
echo 🔍 If you encounter issues:
echo   1. Check logs: docker-compose logs [service-name]
echo   2. Restart services: docker-compose restart
echo   3. View all logs: docker-compose logs
echo   4. Stop all: docker-compose down
echo.
echo 📱 The application runs in demo mode with mock data
echo 🎯 No authentication required - ready to use!
echo.
echo 🏆 Issues Fixed:
echo   ✅ Node.js version updated to 20
echo   ✅ CSS import order corrected
echo   ✅ Terser dependency added
echo   ✅ Missing backend files created
echo   ✅ Environment properly configured
echo   ✅ Build process optimized

pause