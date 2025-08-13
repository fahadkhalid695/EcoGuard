import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isConnected = false;
  private eventCallbacks: Map<string, Function[]> = new Map();

  constructor() {
    this.connect();
  }

  private connect() {
    const token = localStorage.getItem('ecoguard_token');
    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3001';
    const enableWebSockets = import.meta.env.VITE_ENABLE_WEBSOCKETS === 'true';
    const demoMode = import.meta.env.VITE_DEMO_MODE === 'true';

    // Skip WebSocket connection in demo mode or if disabled
    if (demoMode || !enableWebSockets) {
      console.log('WebSocket connection skipped (demo mode or disabled)');
      this.simulateMockConnection();
      return;
    }

    if (!token) {
      console.log('No auth token found, WebSocket connection skipped');
      this.simulateMockConnection();
      return;
    }

    try {
      this.socket = io(wsUrl, {
        auth: {
          token: token
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        timeout: 5000
      });

      this.setupEventHandlers();
    } catch (error) {
      console.error('Failed to initialize WebSocket connection:', error);
      this.simulateMockConnection();
    }
  }

  private simulateMockConnection() {
    console.log('🔄 Using mock WebSocket data for demo');
    this.isConnected = false;
    
    // Simulate connection status for demo
    setTimeout(() => {
      this.emit('connection_status', { connected: false, demo: true });
    }, 100);

    // Simulate some mock data periodically
    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      this.startMockDataSimulation();
    }
  }

  private startMockDataSimulation() {
    // Simulate sensor readings every 5 seconds
    setInterval(() => {
      const mockReading = {
        sensorId: 'demo-sensor-001',
        type: 'temperature',
        value: 20 + Math.random() * 10,
        unit: '°C',
        timestamp: new Date().toISOString(),
        location: 'Demo Location'
      };
      this.emit('sensor_reading', mockReading);
    }, 5000);

    // Simulate status updates
    setTimeout(() => {
      this.emit('sensor_status', {
        sensorId: 'demo-sensor-001',
        status: 'online',
        batteryLevel: 85
      });
    }, 2000);
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Connected to EcoGuard WebSocket');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connection_status', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from WebSocket:', reason);
      this.isConnected = false;
      this.emit('connection_status', { connected: false, reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.log('Max reconnection attempts reached');
        this.emit('connection_error', { error: 'Max reconnection attempts reached' });
      }
    });

    // Sensor events
    this.socket.on('sensor_reading', (data) => {
      this.emit('sensor_reading', data);
    });

    this.socket.on('sensor_status', (data) => {
      this.emit('sensor_status', data);
    });

    this.socket.on('sensor_update', (data) => {
      this.emit('sensor_update', data);
    });

    // Alert events
    this.socket.on('alert', (data) => {
      this.emit('alert', data);
    });

    // System events
    this.socket.on('system_status', (data) => {
      this.emit('system_status', data);
    });

    // Error handling
    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    });
  }

  // Public methods
  public registerSensor(sensorData: any) {
    if (this.isConnected && this.socket) {
      this.socket.emit('sensor_registration', { sensorData });
    }
  }

  public sendReading(sensorId: string, reading: any) {
    if (this.isConnected && this.socket) {
      this.socket.emit('sensor_reading', { sensorId, reading });
    }
  }

  public sendAlert(sensorId: string, alert: any) {
    if (this.isConnected && this.socket) {
      this.socket.emit('sensor_alert', { sensorId, alert });
    }
  }

  public updateSensorStatus(sensorId: string, status: string) {
    if (this.isConnected && this.socket) {
      this.socket.emit('sensor_status', { sensorId, status });
    }
  }

  public sendCommand(sensorId: string, command: any) {
    if (this.isConnected && this.socket) {
      this.socket.emit('sensor_command', { sensorId, command });
    }
  }

  // Event subscription
  public on(event: string, callback: Function) {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, []);
    }
    this.eventCallbacks.get(event)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.eventCallbacks.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  public off(event: string, callback?: Function) {
    if (!callback) {
      this.eventCallbacks.delete(event);
      return;
    }

    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket event callback for ${event}:`, error);
        }
      });
    }
  }

  // Connection management
  public reconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
    this.reconnectAttempts = 0;
    this.connect();
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.eventCallbacks.clear();
  }

  public getConnectionStatus() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  // Update token when user logs in
  public updateToken(token: string) {
    localStorage.setItem('ecoguard_token', token);
    if (this.socket) {
      this.socket.auth = { token };
      this.socket.disconnect();
      this.socket.connect();
    } else {
      this.connect();
    }
  }

  // Clear token when user logs out
  public clearToken() {
    localStorage.removeItem('ecoguard_token');
    this.disconnect();
  }
}

export const websocketService = new WebSocketService();