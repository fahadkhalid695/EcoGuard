#!/bin/bash

echo "🔧 Fixing Docker deployment issues..."

# Stop all containers
echo "🛑 Stopping all containers..."
docker-compose down -v

# Clean up Docker system
echo "🧹 Cleaning Docker system..."
docker system prune -f

# Remove any conflicting containers
echo "🗑️ Removing old containers..."
docker rm -f ecoguard-frontend ecoguard-backend ecoguard-postgres ecoguard-mqtt ecoguard-redis 2>/dev/null || true

# Remove any conflicting images
echo "🗑️ Removing old images..."
docker rmi -f $(docker images | grep ecoguard | awk '{print $3}') 2>/dev/null || true

# Create necessary directories
echo "📁 Creating required directories..."
mkdir -p logs/nginx
mkdir -p mqtt/config
mkdir -p mqtt/data
mkdir -p mqtt/log
mkdir -p nginx/ssl

# Create basic MQTT config if it doesn't exist
if [ ! -f mqtt/config/mosquitto.conf ]; then
    echo "📝 Creating MQTT configuration..."
    cat > mqtt/config/mosquitto.conf << EOF
# MQTT Broker Configuration
listener 1883
allow_anonymous true
persistence true
persistence_location /mosquitto/data/
log_dest file /mosquitto/log/mosquitto.log
log_type error
log_type warning
log_type notice
log_type information
EOF
fi

# Build and start containers
echo "🏗️ Building and starting containers..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check container status
echo "📊 Container status:"
docker-compose ps

# Check logs for any errors
echo "📝 Checking logs for errors..."
echo "=== Backend Logs ==="
docker-compose logs backend --tail=10
echo ""
echo "=== Frontend Logs ==="
docker-compose logs frontend --tail=10
echo ""
echo "=== Nginx Logs ==="
docker-compose logs frontend --tail=10 | grep nginx

# Test endpoints
echo "🧪 Testing endpoints..."
echo "Testing backend health..."
curl -f http://localhost:3001/health || echo "❌ Backend health check failed"

echo "Testing frontend..."
curl -f http://localhost/health || echo "❌ Frontend health check failed"

echo "✅ Docker deployment fix complete!"
echo ""
echo "🌐 Access your application:"
echo "  Frontend: http://localhost"
echo "  Backend API: http://localhost:3001"
echo "  Backend Health: http://localhost:3001/health"
echo ""
echo "📊 To monitor logs:"
echo "  docker-compose logs -f [service-name]"
echo ""
echo "🛑 To stop:"
echo "  docker-compose down"