@echo off
echo 🔧 Fixing Docker deployment issues...

REM Stop all containers
echo 🛑 Stopping all containers...
docker-compose down -v

REM Clean up Docker system
echo 🧹 Cleaning Docker system...
docker system prune -f

REM Remove any conflicting containers
echo 🗑️ Removing old containers...
docker rm -f ecoguard-frontend ecoguard-backend ecoguard-postgres ecoguard-mqtt ecoguard-redis 2>nul

REM Create necessary directories
echo 📁 Creating required directories...
if not exist logs\nginx mkdir logs\nginx
if not exist mqtt\config mkdir mqtt\config
if not exist mqtt\data mkdir mqtt\data
if not exist mqtt\log mkdir mqtt\log
if not exist nginx\ssl mkdir nginx\ssl

REM Create basic MQTT config if it doesn't exist
if not exist mqtt\config\mosquitto.conf (
    echo 📝 Creating MQTT configuration...
    echo # MQTT Broker Configuration > mqtt\config\mosquitto.conf
    echo listener 1883 >> mqtt\config\mosquitto.conf
    echo allow_anonymous true >> mqtt\config\mosquitto.conf
    echo persistence true >> mqtt\config\mosquitto.conf
    echo persistence_location /mosquitto/data/ >> mqtt\config\mosquitto.conf
    echo log_dest file /mosquitto/log/mosquitto.log >> mqtt\config\mosquitto.conf
    echo log_type error >> mqtt\config\mosquitto.conf
    echo log_type warning >> mqtt\config\mosquitto.conf
    echo log_type notice >> mqtt\config\mosquitto.conf
    echo log_type information >> mqtt\config\mosquitto.conf
)

REM Build and start containers
echo 🏗️ Building and starting containers...
docker-compose up --build -d

REM Wait for services to be ready
echo ⏳ Waiting for services to start...
timeout /t 30 /nobreak > nul

REM Check container status
echo 📊 Container status:
docker-compose ps

REM Check logs for any errors
echo 📝 Checking logs for errors...
echo === Backend Logs ===
docker-compose logs backend --tail=10
echo.
echo === Frontend Logs ===
docker-compose logs frontend --tail=10

REM Test endpoints
echo 🧪 Testing endpoints...
echo Testing backend health...
curl -f http://localhost:3001/health || echo ❌ Backend health check failed

echo Testing frontend...
curl -f http://localhost/health || echo ❌ Frontend health check failed

echo ✅ Docker deployment fix complete!
echo.
echo 🌐 Access your application:
echo   Frontend: http://localhost
echo   Backend API: http://localhost:3001
echo   Backend Health: http://localhost:3001/health
echo.
echo 📊 To monitor logs:
echo   docker-compose logs -f [service-name]
echo.
echo 🛑 To stop:
echo   docker-compose down

pause