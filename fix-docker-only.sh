#!/bin/bash

echo "🔧 Fixing EcoGuard Pro - Docker Only Method..."

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check Docker permissions
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker permission denied. Trying with sudo..."
    DOCKER_CMD="sudo docker"
    COMPOSE_CMD="sudo docker-compose"
else
    DOCKER_CMD="docker"
    COMPOSE_CMD="docker-compose"
fi

echo "🛑 Stopping existing containers..."
$COMPOSE_CMD down 2>/dev/null || true

echo "🧹 Cleaning up Docker..."
$DOCKER_CMD system prune -f

echo "📋 Setting up demo environment..."
cat > .env << 'EOF'
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

echo "🏗️ Building containers (this may take a few minutes)..."
$COMPOSE_CMD build --no-cache

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed. Checking common issues..."
    echo ""
    echo "🔍 Troubleshooting steps:"
    echo "1. Make sure Docker Desktop is running"
    echo "2. Check if you have enough disk space (need ~2GB)"
    echo "3. Try running with sudo: sudo docker-compose build --no-cache"
    echo "4. Check Docker logs: docker-compose logs"
    exit 1
fi

echo "🚀 Starting containers..."
$COMPOSE_CMD up -d

echo "⏳ Waiting for services to start..."
sleep 30

echo "🧪 Testing services..."

# Test frontend
echo "Testing frontend..."
if curl -s -f http://localhost/ >/dev/null; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend not responding"
fi

# Test backend
echo "Testing backend..."
if curl -s -f http://localhost:3001/health >/dev/null; then
    echo "✅ Backend is running"
else
    echo "❌ Backend not responding"
fi

echo ""
echo "📊 Container status:"
$COMPOSE_CMD ps

echo ""
echo "📝 Recent logs:"
echo "=== Frontend ==="
$COMPOSE_CMD logs frontend --tail=3
echo ""
echo "=== Backend ==="
$COMPOSE_CMD logs backend --tail=3

echo ""
echo "✅ Setup complete!"
echo ""
echo "🌐 Access your application:"
echo "  Frontend: http://localhost"
echo "  Backend API: http://localhost:3001"
echo "  Health Check: http://localhost:3001/health"
echo ""
echo "🔍 If you see issues:"
echo "  1. Check logs: $COMPOSE_CMD logs [service-name]"
echo "  2. Restart: $COMPOSE_CMD restart"
echo "  3. Hard refresh browser (Ctrl+F5)"
echo ""
echo "📱 The app runs in demo mode with mock sensor data"