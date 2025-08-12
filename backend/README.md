# EcoGuard Pro Backend API

A comprehensive Node.js/Express API for the EcoGuard Pro environmental monitoring system.

## 🚀 Features

- **RESTful API** - Complete CRUD operations for sensors, readings, alerts
- **Real-time WebSocket** - Live sensor data streaming
- **MQTT Integration** - LoRaWAN sensor support via MQTT
- **JWT Authentication** - Secure user authentication and authorization
- **Role-based Access Control** - User, admin, and super admin roles
- **PostgreSQL Database** - Robust data storage with Knex.js ORM
- **Input Validation** - Comprehensive request validation
- **Error Handling** - Centralized error handling and logging
- **Rate Limiting** - API abuse protection
- **Security** - Helmet, CORS, and other security middleware

## 📋 Prerequisites

- Node.js 18.0 or higher
- PostgreSQL 12 or higher
- npm or yarn package manager

## 🛠️ Installation

### 1. Clone and Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=3001

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecoguard_pro
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12
API_RATE_LIMIT=100

# WebSocket Configuration
WEBSOCKET_PORT=8080
WEBSOCKET_CORS_ORIGIN=http://localhost:5173

# MQTT Configuration (optional)
MQTT_BROKER_HOST=localhost
MQTT_BROKER_PORT=1883
MQTT_USERNAME=ecoguard
MQTT_PASSWORD=your_mqtt_password
```

### 3. Database Setup

Create PostgreSQL database:

```sql
CREATE DATABASE ecoguard_pro;
CREATE USER ecoguard WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ecoguard_pro TO ecoguard;
```

Run migrations:

```bash
npm run migrate
```

Seed demo data (optional):

```bash
npm run seed
```

### 4. Start the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api/v1
```

### Authentication

All protected endpoints require a Bearer token:
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Endpoints Overview

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile
- `PUT /auth/password` - Change password
- `POST /auth/logout` - Logout user

#### Sensors
- `GET /sensors` - List user's sensors
- `GET /sensors/:id` - Get sensor details
- `POST /sensors` - Create new sensor
- `PUT /sensors/:id` - Update sensor
- `DELETE /sensors/:id` - Delete sensor
- `GET /sensors/stats/overview` - Get sensor statistics

#### Sensor Readings
- `GET /readings/sensor/:sensorId` - Get sensor readings
- `POST /readings/sensor/:sensorId` - Add single reading
- `POST /readings/batch` - Add batch readings
- `GET /readings/sensor/:sensorId/aggregate` - Get aggregated data

#### Alerts
- `GET /alerts` - List alerts
- `GET /alerts/:id` - Get alert details
- `POST /alerts` - Create alert
- `PUT /alerts/:id/acknowledge` - Acknowledge alert
- `PUT /alerts/:id/resolve` - Resolve alert
- `DELETE /alerts/:id` - Delete alert
- `GET /alerts/stats/overview` - Get alert statistics

#### Analytics
- `GET /analytics/overview` - Dashboard overview
- `GET /analytics/sensors/performance` - Sensor performance
- `GET /analytics/trends` - Environmental trends
- `GET /analytics/alerts` - Alert analytics
- `GET /analytics/predictions` - AI predictions

#### Users
- `GET /users/profile` - Get user profile
- `PUT /users/preferences` - Update preferences
- `GET /users/activity` - Get activity log
- `GET /users/stats` - Get user statistics

#### Admin Routes (require admin role)
- `GET /users` - List all users
- `PUT /users/:id/role` - Update user role
- `PUT /users/:id/deactivate` - Deactivate user
- `PUT /users/:id/activate` - Activate user

### Example Requests

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "organization": "My Company"
}
```

#### Create Sensor
```http
POST /api/v1/sensors
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "deviceId": "TEMP-001",
  "name": "Office Temperature Sensor",
  "type": "temperature",
  "connectivity": "wifi",
  "location": {
    "lat": 40.7128,
    "lng": -74.0060,
    "name": "Office Building A"
  },
  "batteryLevel": 85
}
```

#### Add Sensor Reading
```http
POST /api/v1/readings/sensor/SENSOR_ID
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "timestamp": "2024-01-15T10:30:00Z",
  "value": 23.5,
  "unit": "°C",
  "quality": "good",
  "location": {
    "lat": 40.7128,
    "lng": -74.0060,
    "name": "Office Building A"
  }
}
```

#### Batch Readings
```http
POST /api/v1/readings/batch
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "readings": [
    {
      "sensorId": "SENSOR_ID_1",
      "timestamp": "2024-01-15T10:30:00Z",
      "value": 23.5,
      "unit": "°C",
      "quality": "good"
    },
    {
      "sensorId": "SENSOR_ID_2",
      "timestamp": "2024-01-15T10:30:00Z",
      "value": 65.2,
      "unit": "%",
      "quality": "good"
    }
  ]
}
```

## 🔌 WebSocket Integration

Connect to WebSocket server:
```javascript
const socket = io('ws://localhost:8080', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});

