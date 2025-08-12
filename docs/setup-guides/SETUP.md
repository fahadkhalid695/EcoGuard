# EcoGuard Pro - Complete Setup Guide

## 🚀 Quick Start (Docker - Recommended)

### Prerequisites
- Docker and Docker Compose
- Git

### 1. Clone and Start
```bash
git clone <repository-url>
cd ecoguard-pro

# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

### 2. Access the Application
- **Frontend**: http://localhost
- **Backend API**: http://localhost:3001
- **API Docs**: http://localhost:3001/health
- **MQTT Broker**: localhost:1883

### 3. Demo Login
- **Email**: demo@ecoguard.com
- **Password**: password123

---

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- MQTT Broker (optional)

### 1. Install Dependencies
```bash
# Install all dependencies
npm run setup

# Or manually:
npm install
cd backend && npm install
```

### 2. Database Setup
```bash
# Create database
createdb ecoguard_pro

# Run migrations
cd backend
npm run migrate

# Seed demo data
npm run seed
```

### 3. Environment Configuration

**Frontend (.env)**:
```env
VITE_API_URL=http://localhost:3001/api/v1
VITE_WEBSOCKET_URL=ws://localhost:8080
VITE_ENABLE_WEBSOCKETS=true
```

**Backend (backend/.env)**:
```env
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_NAME=ecoguard_pro
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key
WEBSOCKET_PORT=8080
```

### 4. Start Development Servers
```bash
# Start both frontend and backend
npm run dev:full

# Or separately:
npm run dev                    # Frontend (port 5173)
cd backend && npm run dev      # Backend (port 3001)
```

---

## 📡 IoT Sensor Integration

### WiFi Sensors (ESP32/ESP8266)
```cpp
// Example Arduino code
#include <WiFi.h>
#include <HTTPClient.h>

const char* apiUrl = "http://your-server.com/api/v1";
const char* apiKey = "your-api-key";

void sendReading(float value, String unit) {
  HTTPClient http;
  http.begin(apiUrl + "/readings/sensor/SENSOR_ID");
  http.addHeader("Authorization", "Bearer " + String(apiKey));
  http.addHeader("Content-Type", "application/json");
  
  String payload = "{\"value\":" + String(value) + ",\"unit\":\"" + unit + "\"}";
  int httpCode = http.POST(payload);
  
  if (httpCode == 201) {
    Serial.println("Reading sent successfully");
  }
  http.end();
}
```

### LoRaWAN Integration
1. Configure TTN application
2. Set up MQTT bridge
3. Update backend MQTT settings
4. Deploy sensors with TTN credentials

### WebSocket Real-time
```javascript
import { websocketService } from './services/websocketService';

// Listen for real-time data
websocketService.on('sensor_reading', (data) => {
  console.log('New reading:', data);
});

// Send sensor data
websocketService.sendReading('sensor-id', {
  value: 23.5,
  unit: '°C',
  timestamp: new Date().toISOString()
});
```

---

## 🔧 Configuration

### Database Configuration
- **Development**: PostgreSQL on localhost:5432
- **Production**: Configure connection string in environment
- **Migrations**: Automatic on startup or manual via `npm run migrate`

### Security Configuration
- **JWT Secret**: Generate strong secret for production
- **Rate Limiting**: Configured in backend/server.js
- **CORS**: Configure allowed origins
- **HTTPS**: Enable SSL certificates in nginx config

### MQTT Configuration
- **Broker**: Eclipse Mosquitto
- **Authentication**: Username/password required
- **Topics**: 
  - `sensors/+/data` - Sensor readings
  - `alerts/+` - Alert notifications
  - `commands/+` - Sensor commands

---

## 🚀 Deployment

### Production Docker Deployment
```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose up -d --scale backend=3

# Update services
docker-compose pull
docker-compose up -d
```

### Cloud Deployment (AWS/Azure/GCP)
1. **Database**: Use managed PostgreSQL service
2. **Container Registry**: Push images to ECR/ACR/GCR
3. **Load Balancer**: Configure SSL termination
4. **Monitoring**: Set up CloudWatch/Application Insights
5. **Backup**: Configure automated database backups

### Environment Variables for Production
```env
NODE_ENV=production
DB_HOST=your-production-db-host
JWT_SECRET=your-production-secret
CORS_ORIGIN=https://your-domain.com
SSL_CERT_PATH=/path/to/cert.pem
SSL_KEY_PATH=/path/to/key.pem
```

---

## 🧪 Testing

### Unit Tests
```bash
npm test                    # Frontend tests
cd backend && npm test      # Backend tests
```

### Integration Tests
```bash
npm run test:integration    # API integration tests
```

### E2E Tests
```bash
npm run test:e2e           # End-to-end tests
```

### Load Testing
```bash
# Install artillery
npm install -g artillery

# Run load tests
artillery run tests/load-test.yml
```

---

## 📊 Monitoring & Maintenance

### Health Checks
- **Frontend**: http://localhost/health
- **Backend**: http://localhost:3001/health
- **Database**: Connection status in backend logs
- **MQTT**: Broker status via mosquitto_sub

### Logging
- **Frontend**: Browser console and error tracking
- **Backend**: File logs in backend/logs/
- **Database**: PostgreSQL logs
- **Nginx**: Access and error logs

### Backup Strategy
```bash
# Database backup
pg_dump ecoguard_pro > backup_$(date +%Y%m%d).sql

# Restore database
psql ecoguard_pro < backup_20240115.sql

# Docker volume backup
docker run --rm -v ecoguard_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz /data
```

---

## 🔍 Troubleshooting

### Common Issues

#### Frontend not connecting to backend
```bash
# Check backend is running
curl http://localhost:3001/health

# Check environment variables
echo $VITE_API_URL

# Check browser network tab for CORS errors
```

#### Database connection issues
```bash
# Test database connection
psql -h localhost -U ecoguard -d ecoguard_pro

# Check backend logs
docker-compose logs backend

# Reset database
npm run migrate:rollback
npm run migrate
npm run seed
```

#### WebSocket connection issues
```bash
# Check WebSocket server
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" http://localhost:8080

# Check authentication token
localStorage.getItem('ecoguard_token')

# Check firewall/proxy settings
```

#### MQTT broker issues
```bash
# Test MQTT connection
mosquitto_pub -h localhost -t test -m "hello"
mosquitto_sub -h localhost -t test

# Check broker logs
docker-compose logs mqtt

# Verify authentication
mosquitto_passwd -c mqtt/config/passwd username
```

### Performance Optimization
- **Database**: Add indexes for frequently queried columns
- **Frontend**: Enable gzip compression, optimize bundle size
- **Backend**: Implement caching with Redis
- **MQTT**: Optimize message frequency and payload size

### Security Checklist
- [ ] Change default passwords
- [ ] Enable HTTPS with valid certificates
- [ ] Configure firewall rules
- [ ] Set up rate limiting
- [ ] Enable audit logging
- [ ] Regular security updates
- [ ] Backup encryption

---

## 📞 Support

- **Documentation**: Check docs/ folder for detailed guides
- **Issues**: Report bugs via GitHub issues
- **Community**: Join our Discord/Slack for help
- **Professional Support**: Contact support@ecoguard.com

---

## 🔄 Updates

### Updating the System
```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm install
cd backend && npm install

# Run migrations
cd backend && npm run migrate

# Rebuild containers
docker-compose build
docker-compose up -d
```

### Version Management
- **Frontend**: Version in package.json
- **Backend**: Version in package.json
- **Database**: Migration version tracking
- **Docker**: Tag images with version numbers

---

**EcoGuard Pro** - Complete Environmental Monitoring Solution