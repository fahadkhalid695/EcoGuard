@echo off
echo 🔧 Fixing Blank Page Issue...

REM Stop containers
echo 🛑 Stopping containers...
docker-compose down

REM Clean up
echo 🧹 Cleaning up...
docker system prune -f

REM Rebuild with no cache
echo 🏗️ Rebuilding containers with no cache...
docker-compose build --no-cache

REM Start containers
echo 🚀 Starting containers...
docker-compose up -d

REM Wait for startup
echo ⏳ Waiting for services to start...
timeout /t 20 /nobreak > nul

REM Check if files are properly built
echo 📁 Checking built files...
docker-compose exec frontend ls -la /usr/share/nginx/html/

REM Test endpoints
echo 🧪 Testing endpoints...
echo Frontend root:
curl -s -o nul -w "%%{http_code}" http://localhost/
echo.

echo Frontend health:
curl -s -o nul -w "%%{http_code}" http://localhost/health
echo.

echo Backend health:
curl -s -o nul -w "%%{http_code}" http://localhost:3001/health
echo.

REM Show logs
echo 📝 Recent logs:
docker-compose logs frontend --tail=10
docker-compose logs backend --tail=10

echo.
echo ✅ Fix complete! Try accessing http://localhost in your browser
echo If still blank, run: debug-frontend.bat

pause