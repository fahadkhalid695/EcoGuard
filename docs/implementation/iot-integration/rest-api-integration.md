# REST API Integration Guide

## Overview
The EcoGuard Pro REST API provides simple HTTP endpoints for sensor integration. This method is ideal for:
- Sensors with internet connectivity
- Custom sensor applications
- Third-party system integration
- Batch data uploads

## Base URL
```
https://your-ecoguard-server.com/api
```

## Authentication
All API requests require authentication using Bearer tokens:
```http
Authorization: Bearer YOUR_API_KEY
```

## API Endpoints

### 1. Sensor Management

#### Register a New Sensor
```http
POST /api/sensors
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "id": "temp-001",
  "name": "Temperature Sensor - Building A",
  "type": "temperature",
  "connectivity": "wifi",
  "location": {
    "lat": 40.7128,
    "lng": -74.0060,
    "name": "Building A - Floor 1"
  },
  "batteryLevel": 85,
  "calibrationDate": "2024-01-01T00:00:00Z",
  "nextMaintenanceDate": "2024-06-01T00:00:00Z"
}
```

#### Get Sensor Information
```http
GET /api/sensors/{sensorId}
Authorization: Bearer YOUR_API_KEY
```

#### Update Sensor
```http
PUT /api/sensors/{sensorId}
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "name": "Updated Sensor Name",
  "batteryLevel": 75,
  "status": "online"
}
```

### 2. Sensor Readings

#### Send Single Reading
```http
POST /api/sensors/{sensorId}/readings
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "timestamp": "2024-01-15T10:30:00Z",
  "value": 23.5,
  "unit": "°C",
  "quality": "good",
  "location": {
    "lat": 40.7128,
    "lng": -74.0060,
    "name": "Building A - Floor 1"
  }
}
```

#### Send Batch Readings
```http
POST /api/readings/batch
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "readings": [
    {
      "sensorId": "temp-001",
      "timestamp": "2024-01-15T10:30:00Z",
      "value": 23.5,
      "unit": "°C",
      "quality": "good",
      "location": {
        "lat": 40.7128,
        "lng": -74.0060,
        "name": "Building A"
      }
    },
    {
      "sensorId": "hum-001",
      "timestamp": "2024-01-15T10:30:00Z",
      "value": 65.2,
      "unit": "%",
      "quality": "good",
      "location": {
        "lat": 40.7128,
        "lng": -74.0060,
        "name": "Building A"
      }
    }
  ]
}
```

#### Get Recent Readings
```http
GET /api/sensors/{sensorId}/readings?limit=50&from=2024-01-15T00:00:00Z
Authorization: Bearer YOUR_API_KEY
```

### 3. Alerts

#### Create Alert
```http
POST /api/alerts
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "sensorId": "temp-001",
  "type": "threshold",
  "severity": "high",
  "message": "Temperature threshold exceeded: 35°C",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Python Integration Example

```python
import requests
import json
import time
from datetime import datetime

class EcoGuardAPI:
    def __init__(self, base_url, api_key):
        self.base_url = base_url
        self.api_key = api_key
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
    
    def register_sensor(self, sensor_data):
        """Register a new sensor"""
        url = f"{self.base_url}/api/sensors"
        response = requests.post(url, json=sensor_data, headers=self.headers)
        
        if response.status_code == 201:
            print(f"Sensor registered: {sensor_data['id']}")
            return response.json()
        else:
            print(f"Error registering sensor: {response.status_code}")
            return None
    
    def send_reading(self, sensor_id, reading_data):
        """Send a single sensor reading"""
        url = f"{self.base_url}/api/sensors/{sensor_id}/readings"
        response = requests.post(url, json=reading_data, headers=self.headers)
        
        if response.status_code == 201:
            print(f"Reading sent for {sensor_id}: {reading_data['value']} {reading_data['unit']}")
            return True
        else:
            print(f"Error sending reading: {response.status_code}")
            return False
    
    def send_batch_readings(self, readings):
        """Send multiple readings at once"""
        url = f"{self.base_url}/api/readings/batch"
        response = requests.post(url, json={'readings': readings}, headers=self.headers)
        
        if response.status_code == 201:
            print(f"Batch of {len(readings)} readings sent successfully")
            return True
        else:
            print(f"Error sending batch readings: {response.status_code}")
            return False
    
    def update_sensor_status(self, sensor_id, status, battery_level=None):
        """Update sensor status and battery level"""
        url = f"{self.base_url}/api/sensors/{sensor_id}"
        data = {'status': status}
        
        if battery_level is not None:
            data['batteryLevel'] = battery_level
        
        response = requests.put(url, json=data, headers=self.headers)
        
        if response.status_code == 200:
            print(f"Sensor {sensor_id} status updated: {status}")
            return True
        else:
            print(f"Error updating sensor status: {response.status_code}")
            return False
    
    def create_alert(self, sensor_id, alert_type, severity, message):
        """Create an alert"""
        url = f"{self.base_url}/api/alerts"
        alert_data = {
            'sensorId': sensor_id,
            'type': alert_type,
            'severity': severity,
            'message': message,
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }
        
        response = requests.post(url, json=alert_data, headers=self.headers)
        
        if response.status_code == 201:
            print(f"Alert created for {sensor_id}: {message}")
            return True
        else:
            print(f"Error creating alert: {response.status_code}")
            return False

