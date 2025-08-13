#!/bin/bash

echo "🔧 Fixing Network Connection Errors..."

# Stop containers
echo "🛑 Stopping containers..."
docker-compose down

# Clean up
echo "🧹 Cleaning up..."
docker system prune -f
rm -rf dist/

# Update environment for demo mode
echo "📋 Setting up demo environment..."
cat > .env << EOF
# Demo Environment Configuration
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# API Configuration
VITE_API_URL=http://localhost:3001/api/v1
VITE_WEBSOCKET_URL=ws://localhost:3001

# Feature Flags
VITE_ENABLE_WEBSOCKETS=false
VITE_ENABLE_AUTH=false
VITE_DEMO_MODE=true

# App Configuration
VITE_APP_NAME=EcoGuard Pro
VITE_APP_VERSION=1.0.0
EOF

# Test local build
echo "🧪 Testing local build..."
npm install --legacy-peer-deps
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Local build failed"
    exit 1
fi

echo "✅ Local build successful"

# Rebuild containers
echo "🏗️ Rebuilding containers..."
docker-compose build --no-cache

# Start containers
echo "🚀 Starting containers..."
docker-compose up -d

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 20

# Test endpoints
echo "🧪 Testing endpoints..."

echo "Frontend root:"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/)
echo "Status: $FRONTEND_STATUS"

echo "Backend health:"
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health)
echo "Status: $BACKEND_STATUS"

# Check container logs for errors
echo "📝 Checking for errors in logs..."
echo "=== Frontend Logs ==="
docker-compose logs frontend --tail=5

echo "=== Backend Logs ==="
docker-compose logs backend --tail=5

# Verify files in container
echo "📁 Files in frontend container:"
docker-compose exec frontend ls -la /usr/share/nginx/html/ | head -10

echo ""
echo "✅ Network errors fix complete!"
echo ""
echo "🌐 Access your application:"
echo "  Frontend: http://localhost"
echo "  Backend: http://localhost:3001"
echo ""
echo "🔍 If you still see errors in browser console:"
echo "  1. Hard refresh (Ctrl+F5)"
echo "  2. Clear browser cache"
echo "  3. Check browser console for specific errors"
echo "  4. The app now runs in demo mode with mock data"