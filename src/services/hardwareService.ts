import { Sensor, SensorReading } from '../types/sensor';

export interface HardwareConfig {
  sensorType: string;
  connectionType: 'wifi' | 'lorawan' | 'bluetooth' | 'cellular';
  deviceId: string;
  apiEndpoint?: string;
  mqttTopic?: string;
  bluetoothUUID?: string;
}

class HardwareService {
  private connectedDevices: Map<string, any> = new Map();
  private mqttClient: any = null;
  private bluetoothDevices: Map<string, BluetoothDevice> = new Map();

  // WiFi Sensor Integration
  async connectWiFiSensor(config: HardwareConfig): Promise<boolean> {
    try {
      if (!config.apiEndpoint) throw new Error('API endpoint required for WiFi sensors');
      
      const response = await fetch(`${config.apiEndpoint}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-ID': config.deviceId
        }
      });

      if (response.ok) {
        this.connectedDevices.set(config.deviceId, {
          type: 'wifi',
          config,
          lastSeen: new Date()
        });
        console.log(`WiFi sensor ${config.deviceId} connected successfully`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('WiFi sensor connection failed:', error);
      return false;
    }
  }

  // MQTT/LoRaWAN Integration
  async connectMQTTSensor(config: HardwareConfig): Promise<boolean> {
    try {
      // In a real implementation, you'd use a proper MQTT client like mqtt.js
      // For demo purposes, we'll simulate the connection
      
      const mqttConfig = {
        host: process.env.MQTT_BROKER_HOST || 'localhost',
        port: parseInt(process.env.MQTT_BROKER_PORT || '1883'),
        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD
      };

      // Simulate MQTT connection
      this.connectedDevices.set(config.deviceId, {
        type: 'mqtt',
        config,
        topic: config.mqttTopic,
        lastSeen: new Date()
      });

      console.log(`MQTT sensor ${config.deviceId} connected to topic: ${config.mqttTopic}`);
      return true;
    } catch (error) {
      console.error('MQTT sensor connection failed:', error);
      return false;
    }
  }

  // Bluetooth Sensor Integration
  async connectBluetoothSensor(config: HardwareConfig): Promise<boolean> {
    try {
      if (!navigator.bluetooth) {
        throw new Error('Bluetooth not supported in this browser');
      }

      const device = await navigator.bluetooth.requestDevice({
        filters: [{ name: config.deviceId }],
        optionalServices: [config.bluetoothUUID || 'environmental_sensing']
      });

      const server = await device.gatt?.connect();
      if (server) {
        this.bluetoothDevices.set(config.deviceId, device);
        this.connectedDevices.set(config.deviceId, {
          type: 'bluetooth',
          config,
          device,
          server,
          lastSeen: new Date()
        });

        console.log(`Bluetooth sensor ${config.deviceId} connected successfully`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Bluetooth sensor connection failed:', error);
      return false;
    }
  }

  // Read data from connected sensors
  async readSensorData(deviceId: string): Promise<SensorReading | null> {
    const device = this.connectedDevices.get(deviceId);
    if (!device) return null;

    try {
      switch (device.type) {
        case 'wifi':
          return await this.readWiFiSensorData(device);
        case 'mqtt':
          return await this.readMQTTSensorData(device);
        case 'bluetooth':
          return await this.readBluetoothSensorData(device);
        default:
          return null;
      }
    } catch (error) {
      console.error(`Failed to read data from sensor ${deviceId}:`, error);
      return null;
    }
  }

  private async readWiFiSensorData(device: any): Promise<SensorReading | null> {
    const response = await fetch(`${device.config.apiEndpoint}/data`, {
      headers: {
        'X-Device-ID': device.config.deviceId
      }
    });

    if (response.ok) {
      const data = await response.json();
      return {
        id: `reading-${Date.now()}`,
        sensorId: device.config.deviceId,
        timestamp: new Date(),
        value: data.value,
        unit: data.unit,
        quality: data.quality || 'good',
        location: data.location || { lat: 0, lng: 0, name: 'Unknown' }
      };
    }
    return null;
  }

  private async readMQTTSensorData(device: any): Promise<SensorReading | null> {
    // In real implementation, this would listen to MQTT messages
    // For demo, we'll return simulated data
    return {
      id: `reading-${Date.now()}`,
      sensorId: device.config.deviceId,
      timestamp: new Date(),
      value: Math.random() * 100,
      unit: 'units',
      quality: 'good',
      location: { lat: 0, lng: 0, name: 'MQTT Sensor' }
    };
  }

  private async readBluetoothSensorData(device: any): Promise<SensorReading | null> {
    try {
      const server = device.server;
      const service = await server.getPrimaryService('environmental_sensing');
      const characteristic = await service.getCharacteristic('temperature');
      const value = await characteristic.readValue();
      
      // Parse the value based on your sensor's data format
      const temperature = value.getFloat32(0, true);
      
      return {
        id: `reading-${Date.now()}`,
        sensorId: device.config.deviceId,
        timestamp: new Date(),
        value: temperature,
        unit: '°C',
        quality: 'good',
        location: { lat: 0, lng: 0, name: 'Bluetooth Sensor' }
      };
    } catch (error) {
      console.error('Bluetooth read error:', error);
      return null;
    }
  }

  // Get all connected devices
  getConnectedDevices(): Array<{ deviceId: string; type: string; lastSeen: Date }> {
    return Array.from(this.connectedDevices.entries()).map(([deviceId, device]) => ({
      deviceId,
      type: device.type,
      lastSeen: device.lastSeen
    }));
  }

  // Disconnect a sensor
  async disconnectSensor(deviceId: string): Promise<boolean> {
    const device = this.connectedDevices.get(deviceId);
    if (!device) return false;

    try {
      if (device.type === 'bluetooth' && device.server) {
        await device.server.disconnect();
      }
      
      this.connectedDevices.delete(deviceId);
      console.log(`Sensor ${deviceId} disconnected successfully`);
      return true;
    } catch (error) {
      console.error(`Failed to disconnect sensor ${deviceId}:`, error);
      return false;
    }
  }

  // Auto-discovery of sensors
  async discoverSensors(): Promise<HardwareConfig[]> {
    const discoveredSensors: HardwareConfig[] = [];

    // WiFi sensor discovery (scan local network)
    try {
      const response = await fetch('/api/discover-wifi-sensors');
      if (response.ok) {
        const wifiSensors = await response.json();
        discoveredSensors.push(...wifiSensors);
      }
    } catch (error) {
      console.log('WiFi sensor discovery not available');
    }

    // Bluetooth sensor discovery
    try {
      if (navigator.bluetooth) {
        const devices = await navigator.bluetooth.getDevices();
        devices.forEach(device => {
          if (device.name?.includes('EcoSensor')) {
            discoveredSensors.push({
              sensorType: 'environmental',
              connectionType: 'bluetooth',
              deviceId: device.name,
              bluetoothUUID: 'environmental_sensing'
            });
          }
        });
      }
    } catch (error) {
      console.log('Bluetooth discovery not available');
    }

    return discoveredSensors;
  }
}

export const hardwareService = new HardwareService();