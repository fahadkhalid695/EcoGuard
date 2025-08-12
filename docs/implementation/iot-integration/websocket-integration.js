/*
 * EcoGuard Pro - WebSocket Integration Example
 * Real-time sensor data streaming
 */

const WebSocket = require('ws');

class EcoGuardWebSocketClient {
  constructor(serverUrl, apiKey) {
    this.serverUrl = serverUrl;
    this.apiKey = apiKey;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    try {
      this.ws = new WebSocket(`${this.serverUrl}?auth=${this.apiKey}`);
      
      this.ws.on('open', () => {
        console.log('Connected to EcoGuard Pro WebSocket');
        this.reconnectAttempts = 0;
        
        // Send initial sensor registration
        this.registerSensor({
          id: 'sensor-001',
          name: 'Multi-sensor Node',
          type: 'temperature',
          connectivity: 'wifi',
          location: {
            lat: 40.7128,
            lng: -74.0060,
            name: 'Building A'
          }
        });
      });

      this.ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        this.handleServerMessage(message);
      });

      this.ws.on('close', () => {
        console.log('WebSocket connection closed');
        this.attemptReconnect();
      });

      this.ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.attemptReconnect();
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, 5000 * this.reconnectAttempts); // Exponential backoff
    } else {
      console.log('Max reconnection attempts reached');
    }
  }

  registerSensor(sensorData) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        type: 'sensor_registration',
        data: sensorData
      };
      
      this.ws.send(JSON.stringify(message));
      console.log('Sensor registered:', sensorData.id);
    }
  }

  sendReading(sensorId, reading) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        type: 'sensor_reading',
        data: {
          sensorId,
          timestamp: new Date().toISOString(),
          ...reading
        }
      };
      
      this.ws.send(JSON.stringify(message));
      console.log(`Reading sent for ${sensorId}:`, reading);
    } else {
      console.log('WebSocket not connected, queuing reading...');
      // In production, implement a queue system
    }
  }

  sendAlert(sensorId, alert) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        type: 'sensor_alert',
        data: {
          sensorId,
          timestamp: new Date().toISOString(),
          ...alert
        }
      };
      
      this.ws.send(JSON.stringify(message));
      console.log(`Alert sent for ${sensorId}:`, alert);
    }
  }

  updateSensorStatus(sensorId, status) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        type: 'sensor_status',
        data: {
          sensorId,
          status,
          timestamp: new Date().toISOString()
        }
      };
      
      this.ws.send(JSON.stringify(message));
      console.log(`Status updated for ${sensorId}:`, status);
    }
  }

  handleServerMessage(message) {
    switch (message.type) {
      case 'command':
        this.handleCommand(message.data);
        break;
      case 'config_update':
        this.handleConfigUpdate(message.data);
        break;
      case 'calibration_request':
        this.handleCalibrationRequest(message.data);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  handleCommand(command) {
    console.log('Received command:', command);
    // Implement command handling (e.g., sensor calibration, restart, etc.)
  }

  handleConfigUpdate(config) {
    console.log('Received config update:', config);
    // Implement configuration updates
  }

  handleCalibrationRequest(request) {
    console.log('Calibration requested for sensor:', request.sensorId);
    // Implement calibration logic
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Usage Example
const client = new EcoGuardWebSocketClient('ws://localhost:8080/sensors', 'your-api-key');
client.connect();

// Simulate sensor readings
setInterval(() => {
  // Temperature reading
  client.sendReading('sensor-001', {
    value: 20 + Math.random() * 10,
    unit: '°C',
    quality: 'good',
    location: {
      lat: 40.7128,
      lng: -74.0060,
      name: 'Building A'
    }
  });

  // Humidity reading
  client.sendReading('sensor-001', {
    value: 40 + Math.random() * 40,
    unit: '%',
    quality: 'good',
    location: {
      lat: 40.7128,
      lng: -74.0060,
      name: 'Building A'
    }
  });
}, 30000); // Every 30 seconds

module.exports = EcoGuardWebSocketClient;