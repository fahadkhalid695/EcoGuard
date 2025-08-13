#!/bin/bash

echo "🔧 Comprehensive Docker Fix for EcoGuard Pro..."

# Check Docker availability
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    exit 1
fi

# Check Docker permissions
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker permission denied. Please run with sudo or fix Docker permissions"
    echo "Try: sudo usermod -aG docker \$USER && newgrp docker"
    exit 1
fi

echo "✅ Docker is available and accessible"

# Step 1: Create missing files and directories
echo "📁 Creating missing files and directories..."
chmod +x create-missing-files.sh
./create-missing-files.sh

# Step 2: Clean up existing containers and images
echo "🧹 Cleaning up existing Docker resources..."
docker-compose down -v 2>/dev/null || true
docker system prune -f
docker volume prune -f

# Step 3: Create proper environment file
echo "📋 Setting up environment configuration..."
cat > .env << 'EOF'
# EcoGuard Pro Environment Configuration
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

# Step 4: Create .dockerignore files to optimize builds
echo "📝 Creating .dockerignore files..."
cat > .dockerignore << 'EOF'
node_modules
npm-debug.log
.env.local
.env.development.local
.env.test.local
.env.production.local
.git
.gitignore
README.md
.DS_Store
.vscode
.idea
*.swp
*.swo
*~
dist
build
coverage
.nyc_output
logs
*.log
EOF

cat > backend/.dockerignore << 'EOF'
node_modules
npm-debug.log
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
logs
*.log
.git
.gitignore
README.md
.DS_Store
.vscode
.idea
*.swp
*.swo
*~
coverage
.nyc_output
EOF

# Step 5: Build containers with proper error handling
echo "🏗️ Building Docker containers..."

echo "Building backend..."
if ! docker-compose build backend; then
    echo "❌ Backend build failed"
    echo "📝 Backend build logs:"
    docker-compose logs backend
    exit 1
fi

echo "Building frontend..."
if ! docker-compose build frontend; then
    echo "❌ Frontend build failed"
    echo "📝 Frontend build logs:"
    docker-compose logs frontend
    exit 1
fi

echo "✅ All containers built successfully"

# Step 6: Start services in correct order
echo "🚀 Starting services..."

# Start database and supporting services first
echo "Starting database and supporting services..."
docker-compose up -d postgres redis mqtt

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 15

# Start backend
echo "Starting backend..."
docker-compose up -d backend

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
sleep 10

# Start frontend
echo "Starting frontend..."
docker-compose up -d frontend

# Step 7: Wait for all services to be ready
echo "⏳ Waiting for all services to start..."
sleep 20

# Step 8: Verify deployment
echo "🧪 Verifying deployment..."

# Check container status
echo "📊 Container status:"
docker-compose ps

# Test services
echo "🔍 Testing services..."

# Test backend health
if curl -s -f http://localhost:3001/health >/dev/null; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    echo "📝 Backend logs:"
    docker-compose logs backend --tail=10
fi

# Test frontend
if curl -s -f http://localhost/ >/dev/null; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend not accessible"
    echo "📝 Frontend logs:"
    docker-compose logs frontend --tail=10
fi

# Check if static files are served
if curl -s -f http://localhost/vite.svg >/dev/null; then
    echo "✅ Static files are being served"
else
    echo "⚠️ Static files may not be served correctly"
fi

# Step 9: Show final status
echo ""
echo "🎉 Docker deployment complete!"
echo ""
echo "🌐 Access your application:"
echo "  Frontend: http://localhost"
echo "  Backend API: http://localhost:3001"
echo "  Health Check: http://localhost:3001/health"
echo ""
echo "📊 Service Status:"
docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🔍 If you encounter issues:"
echo "  1. Check logs: docker-compose logs [service-name]"
echo "  2. Restart services: docker-compose restart"
echo "  3. View all logs: docker-compose logs"
echo "  4. Stop all: docker-compose down"
echo ""
echo "📱 The application runs in demo mode with mock data"
echo "🎯 No authentication required - ready to use!"