# Usage Example
def main():
    # Initialize API client
    api = EcoGuardAPI('https://your-ecoguard-server.com', 'your-api-key')
    
    # Register sensors
    sensors = [
        {
            'id': 'python-temp-001',
            'name': 'Python Temperature Sensor',
            'type': 'temperature',
            'connectivity': 'wifi',
            'location': {
                'lat': 40.7128,
                'lng': -74.0060,
                'name': 'Python Lab'
            },
            'batteryLevel': 100
        },
        {
            'id': 'python-hum-001',
            'name': 'Python Humidity Sensor',
            'type': 'humidity',
            'connectivity': 'wifi',
            'location': {
                'lat': 40.7128,
                'lng': -74.0060,
                'name': 'Python Lab'
            },
            'batteryLevel': 95
        }
    ]
    
    for sensor in sensors:
        api.register_sensor(sensor)
    
    # Simulate sensor readings
    while True:
        try:
            # Generate mock readings
            readings = []
            
            # Temperature reading
            temp_reading = {
                'sensorId': 'python-temp-001',
                'timestamp': datetime.utcnow().isoformat() + 'Z',
                'value': round(20 + (time.time() % 10), 2),
                'unit': '°C',
                'quality': 'good',
                'location': {
                    'lat': 40.7128,
                    'lng': -74.0060,
                    'name': 'Python Lab'
                }
            }
            readings.append(temp_reading)
            
            # Humidity reading
            hum_reading = {
                'sensorId': 'python-hum-001',
                'timestamp': datetime.utcnow().isoformat() + 'Z',
                'value': round(50 + (time.time() % 20), 2),
                'unit': '%',
                'quality': 'good',
                'location': {
                    'lat': 40.7128,
                    'lng': -74.0060,
                    'name': 'Python Lab'
                }
            }
            readings.append(hum_reading)
            
            # Send batch readings
            api.send_batch_readings(readings)
            
            # Check for alerts
            if temp_reading['value'] > 28:
                api.create_alert(
                    'python-temp-001',
                    'threshold',
                    'high',
                    f"High temperature detected: {temp_reading['value']}°C"
                )
            
            # Wait 30 seconds before next reading
            time.sleep(30)
            
        except KeyboardInterrupt:
            print("Stopping sensor simulation...")
            break
        except Exception as e:
            print(f"Error: {e}")
            time.sleep(5)

if __name__ == "__main__":
    main()
```

## Node.js Integration Example

```javascript
const axios = require('axios');

class EcoGuardAPI {
  constructor(baseUrl, apiKey) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  async registerSensor(sensorData) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/sensors`,
        sensorData,
        { headers: this.headers }
      );
      
      console.log(`Sensor registered: ${sensorData.id}`);
      return response.data;
    } catch (error) {
      console.error('Error registering sensor:', error.response?.data || error.message);
      return null;
    }
  }

  async sendReading(sensorId, readingData) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/sensors/${sensorId}/readings`,
        readingData,
        { headers: this.headers }
      );
      
      console.log(`Reading sent for ${sensorId}: ${readingData.value} ${readingData.unit}`);
      return true;
    } catch (error) {
      console.error('Error sending reading:', error.response?.data || error.message);
      return false;
    }
  }

  async sendBatchReadings(readings) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/readings/batch`,
        { readings },
        { headers: this.headers }
      );
      
      console.log(`Batch of ${readings.length} readings sent successfully`);
      return true;
    } catch (error) {
      console.error('Error sending batch readings:', error.response?.data || error.message);
      return false;
    }
  }
}

// Usage
const api = new EcoGuardAPI('https://your-ecoguard-server.com', 'your-api-key');

// Register and start sending data
async function startSensorSimulation() {
  // Register sensor
  await api.registerSensor({
    id: 'nodejs-sensor-001',
    name: 'Node.js Multi Sensor',
    type: 'temperature',
    connectivity: 'wifi',
    location: {
      lat: 40.7128,
      lng: -74.0060,
      name: 'Node.js Lab'
    }
  });

  // Send readings every 30 seconds
  setInterval(async () => {
    const readings = [
      {
        sensorId: 'nodejs-sensor-001',
        timestamp: new Date().toISOString(),
        value: 20 + Math.random() * 10,
        unit: '°C',
        quality: 'good',
        location: {
          lat: 40.7128,
          lng: -74.0060,
          name: 'Node.js Lab'
        }
      }
    ];

    await api.sendBatchReadings(readings);
  }, 30000);
}

startSensorSimulation();
```

## Response Formats

### Success Response
```json
{
  "success": true,
  "data": {
    "id": "reading-12345",
    "message": "Reading processed successfully"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "INVALID_SENSOR",
    "message": "Sensor not found",
    "details": "Sensor with ID 'temp-001' does not exist"
  }
}
```

## Rate Limits
- **Sensor Registration**: 10 requests per minute
- **Single Readings**: 100 requests per minute per sensor
- **Batch Readings**: 20 requests per minute (max 100 readings per batch)
- **Alerts**: 50 requests per minute

## Best Practices

1. **Batch Readings**: Use batch endpoints for multiple readings
2. **Error Handling**: Implement retry logic with exponential backoff
3. **Rate Limiting**: Respect API rate limits
4. **Data Validation**: Validate sensor data before sending
5. **Security**: Keep API keys secure and rotate regularly
6. **Monitoring**: Monitor API response times and error rates