const jwt = require('jsonwebtoken');
const db = require('../config/database');

class WebSocketService {
  constructor(io) {
    this.io = io;
    this.connectedClients = new Map();
  }

  initialize() {
    this.io.use(this.authenticateSocket.bind(this));
    this.io.on('connection', this.handleConnection.bind(this));
    
    console.log('🔌 WebSocket service initialized');
  }

  async authenticateSocket(socket, next) {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await db('users')
        .where({ id: decoded.userId, is_active: true })
        .first();

      if (!user) {
        return next(new Error('Invalid token'));
      }

      socket.userId = user.id;
      socket.userRole = user.role;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  }

  handleConnection(socket) {
    console.log(`🔗 User ${socket.userId} connected via WebSocket`);
    
    // Store client connection
    this.connectedClients.set(socket.userId, socket);

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Handle sensor registration
    socket.on('sensor_registration', this.handleSensorRegistration.bind(this, socket));
    
    // Handle sensor readings
    socket.on('sensor_reading', this.handleSensorReading.bind(this, socket));
    
    // Handle sensor status updates
    socket.on('sensor_status', this.handleSensorStatus.bind(this, socket));
    
    // Handle alerts
    socket.on('sensor_alert', this.handleSensorAlert.bind(this, socket));
    
    // Handle commands to sensors
    socket.on('sensor_command', this.handleSensorCommand.bind(this, socket));

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 User ${socket.userId} disconnected`);
      this.connectedClients.delete(socket.userId);
    });

    // Send welcome message
    socket.emit('connected', {
      message: 'Connected to EcoGuard Pro WebSocket',
      timestamp: new Date().toISOString()
    });
  }

  async handleSensorRegistration(socket, data) {
    try {
      const { sensorData } = data;
      
      // Verify sensor belongs to user or create new one
      let sensor = await db('sensors')
        .where({ device_id: sensorData.deviceId, user_id: socket.userId })
        .first();

      if (!sensor) {
        // Create new sensor
        const [newSensor] = await db('sensors').insert({
          device_id: sensorData.deviceId,
          name: sensorData.name,
          sensor_type: sensorData.type,
          connection_type: sensorData.connectivity,
          location_lat: sensorData.location.lat,
          location_lng: sensorData.location.lng,
          location_name: sensorData.location.name,
          status: 'online',
          battery_level: sensorData.batteryLevel,
          user_id: socket.userId
        }).returning('*');
        
        sensor = newSensor;
        console.log(`📡 New sensor registered: ${sensor.device_id}`);
      } else {
        // Update existing sensor status
        await db('sensors')
          .where({ id: sensor.id })
          .update({ 
            status: 'online',
            updated_at: new Date()
          });
        console.log(`📡 Sensor reconnected: ${sensor.device_id}`);
      }

      // Join sensor to its room
      socket.join(`sensor:${sensor.id}`);

      // Confirm registration
      socket.emit('sensor_registered', {
        sensorId: sensor.id,
        deviceId: sensor.device_id,
        status: 'registered',
        timestamp: new Date().toISOString()
      });

      // Broadcast to user's other connections
      socket.to(`user:${socket.userId}`).emit('sensor_update', {
        type: 'registration',
        sensor: this.formatSensorData(sensor)
      });

    } catch (error) {
      console.error('Error handling sensor registration:', error);
      socket.emit('error', {
        type: 'registration_error',
        message: 'Failed to register sensor'
      });
    }
  }

  async handleSensorReading(socket, data) {
    try {
      const { sensorId, reading } = data;

      // Verify sensor belongs to user
      const sensor = await db('sensors')
        .where({ id: sensorId, user_id: socket.userId })
        .first();

      if (!sensor) {
        socket.emit('error', {
          type: 'sensor_not_found',
          message: 'Sensor not found'
        });
        return;
      }

      // Insert reading
      const [insertedReading] = await db('sensor_readings').insert({
        sensor_id: sensorId,
        timestamp: new Date(reading.timestamp),
        value: parseFloat(reading.value),
        unit: reading.unit,
        quality: reading.quality || 'good',
        location_lat: reading.location?.lat || sensor.location_lat,
        location_lng: reading.location?.lng || sensor.location_lng,
        location_name: reading.location?.name || sensor.location_name,
        metadata: JSON.stringify(reading.metadata || {})
      }).returning('*');

      // Update sensor status
      if (sensor.status !== 'online') {
        await db('sensors')
          .where({ id: sensorId })
          .update({ status: 'online', updated_at: new Date() });
      }

      // Check for threshold alerts
      await this.checkThresholdAlerts(sensorId, insertedReading);

      // Broadcast reading to all user connections
      this.io.to(`user:${socket.userId}`).emit('sensor_reading', {
        sensorId,
        reading: {
          id: insertedReading.id,
          timestamp: insertedReading.timestamp,
          value: parseFloat(insertedReading.value),
          unit: insertedReading.unit,
          quality: insertedReading.quality
        }
      });

      console.log(`📊 Reading received from sensor ${sensor.device_id}: ${reading.value} ${reading.unit}`);

    } catch (error) {
      console.error('Error handling sensor reading:', error);
      socket.emit('error', {
        type: 'reading_error',
        message: 'Failed to process sensor reading'
      });
    }
  }

  async handleSensorStatus(socket, data) {
    try {
      const { sensorId, status } = data;

      // Verify sensor belongs to user
      const sensor = await db('sensors')
        .where({ id: sensorId, user_id: socket.userId })
        .first();

      if (!sensor) {
        socket.emit('error', {
          type: 'sensor_not_found',
          message: 'Sensor not found'
        });
        return;
      }

      // Update sensor status
      await db('sensors')
        .where({ id: sensorId })
        .update({ 
          status,
          updated_at: new Date()
        });

      // Broadcast status update
      this.io.to(`user:${socket.userId}`).emit('sensor_status', {
        sensorId,
        status,
        timestamp: new Date().toISOString()
      });

      console.log(`📡 Sensor ${sensor.device_id} status updated: ${status}`);

    } catch (error) {
      console.error('Error handling sensor status:', error);
      socket.emit('error', {
        type: 'status_error',
        message: 'Failed to update sensor status'
      });
    }
  }

  async handleSensorAlert(socket, data) {
    try {
      const { sensorId, alert } = data;

      // Verify sensor belongs to user
      const sensor = await db('sensors')
        .where({ id: sensorId, user_id: socket.userId })
        .first();

      if (!sensor) {
        socket.emit('error', {
          type: 'sensor_not_found',
          message: 'Sensor not found'
        });
        return;
      }

      // Insert alert
      const [insertedAlert] = await db('alerts').insert({
        sensor_id: sensorId,
        alert_type: alert.type,
        severity: alert.severity,
        message: alert.message,
        timestamp: new Date(alert.timestamp),
        acknowledged: false,
        metadata: JSON.stringify(alert.metadata || {})
      }).returning('*');

      // Broadcast alert to all user connections
      this.io.to(`user:${socket.userId}`).emit('alert', {
        id: insertedAlert.id,
        sensorId,
        sensorName: sensor.name,
        type: insertedAlert.alert_type,
        severity: insertedAlert.severity,
        message: insertedAlert.message,
        timestamp: insertedAlert.timestamp
      });

      console.log(`🚨 Alert from sensor ${sensor.device_id}: ${alert.message}`);

    } catch (error) {
      console.error('Error handling sensor alert:', error);
      socket.emit('error', {
        type: 'alert_error',
        message: 'Failed to process sensor alert'
      });
    }
  }

  async handleSensorCommand(socket, data) {
    try {
      const { sensorId, command } = data;

      // Verify sensor belongs to user
      const sensor = await db('sensors')
        .where({ id: sensorId, user_id: socket.userId })
        .first();

      if (!sensor) {
        socket.emit('error', {
          type: 'sensor_not_found',
          message: 'Sensor not found'
        });
        return;
      }

      // Send command to sensor (if sensor is connected via WebSocket)
      this.io.to(`sensor:${sensorId}`).emit('command', {
        type: command.type,
        data: command.data,
        timestamp: new Date().toISOString()
      });

      console.log(`📤 Command sent to sensor ${sensor.device_id}: ${command.type}`);

    } catch (error) {
      console.error('Error handling sensor command:', error);
      socket.emit('error', {
        type: 'command_error',
        message: 'Failed to send sensor command'
      });
    }
  }

  async checkThresholdAlerts(sensorId, reading) {
    const sensor = await db('sensors').where({ id: sensorId }).first();
    if (!sensor) return;

    let shouldAlert = false;
    let alertMessage = '';
    let severity = 'low';

    const value = parseFloat(reading.value);

    // Define thresholds based on sensor type
    switch (sensor.sensor_type) {
      case 'temperature':
        if (value > 30 || value < 10) {
          shouldAlert = true;
          alertMessage = value > 30 ? 
            `High temperature detected: ${value}°C` : 
            `Low temperature detected: ${value}°C`;
          severity = (value > 35 || value < 5) ? 'critical' : 'high';
        }
        break;

      case 'co2':
        if (value > 800) {
          shouldAlert = true;
          alertMessage = `High CO2 levels detected: ${value} ppm`;
          severity = value > 1000 ? 'critical' : 'high';
        }
        break;

      case 'sound':
        if (value > 70) {
          shouldAlert = true;
          alertMessage = `High noise levels detected: ${value} dB`;
          severity = value > 85 ? 'critical' : 'high';
        }
        break;
    }

    if (shouldAlert) {
      // Check if similar alert exists in last hour
      const recentAlert = await db('alerts')
        .where({
          sensor_id: sensorId,
          alert_type: 'threshold'
        })
        .where('timestamp', '>', new Date(Date.now() - 60 * 60 * 1000))
        .first();

      if (!recentAlert) {
        const [alert] = await db('alerts').insert({
          sensor_id: sensorId,
          alert_type: 'threshold',
          severity,
          message: alertMessage,
          timestamp: new Date(),
          acknowledged: false
        }).returning('*');

        // Broadcast alert
        this.io.to(`user:${sensor.user_id}`).emit('alert', {
          id: alert.id,
          sensorId,
          sensorName: sensor.name,
          type: alert.alert_type,
          severity: alert.severity,
          message: alert.message,
          timestamp: alert.timestamp
        });
      }
    }
  }

  formatSensorData(sensor) {
    return {
      id: sensor.id,
      deviceId: sensor.device_id,
      name: sensor.name,
      type: sensor.sensor_type,
      connectivity: sensor.connection_type,
      location: {
        lat: parseFloat(sensor.location_lat),
        lng: parseFloat(sensor.location_lng),
        name: sensor.location_name
      },
      status: sensor.status,
      batteryLevel: sensor.battery_level,
      calibrationDate: sensor.calibration_date,
      nextMaintenanceDate: sensor.next_maintenance_date
    };
  }

  // Public method to broadcast to specific user
  broadcastToUser(userId, event, data) {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  // Public method to broadcast to all connected clients
  broadcast(event, data) {
    this.io.emit(event, data);
  }
}

module.exports = WebSocketService;