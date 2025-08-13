#!/bin/bash

# EcoGuard Pro Docker Build Script
echo "🚀 Building EcoGuard Pro Docker containers..."

# Stop any running containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Remove old images (optional - uncomment if you want to rebuild from scratch)
# docker-compose down --rmi all

# Build and start containers
echo "🏗️ Building and starting containers..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check container status
echo "📊 Container status:"
docker-compose ps

# Show logs for backend (to check for any startup issues)
echo "📝 Backend logs:"
docker-compose logs backend --tail=20

echo "✅ Build complete!"
echo "🌐 Frontend: http://localhost"
echo "🔧 Backend API: http://localhost:3001"
echo "📊 MQTT Broker: localhost:1883"
echo "🗄️ PostgreSQL: localhost:5432"

echo ""
echo "To view logs: docker-compose logs [service-name]"
echo "To stop: docker-compose down"
echo "To rebuild: docker-compose up --build"