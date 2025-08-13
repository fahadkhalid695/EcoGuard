import { Sensor, SensorReading, Alert } from '../types/sensor';

class SensorService {
  private sensors: Map<string, Sensor> = new Map();
  private readings: SensorReading[] = [];
  private alerts: Alert[] = [];
  private websocket: WebSocket | null = null;
  private mockDataInterval: NodeJS.Timeout | null = null;
  private connectionAttempts = 0;
  private maxConnectionAttempts = 3;

  constructor() {
    this.generateMockSensors();
    this.initializeWebSocket();
  }

  private initializeWebSocket() {
    // Check if WebSocket connections are explicitly enabled
    const websocketsEnabled = import.meta.env.VITE_ENABLE_WEBSOCKETS === 'true';
    
    if (!websocketsEnabled) {
      console.log('WebSocket connections disabled, using mock data only');
      this.startMockDataGeneration();
      return;
    }

    // Don't attempt connection if we've already exceeded max attempts
    if (this.connectionAttempts >= this.maxConnectionAttempts) {
      console.log('Max WebSocket connection attempts reached, using mock data only');
      this.startMockDataGeneration();
      return;
    }

    try {
      const wsUrl = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3001';
      this.websocket = new WebSocket(`${wsUrl}/sensors`);
      this.connectionAttempts++;
      
      this.websocket.onopen = () => {
        console.log('Sensor WebSocket connected');
        this.connectionAttempts = 0; // Reset on successful connection
      };

      this.websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleRealtimeData(data);
      };

      this.websocket.onerror = (error) => {
        console.log('WebSocket connection error, falling back to mock data');
        this.startMockDataGeneration();
      };

      this.websocket.onclose = () => {
        console.log('Sensor WebSocket disconnected');
        // Only attempt to reconnect if we haven't exceeded max attempts
        if (this.connectionAttempts < this.maxConnectionAttempts) {
          setTimeout(() => this.initializeWebSocket(), 5000);
        } else {
          console.log('Max reconnection attempts reached, using mock data only');
          this.startMockDataGeneration();
        }
      };
    } catch (error) {
      console.log('WebSocket not available, using mock data');
      this.startMockDataGeneration();
    }
  }

  private handleRealtimeData(data: any) {
    if (data.type === 'sensor_reading') {
      this.addReading(data.reading);
    } else if (data.type === 'sensor_status') {
      this.updateSensorStatus(data.sensorId, data.status);
    } else if (data.type === 'alert') {
      this.addAlert(data.alert);
    }
  }

  private generateMockSensors() {
    const mockSensors: Sensor[] = [
      {
        id: 'temp-001',
        name: 'Temperature Sensor - Building A',
        type: 'temperature',
        location: { lat: 40.7128, lng: -74.0060, name: 'Building A - Floor 1' },
        status: 'online',
        lastReading: null,
        batteryLevel: 85,
        connectivity: 'wifi',
        calibrationDate: new Date('2024-01-01'),
        nextMaintenanceDate: new Date('2024-06-01')
      },
      {
        id: 'hum-001',
        name: 'Humidity Sensor - Building A',
        type: 'humidity',
        location: { lat: 40.7128, lng: -74.0060, name: 'Building A - Floor 1' },
        status: 'online',
        lastReading: null,
        batteryLevel: 92,
        connectivity: 'wifi',
        calibrationDate: new Date('2024-01-01'),
        nextMaintenanceDate: new Date('2024-06-01')
      },
      {
        id: 'motion-001',
        name: 'Motion Detector - Lobby',
        type: 'motion',
        location: { lat: 40.7130, lng: -74.0058, name: 'Main Lobby' },
        status: 'online',
        lastReading: null,
        batteryLevel: 78,
        connectivity: 'bluetooth',
        calibrationDate: new Date('2024-01-15'),
        nextMaintenanceDate: new Date('2024-07-15')
      },
      {
        id: 'co2-001',
        name: 'CO2 Monitor - Conference Room',
        type: 'co2',
        location: { lat: 40.7125, lng: -74.0062, name: 'Conference Room B' },
        status: 'online',
        lastReading: null,
        batteryLevel: 95,
        connectivity: 'wifi',
        calibrationDate: new Date('2024-01-10'),
        nextMaintenanceDate: new Date('2024-04-10')
      },
      {
        id: 'voc-001',
        name: 'VOC Sensor - Laboratory',
        type: 'voc',
        location: { lat: 40.7132, lng: -74.0055, name: 'Research Laboratory' },
        status: 'online',
        lastReading: null,
        batteryLevel: 88,
        connectivity: 'lorawan',
        calibrationDate: new Date('2024-01-05'),
        nextMaintenanceDate: new Date('2024-04-05')
      },
      {
        id: 'light-001',
        name: 'Light Sensor - Office Area',
        type: 'light',
        location: { lat: 40.7127, lng: -74.0061, name: 'Open Office Area' },
        status: 'online',
        lastReading: null,
        batteryLevel: 91,
        connectivity: 'wifi',
        calibrationDate: new Date('2024-01-20'),
        nextMaintenanceDate: new Date('2024-07-20')
      },
      {
        id: 'sound-001',
        name: 'Sound Level Meter - Cafeteria',
        type: 'sound',
        location: { lat: 40.7129, lng: -74.0059, name: 'Employee Cafeteria' },
        status: 'online',
        lastReading: null,
        batteryLevel: 83,
        connectivity: 'wifi',
        calibrationDate: new Date('2024-01-12'),
        nextMaintenanceDate: new Date('2024-05-12')
      },
      {
        id: 'energy-001',
        name: 'Energy Meter - Main Panel',
        type: 'energy',
        location: { lat: 40.7126, lng: -74.0063, name: 'Electrical Room' },
        status: 'online',
        lastReading: null,
        connectivity: 'wifi',
        calibrationDate: new Date('2024-01-01'),
        nextMaintenanceDate: new Date('2024-12-01')
      }
    ];

    mockSensors.forEach(sensor => {
      this.sensors.set(sensor.id, sensor);
    });
  }

  private startMockDataGeneration() {
    // Prevent multiple mock data intervals
    if (this.mockDataInterval) {
      return;
    }

    this.mockDataInterval = setInterval(() => {
      this.sensors.forEach(sensor => {
        const reading = this.generateMockReading(sensor);
        this.addReading(reading);
      });
    }, 5000); // Generate new readings every 5 seconds
  }

  private generateMockReading(sensor: Sensor): SensorReading {
    let value: number;
    let unit: string;
    let quality: 'excellent' | 'good' | 'moderate' | 'poor';

    switch (sensor.type) {
      case 'temperature':
        value = 20 + Math.random() * 10; // 20-30°C
        unit = '°C';
        quality = value > 25 ? 'moderate' : 'good';
        break;
      case 'humidity':
        value = 40 + Math.random() * 40; // 40-80%
        unit = '%';
        quality = value > 70 ? 'moderate' : 'good';
        break;
      case 'motion':
        value = Math.random() > 0.7 ? 1 : 0; // Motion detected
        unit = 'detected';
        quality = 'good';
        break;
      case 'co2':
        value = 400 + Math.random() * 600; // 400-1000 ppm
        unit = 'ppm';
        quality = value > 800 ? 'poor' : value > 600 ? 'moderate' : 'good';
        break;
      case 'voc':
        value = Math.random() * 500; // 0-500 ppb
        unit = 'ppb';
        quality = value > 300 ? 'poor' : value > 150 ? 'moderate' : 'good';
        break;
      case 'light':
        value = Math.random() * 1000; // 0-1000 lux
        unit = 'lux';
        quality = 'good';
        break;
      case 'sound':
        value = 30 + Math.random() * 50; // 30-80 dB
        unit = 'dB';
        quality = value > 70 ? 'poor' : value > 55 ? 'moderate' : 'good';
        break;
      case 'energy':
        value = Math.random() * 100; // 0-100 kW
        unit = 'kW';
        quality = 'good';
        break;
      default:
        value = Math.random() * 100;
        unit = 'units';
        quality = 'good';
    }

    return {
      id: `reading-${Date.now()}-${Math.random()}`,
      sensorId: sensor.id,
      timestamp: new Date(),
      value: Math.round(value * 100) / 100,
      unit,
      quality,
      location: sensor.location
    };
  }

  private addReading(reading: SensorReading) {
    this.readings.push(reading);
    
    // Update sensor's last reading
    const sensor = this.sensors.get(reading.sensorId);
    if (sensor) {
      sensor.lastReading = reading;
    }

    // Keep only last 1000 readings per sensor
    this.readings = this.readings.slice(-1000);

    // Check for alerts
    this.checkForAlerts(reading);
  }

  private checkForAlerts(reading: SensorReading) {
    const sensor = this.sensors.get(reading.sensorId);
    if (!sensor) return;

    let shouldAlert = false;
    let alertMessage = '';
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';

    switch (sensor.type) {
      case 'temperature':
        if (reading.value > 30) {
          shouldAlert = true;
          alertMessage = `High temperature detected: ${reading.value}°C`;
          severity = reading.value > 35 ? 'critical' : 'high';
        }
        break;
      case 'co2':
        if (reading.value > 800) {
          shouldAlert = true;
          alertMessage = `High CO2 levels detected: ${reading.value} ppm`;
          severity = reading.value > 1000 ? 'critical' : 'high';
        }
        break;
      case 'sound':
        if (reading.value > 70) {
          shouldAlert = true;
          alertMessage = `High noise levels detected: ${reading.value} dB`;
          severity = reading.value > 80 ? 'critical' : 'high';
        }
        break;
    }

    if (shouldAlert) {
      this.addAlert({
        id: `alert-${Date.now()}`,
        sensorId: reading.sensorId,
        type: 'threshold',
        severity,
        message: alertMessage,
        timestamp: new Date(),
        acknowledged: false
      });
    }
  }

  private addAlert(alert: Alert) {
    this.alerts.unshift(alert);
    // Keep only last 100 alerts
    this.alerts = this.alerts.slice(0, 100);
  }

  private updateSensorStatus(sensorId: string, status: 'online' | 'offline' | 'maintenance') {
    const sensor = this.sensors.get(sensorId);
    if (sensor) {
      sensor.status = status;
    }
  }

  // Public API methods
  public getAllSensors(): Sensor[] {
    return Array.from(this.sensors.values());
  }

  public getSensorById(id: string): Sensor | undefined {
    return this.sensors.get(id);
  }

  public getSensorsByType(type: string): Sensor[] {
    return Array.from(this.sensors.values()).filter(sensor => sensor.type === type);
  }

  public getRecentReadings(sensorId?: string, limit: number = 50): SensorReading[] {
    let filteredReadings = this.readings;
    
    if (sensorId) {
      filteredReadings = this.readings.filter(reading => reading.sensorId === sensorId);
    }
    
    return filteredReadings
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  public getAlerts(acknowledged?: boolean): Alert[] {
    let filteredAlerts = this.alerts;
    
    if (acknowledged !== undefined) {
      filteredAlerts = this.alerts.filter(alert => alert.acknowledged === acknowledged);
    }
    
    return filteredAlerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  public acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  public getSensorStatistics() {
    const sensors = this.getAllSensors();
    const totalSensors = sensors.length;
    const onlineSensors = sensors.filter(s => s.status === 'online').length;
    const offlineSensors = sensors.filter(s => s.status === 'offline').length;
    const maintenanceSensors = sensors.filter(s => s.status === 'maintenance').length;
    const activeAlerts = this.getAlerts(false).length;

    return {
      totalSensors,
      onlineSensors,
      offlineSensors,
      maintenanceSensors,
      activeAlerts,
      uptime: Math.round((onlineSensors / totalSensors) * 100)
    };
  }
}

export const sensorService = new SensorService();