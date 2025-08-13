#!/bin/bash

echo "🔧 Fixing Docker Permission Issues..."

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running or not accessible"
    echo "Please ensure Docker is installed and running"
    exit 1
fi

# Add user to docker group (requires logout/login to take effect)
echo "👤 Adding user to docker group..."
sudo usermod -aG docker $USER

echo "🔄 Applying group changes..."
# Apply group changes without logout
newgrp docker << EOF
echo "✅ Docker group applied"
docker info >/dev/null 2>&1 && echo "✅ Docker access confirmed" || echo "❌ Docker access still denied"
EOF

echo ""
echo "📋 Next steps:"
echo "1. If you still get permission errors, logout and login again"
echo "2. Or restart your terminal/session"
echo "3. Then run: docker-compose ps"
echo ""
echo "Alternative: Run Docker commands with sudo:"
echo "  sudo docker-compose down"
echo "  sudo docker-compose up --build -d"