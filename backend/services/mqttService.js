const mqtt = require('mqtt');
const db = require('../config/database');

class MQTTService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  initialize() {
    const brokerUrl = `mqtt://${process.env.MQTT_BROKER_HOST || 'localhost'}:${process.env.MQTT_BROKER_PORT || 1883}`;
    
    const options = {
      clientId: `ecoguard-api-${Math.random().toString(16).substr(2, 8)}`,
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
      keepalive: 60,
      reconnectPeriod: 5000,
      clean: true
    };

    try {
      this.client = mqtt.connect(brokerUrl, options);
      this.setupEventHandlers();
      console.log('🔗 MQTT service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize MQTT service:', error.message);
    }
  }

  setupEventHandlers() {
    this.client.on('connect', () => {
      console.log('✅ Connected to MQTT broker');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Subscribe to LoRaWAN topics
      this.subscribeToTopics();
    });

    this.client.on('message', (topic, message) => {
      this.handleMessage(topic, message);
    });

    this.client.on('error', (error) => {
      console.error('❌ MQTT connection error:', error.message);
      this.isConnected = false;
    });

    this.client.on('close', () => {
      console.log('🔌 MQTT connection closed');
      this.isConnected = false;
    });

    this.client.on('reconnect', () => {
      this.reconnectAttempts++;
      console.log(`🔄 MQTT reconnecting... (attempt ${this.reconnectAttempts})`);
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.log('❌ Max MQTT reconnection attempts reached');
        this.client.end();
      }
    });
  }

  subscribeToTopics() {
    // Subscribe to The Things Network (TTN) topics
    const topics = [
      'v3/+/devices/+/up',           // TTN uplink messages
      'application/+/device/+/rx',   // ChirpStack uplink messages
      'ecoguard/+/+/data',          // Custom EcoGuard topics
      'lorawan/+/+/up'              // Generic LoRaWAN uplinks
    ];

    topics.forEach(topic => {
      this.client.subscribe(topic, (err) => {
        if (err) {
          console.error(`❌ Failed to subscribe to ${topic}:`, err.message);
        } else {
          console.log(`📡 Subscribed to MQTT topic: ${topic}`);
        }
      });
    });
  }

  async handleMessage(topic, message) {
    try {
      const data = JSON.parse(message.toString());
      console.log(`📨 MQTT message received on ${topic}`);

      // Handle different message formats
      if (topic.includes('v3/') && topic.includes('/up')) {
        // TTN v3 format
        await this.handleTTNMessage(data);
      } else if (topic.includes('application/') && topic.includes('/rx')) {
        // ChirpStack format
        await this.handleChirpStackMessage(data);
      } else if (topic.includes('ecoguard/')) {
        // Custom EcoGuard format
        await this.handleEcoGuardMessage(data);
      } else {
        console.log('🤷 Unknown MQTT message format');
      }
    } catch (error) {
      console.error('❌ Error processing MQTT message:', error.message);
    }
  }

  async handleTTNMessage(data) {
    try {
      const deviceId = data.end_device_ids?.device_id;
      const payload = data.uplink_message?.decoded_payload;
      const timestamp = new Date(data.received_at);

      if (!deviceId || !payload) {
        console.log('⚠️ Invalid TTN message format');
        return;
      }

      // Find sensor by device ID
      const sensor = await db('sensors')
        .where({ device_id: deviceId })
        .first();

      if (!sensor) {
        console.log(`⚠️ Sensor not found for device ID: ${deviceId}`);
        return;
      }

      // Process each measurement in the payload
      for (const [key, value] of Object.entries(payload)) {
        if (key === 'battery') {
          // Update battery level
          await db('sensors')
            .where({ id: sensor.id })
            .update({ 
              battery_level: value,
              updated_at: new Date()
            });
          continue;
        }

        // Insert sensor reading
        await db('sensor_readings').insert({
          sensor_id: sensor.id,
          timestamp,
          value: parseFloat(value),
          unit: this.getUnit(key),
          quality: this.getQuality(key, value),
          location_lat: sensor.location_lat,
          location_lng: sensor.location_lng,
          location_name: sensor.location_name,
          metadata: JSON.stringify({
            source: 'ttn',
            deviceId,
            rssi: data.uplink_message?.rx_metadata?.[0]?.rssi,
            snr: data.uplink_message?.rx_metadata?.[0]?.snr
          })
        });

        console.log(`📊 TTN reading saved: ${deviceId} - ${key}: ${value}`);
      }

      // Update sensor status to online
      await db('sensors')
        .where({ id: sensor.id })
        .update({ 
          status: 'online',
          updated_at: new Date()
        });

    } catch (error) {
      console.error('❌ Error handling TTN message:', error.message);
    }
  }

  async handleChirpStackMessage(data) {
    try {
      const deviceId = data.deviceName;
      const payload = data.object || data.data;
      const timestamp = new Date(data.time || data.rxInfo?.[0]?.time);

      if (!deviceId || !payload) {
        console.log('⚠️ Invalid ChirpStack message format');
        return;
      }

      // Find sensor by device ID
      const sensor = await db('sensors')
        .where({ device_id: deviceId })
        .first();

      if (!sensor) {
        console.log(`⚠️ Sensor not found for device ID: ${deviceId}`);
        return;
      }

      // Process payload similar to TTN
      for (const [key, value] of Object.entries(payload)) {
        if (key === 'battery') {
          await db('sensors')
            .where({ id: sensor.id })
            .update({ 
              battery_level: value,
              updated_at: new Date()
            });
          continue;
        }

        await db('sensor_readings').insert({
          sensor_id: sensor.id,
          timestamp,
          value: parseFloat(value),
          unit: this.getUnit(key),
          quality: this.getQuality(key, value),
          location_lat: sensor.location_lat,
          location_lng: sensor.location_lng,
          location_name: sensor.location_name,
          metadata: JSON.stringify({
            source: 'chirpstack',
            deviceId,
            rssi: data.rxInfo?.[0]?.rssi,
            loRaSNR: data.rxInfo?.[0]?.loRaSNR
          })
        });

        console.log(`📊 ChirpStack reading saved: ${deviceId} - ${key}: ${value}`);
      }

      await db('sensors')
        .where({ id: sensor.id })
        .update({ 
          status: 'online',
          updated_at: new Date()
        });

    } catch (error) {
      console.error('❌ Error handling ChirpStack message:', error.message);
    }
  }

  async handleEcoGuardMessage(data) {
    try {
      const { sensorId, readings } = data;

      if (!sensorId || !readings) {
        console.log('⚠️ Invalid EcoGuard message format');
        return;
      }

      // Find sensor
      const sensor = await db('sensors')
        .where({ id: sensorId })
        .first();

      if (!sensor) {
        console.log(`⚠️ Sensor not found: ${sensorId}`);
        return;
      }

      // Insert readings
      const readingsToInsert = readings.map(reading => ({
        sensor_id: sensorId,
        timestamp: new Date(reading.timestamp),
        value: parseFloat(reading.value),
        unit: reading.unit,
        quality: reading.quality || 'good',
        location_lat: reading.location?.lat || sensor.location_lat,
        location_lng: reading.location?.lng || sensor.location_lng,
        location_name: reading.location?.name || sensor.location_name,
        metadata: JSON.stringify({
          source: 'mqtt',
          ...reading.metadata
        })
      }));

      await db('sensor_readings').insert(readingsToInsert);

      await db('sensors')
        .where({ id: sensorId })
        .update({ 
          status: 'online',
          updated_at: new Date()
        });

      console.log(`📊 EcoGuard readings saved: ${sensorId} - ${readings.length} readings`);

    } catch (error) {
      console.error('❌ Error handling EcoGuard message:', error.message);
    }
  }

  getUnit(sensorType) {
    const units = {
      temperature: '°C',
      humidity: '%',
      co2: 'ppm',
      voc: 'ppb',
      pm25: 'μg/m³',
      pm10: 'μg/m³',
      light: 'lux',
      sound: 'dB',
      pressure: 'hPa',
      ph: 'pH',
      turbidity: 'NTU',
      energy: 'kW'
    };

    return units[sensorType] || 'units';
  }

  getQuality(sensorType, value) {
    switch (sensorType) {
      case 'temperature':
        return (value >= 18 && value <= 26) ? 'good' : 
               (value >= 15 && value <= 30) ? 'moderate' : 'poor';
      
      case 'humidity':
        return (value >= 40 && value <= 60) ? 'good' :
               (value >= 30 && value <= 70) ? 'moderate' : 'poor';
      
      case 'co2':
        return value < 600 ? 'good' : 
               value < 800 ? 'moderate' : 'poor';
      
      case 'pm25':
        return value < 12 ? 'good' :
               value < 35 ? 'moderate' : 'poor';
      
      case 'sound':
        return value < 55 ? 'good' :
               value < 70 ? 'moderate' : 'poor';
      
      default:
        return 'good';
    }
  }

  // Public method to publish messages
  publish(topic, message, options = {}) {
    if (!this.isConnected) {
      console.log('⚠️ MQTT not connected, cannot publish message');
      return false;
    }

    const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
    
    this.client.publish(topic, messageStr, options, (err) => {
      if (err) {
        console.error(`❌ Failed to publish to ${topic}:`, err.message);
      } else {
        console.log(`📤 Published to MQTT topic: ${topic}`);
      }
    });

    return true;
  }

  // Send command to LoRaWAN device
  sendCommand(deviceId, command) {
    const topic = `v3/${process.env.TTN_APP_ID}/devices/${deviceId}/down/push`;
    const message = {
      downlinks: [{
        f_port: 1,
        frm_payload: Buffer.from(JSON.stringify(command)).toString('base64'),
        priority: 'NORMAL'
      }]
    };

    return this.publish(topic, message);
  }

  // Get connection status
  getStatus() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  // Graceful shutdown
  disconnect() {
    if (this.client) {
      this.client.end();
      console.log('🔌 MQTT service disconnected');
    }
  }
}

module.exports = MQTTService;