@echo off
echo 🔧 Fixing Static Assets Issue...

REM Stop containers
echo 🛑 Stopping containers...
docker-compose down

REM Clean everything
echo 🧹 Cleaning up...
docker system prune -f
if exist dist rmdir /s /q dist

REM Test build locally first
echo 🧪 Testing local build...
npm install --legacy-peer-deps
copy .env.docker .env
npm run build

REM Check if local build worked
if not exist dist (
    echo ❌ Local build failed. Check for errors above.
    exit /b 1
)

echo ✅ Local build successful. Files in dist:
dir dist

REM Rebuild Docker containers
echo 🏗️ Rebuilding Docker containers...
docker-compose build --no-cache frontend

REM Start containers
echo 🚀 Starting containers...
docker-compose up -d

REM Wait for startup
echo ⏳ Waiting for services...
timeout /t 15 /nobreak > nul

REM Check if files are in the container
echo 📁 Checking files in container...
docker-compose exec frontend ls -la /usr/share/nginx/html/

REM Test static file serving
echo 🧪 Testing static file serving...
echo Testing index.html:
curl -s -o nul -w "%%{http_code}" http://localhost/
echo.

echo Testing vite.svg:
curl -s -o nul -w "%%{http_code}" http://localhost/vite.svg
echo.

REM Show recent container logs
echo 📋 Container logs:
docker-compose logs frontend --tail=10

echo.
echo ✅ Fix complete!
echo 🌐 Try accessing: http://localhost
echo 🔍 If still issues, check browser console (F12) for specific errors

pause