// Listen for sensor readings
socket.on('sensor_reading', (data) => {
  console.log('New reading:', data);
});

// Listen for alerts
socket.on('alert', (data) => {
  console.log('New alert:', data);
});

// Register sensor
socket.emit('sensor_registration', {
  sensorData: {
    deviceId: 'TEMP-001',
    name: 'Temperature Sensor',
    type: 'temperature',
    connectivity: 'wifi',
    location: { lat: 40.7128, lng: -74.0060, name: 'Office' }
  }
});

// Send reading
socket.emit('sensor_reading', {
  sensorId: 'SENSOR_ID',
  reading: {
    timestamp: new Date().toISOString(),
    value: 23.5,
    unit: '°C',
    quality: 'good'
  }
});
```

## 📡 MQTT Integration

The API automatically connects to MQTT broker for LoRaWAN integration:

### Supported Topics
- `v3/+/devices/+/up` - The Things Network v3
- `application/+/device/+/rx` - ChirpStack
- `ecoguard/+/+/data` - Custom EcoGuard format

### Message Format (TTN v3)
```json
{
  "end_device_ids": {
    "device_id": "ecoguard-temp-001"
  },
  "uplink_message": {
    "decoded_payload": {
      "temperature": 23.5,
      "humidity": 65.2,
      "battery": 85
    }
  },
  "received_at": "2024-01-15T10:30:00Z"
}
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  organization VARCHAR,
  role VARCHAR DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  preferences JSON DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Sensors Table
```sql
CREATE TABLE sensors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  sensor_type VARCHAR NOT NULL,
  connection_type VARCHAR NOT NULL,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  location_name VARCHAR,
  status VARCHAR DEFAULT 'offline',
  battery_level INTEGER,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Sensor Readings Table
```sql
CREATE TABLE sensor_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id UUID REFERENCES sensors(id),
  timestamp TIMESTAMP NOT NULL,
  value DECIMAL(10, 4) NOT NULL,
  unit VARCHAR NOT NULL,
  quality VARCHAR DEFAULT 'good',
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  location_name VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with configurable rounds
- **Rate Limiting** - Configurable request limits per IP
- **Input Validation** - express-validator for all inputs
- **CORS Protection** - Configurable CORS policies
- **Helmet Security** - Security headers and protections
- **SQL Injection Protection** - Parameterized queries via Knex.js

## 📊 Monitoring & Logging

- **Health Check** - `GET /health` endpoint
- **Request Logging** - Morgan HTTP request logger
- **Error Handling** - Centralized error handling middleware
- **Database Connection** - Automatic connection health checks

## 🚀 Deployment

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3001
DB_HOST=your-db-host
DB_NAME=ecoguard_pro
JWT_SECRET=your-production-secret
API_RATE_LIMIT=1000
```

## 🧪 Testing

Run tests:
```bash
npm test
```

Test with demo data:
```bash
# Login with demo credentials
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@ecoguard.com","password":"password123"}'

# Use returned token for authenticated requests
curl -X GET http://localhost:3001/api/v1/sensors \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📞 Support

- **Documentation**: Full API documentation available
- **Demo Data**: Use seeded demo data for testing
- **Health Check**: Monitor API status at `/health`
- **Logs**: Check application logs for debugging

## 🔧 Development

### Adding New Endpoints
1. Create route file in `/routes`
2. Add validation middleware
3. Implement business logic
4. Add to main server.js
5. Update documentation

### Database Migrations
```bash
# Create new migration
npx knex migrate:make migration_name

# Run migrations
npm run migrate

# Rollback migration
npx knex migrate:rollback
```

### Adding New Sensor Types
1. Update sensor types in `/types/sensor.ts`
2. Add validation rules in routes
3. Update threshold logic in readings
4. Add unit mappings in services

---

**EcoGuard Pro Backend API** - Built with Node.js, Express, and PostgreSQL