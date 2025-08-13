#!/bin/bash

echo "🔧 Fixing Static Assets Issue..."

# Stop containers
echo "🛑 Stopping containers..."
docker-compose down

# Clean everything
echo "🧹 Cleaning up..."
docker system prune -f
rm -rf dist/

# Test build locally first
echo "🧪 Testing local build..."
npm install --legacy-peer-deps
cp .env.docker .env
npm run build

# Check if local build worked
if [ ! -d "dist" ]; then
    echo "❌ Local build failed. Check for errors above."
    exit 1
fi

echo "✅ Local build successful. Files in dist:"
ls -la dist/

# Rebuild Docker containers
echo "🏗️ Rebuilding Docker containers..."
docker-compose build --no-cache frontend

# Start containers
echo "🚀 Starting containers..."
docker-compose up -d

# Wait for startup
echo "⏳ Waiting for services..."
sleep 15

# Check if files are in the container
echo "📁 Checking files in container..."
docker-compose exec frontend ls -la /usr/share/nginx/html/

# Test static file serving
echo "🧪 Testing static file serving..."
echo "Testing index.html:"
curl -s -o /dev/null -w "%{http_code}" http://localhost/
echo ""

echo "Testing vite.svg:"
curl -s -o /dev/null -w "%{http_code}" http://localhost/vite.svg
echo ""

# Check nginx error logs
echo "📝 Nginx error logs:"
docker-compose exec frontend cat /var/log/nginx/error.log 2>/dev/null || echo "No error logs found"

# Show recent container logs
echo "📋 Container logs:"
docker-compose logs frontend --tail=10

echo ""
echo "✅ Fix complete!"
echo "🌐 Try accessing: http://localhost"
echo "🔍 If still issues, check browser console (F12) for specific errors"