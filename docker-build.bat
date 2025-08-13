@echo off
REM EcoGuard Pro Docker Build Script for Windows

echo 🚀 Building EcoGuard Pro Docker containers...

REM Stop any running containers
echo 🛑 Stopping existing containers...
docker-compose down

REM Build and start containers
echo 🏗️ Building and starting containers...
docker-compose up --build -d

REM Wait for services to be ready
echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak > nul

REM Check container status
echo 📊 Container status:
docker-compose ps

REM Show logs for backend
echo 📝 Backend logs:
docker-compose logs backend --tail=20

echo ✅ Build complete!
echo 🌐 Frontend: http://localhost
echo 🔧 Backend API: http://localhost:3001
echo 📊 MQTT Broker: localhost:1883
echo 🗄️ PostgreSQL: localhost:5432

echo.
echo To view logs: docker-compose logs [service-name]
echo To stop: docker-compose down
echo To rebuild: docker-compose up --build

pause