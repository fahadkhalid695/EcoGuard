#!/bin/bash

echo "🔧 Creating missing files and directories for Docker deployment..."

# Create missing MQTT directories
echo "📁 Creating MQTT directories..."
mkdir -p mqtt/data
mkdir -p mqtt/log
mkdir -p logs/nginx

# Create missing backend directories
echo "📁 Creating backend directories..."
mkdir -p backend/logs

# Create basic MQTT config if missing
if [ ! -f mqtt/config/mosquitto.conf ]; then
    echo "📝 Creating MQTT configuration..."
    cat > mqtt/config/mosquitto.conf << 'EOF'
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

# Create missing backend route files
echo "📝 Creating missing backend files..."

# Auth routes
if [ ! -f backend/routes/auth.js ]; then
    cat > backend/routes/auth.js << 'EOF'
const express = require('express');
const router = express.Router();

// Demo auth endpoints
router.post('/login', (req, res) => {
  res.json({
    success: true,
    token: 'demo-token-123',
    user: { id: 1, email: 'demo@ecoguard.com', name: 'Demo User' }
  });
});

router.post('/logout', (req, res) => {
  res.json({ success: true });
});

router.get('/me', (req, res) => {
  res.json({
    success: true,
    user: { id: 1, email: 'demo@ecoguard.com', name: 'Demo User' }
  });
});

module.exports = router;
EOF
fi

# Sensor routes
if [ ! -f backend/routes/sensors.js ]; then
    cat > backend/routes/sensors.js << 'EOF'
const express = require('express');
const router = express.Router();

// Mock sensor data
const mockSensors = [
  { id: 'temp-001', name: 'Temperature Sensor', type: 'temperature', status: 'online' },
  { id: 'hum-001', name: 'Humidity Sensor', type: 'humidity', status: 'online' }
];

router.get('/', (req, res) => {
  res.json({ success: true, data: mockSensors });
});

router.get('/:id', (req, res) => {
  const sensor = mockSensors.find(s => s.id === req.params.id);
  res.json({ success: true, data: sensor });
});

module.exports = router;
EOF
fi

# Create other missing route files
for route in readings alerts analytics users; do
    if [ ! -f backend/routes/${route}.js ]; then
        cat > backend/routes/${route}.js << EOF
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ success: true, data: [] });
});

module.exports = router;
EOF
    fi
done

# Create missing middleware files
if [ ! -f backend/middleware/errorHandler.js ]; then
    cat > backend/middleware/errorHandler.js << 'EOF'
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: { message: 'Internal server error' }
  });
};

module.exports = { errorHandler };
EOF
fi

if [ ! -f backend/middleware/auth.js ]; then
    cat > backend/middleware/auth.js << 'EOF'
const authenticateToken = (req, res, next) => {
  // Demo mode - skip authentication
  req.user = { id: 1, email: 'demo@ecoguard.com' };
  next();
};

module.exports = { authenticateToken };
EOF
fi

# Create missing service files
if [ ! -f backend/services/websocketService.js ]; then
    cat > backend/services/websocketService.js << 'EOF'
class WebSocketService {
  constructor(io) {
    this.io = io;
  }

  initialize() {
    console.log('WebSocket service initialized');
  }
}

module.exports = WebSocketService;
EOF
fi

if [ ! -f backend/services/mqttService.js ]; then
    cat > backend/services/mqttService.js << 'EOF'
class MQTTService {
  initialize() {
    console.log('MQTT service initialized');
  }
}

module.exports = MQTTService;
EOF
fi

echo "✅ Missing files and directories created!"