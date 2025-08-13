@echo off
echo 🔍 Debugging Frontend Display Issues...

REM Check if containers are running
echo 📊 Container Status:
docker-compose ps

echo.
echo 🌐 Testing Frontend Endpoints:

REM Test frontend health
echo Testing frontend health...
curl -I http://localhost/health 2>nul || echo ❌ Frontend health check failed

REM Test if index.html is served
echo Testing index.html...
curl -I http://localhost/ 2>nul || echo ❌ Frontend root failed

echo.
echo 📝 Frontend Container Logs:
docker-compose logs frontend --tail=20

echo.
echo 🔧 Nginx Configuration Test:
docker-compose exec frontend nginx -t 2>nul || echo ❌ Nginx config test failed

echo.
echo 📁 Frontend Container File Structure:
docker-compose exec frontend ls -la /usr/share/nginx/html/ 2>nul || echo ❌ Cannot access frontend files

echo.
echo 🌐 Network Connectivity:
echo Testing backend connectivity from frontend container...
docker-compose exec frontend nc -zv backend 3001 2>nul || echo ❌ Cannot connect to backend

echo.
echo 🔍 Browser Console Errors:
echo Open browser developer tools (F12) and check for:
echo   - JavaScript errors in Console tab
echo   - Failed network requests in Network tab
echo   - Missing CSS/JS files

echo.
echo 💡 Quick Fixes to Try:
echo 1. Hard refresh browser (Ctrl+F5)
echo 2. Clear browser cache
echo 3. Try incognito/private browsing mode
echo 4. Check if ad blockers are interfering
echo 5. Rebuild containers: docker-compose up --build -d

pause