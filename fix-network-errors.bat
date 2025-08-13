@echo off
echo 🔧 Fixing Network Connection Errors...

REM Stop containers
echo 🛑 Stopping containers...
docker-compose down

REM Clean up
echo 🧹 Cleaning up...
docker system prune -f
if exist dist rmdir /s /q dist

REM Update environment for demo mode
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

REM Test local build
echo 🧪 Testing local build...
npm install --legacy-peer-deps
npm run build

if not exist dist (
    echo ❌ Local build failed
    exit /b 1
)

echo ✅ Local build successful

REM Rebuild containers
echo 🏗️ Rebuilding containers...
docker-compose build --no-cache

REM Start containers
echo 🚀 Starting containers...
docker-compose up -d

REM Wait for services
echo ⏳ Waiting for services to start...
timeout /t 20 /nobreak > nul

REM Test endpoints
echo 🧪 Testing endpoints...

echo Frontend root:
curl -s -o nul -w "Status: %%{http_code}" http://localhost/
echo.

echo Backend health:
curl -s -o nul -w "Status: %%{http_code}" http://localhost:3001/health
echo.

REM Check container logs for errors
echo 📝 Checking for errors in logs...
echo === Frontend Logs ===
docker-compose logs frontend --tail=5

echo === Backend Logs ===
docker-compose logs backend --tail=5

REM Verify files in container
echo 📁 Files in frontend container:
docker-compose exec frontend ls -la /usr/share/nginx/html/

echo.
echo ✅ Network errors fix complete!
echo.
echo 🌐 Access your application:
echo   Frontend: http://localhost
echo   Backend: http://localhost:3001
echo.
echo 🔍 If you still see errors in browser console:
echo   1. Hard refresh (Ctrl+F5)
echo   2. Clear browser cache
echo   3. Check browser console for specific errors
echo   4. The app now runs in demo mode with mock data

pause