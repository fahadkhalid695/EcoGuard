#!/bin/bash

echo "🔧 Fixing EcoGuard Pro with Sudo (for permission issues)..."

echo "🛑 Stopping existing containers..."
sudo docker-compose down 2>/dev/null || true

echo "🧹 Cleaning up Docker..."
sudo docker system prune -f

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

echo "🏗️ Building containers with sudo..."
sudo docker-compose build --no-cache

echo "🚀 Starting containers with sudo..."
sudo docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 30

echo "🧪 Testing services..."
curl -s -f http://localhost/ >/dev/null && echo "✅ Frontend running" || echo "❌ Frontend not responding"
curl -s -f http://localhost:3001/health >/dev/null && echo "✅ Backend running" || echo "❌ Backend not responding"

echo ""
echo "📊 Container status:"
sudo docker-compose ps

echo ""
echo "✅ Setup complete!"
echo "🌐 Frontend: http://localhost"
echo "🔧 Backend: http://localhost:3001"