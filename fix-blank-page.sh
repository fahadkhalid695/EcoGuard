#!/bin/bash

echo "🔧 Fixing Blank Page Issue..."

# Stop containers
echo "🛑 Stopping containers..."
docker-compose down

# Clean up
echo "🧹 Cleaning up..."
docker system prune -f

# Rebuild with no cache
echo "🏗️ Rebuilding containers with no cache..."
docker-compose build --no-cache

# Start containers
echo "🚀 Starting containers..."
docker-compose up -d

# Wait for startup
echo "⏳ Waiting for services to start..."
sleep 20

# Check if files are properly built
echo "📁 Checking built files..."
docker-compose exec frontend ls -la /usr/share/nginx/html/

# Test endpoints
echo "🧪 Testing endpoints..."
echo "Frontend root:"
curl -s -o /dev/null -w "%{http_code}" http://localhost/
echo ""

echo "Frontend health:"
curl -s -o /dev/null -w "%{http_code}" http://localhost/health
echo ""

echo "Backend health:"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health
echo ""

# Show logs
echo "📝 Recent logs:"
docker-compose logs frontend --tail=10
docker-compose logs backend --tail=10

echo ""
echo "✅ Fix complete! Try accessing http://localhost in your browser"
echo "If still blank, run: ./debug-frontend.sh"