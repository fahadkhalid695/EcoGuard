export interface SensorReading {
  id: string;
  sensorId: string;
  timestamp: Date;
  value: number;
  unit: string;
  quality: 'excellent' | 'good' | 'moderate' | 'poor';
  location: {
    lat: number;
    lng: number;
    name: string;
  };
}

export interface Sensor {
  id: string;
  name: string;
  type: SensorType;
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  status: 'online' | 'offline' | 'maintenance';
  lastReading: SensorReading | null;
  batteryLevel?: number;
  connectivity: 'wifi' | 'lorawan' | 'bluetooth' | 'cellular';
  calibrationDate: Date;
  nextMaintenanceDate: Date;
}

export type SensorType = 
  | 'temperature'
  | 'humidity'
  | 'motion'
  | 'occupancy'
  | 'co2'
  | 'voc'
  | 'pm25'
  | 'pm10'
  | 'light'
  | 'sound'
  | 'energy'
  | 'air_pressure'
  | 'wind_speed'
  | 'wind_direction';

export interface Alert {
  id: string;
  sensorId: string;
  type: 'threshold' | 'anomaly' | 'maintenance' | 'connectivity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  resolvedAt?: Date;
}

export interface AIModel {
  id: string;
  name: string;
  type: 'predictive_maintenance' | 'anomaly_detection' | 'pattern_recognition' | 'optimization';
  accuracy: number;
  lastTraining: Date;
  status: 'active' | 'training' | 'inactive';
}

export interface Prediction {
  id: string;
  modelId: string;
  sensorId: string;
  type: string;
  prediction: any;
  confidence: number;
  timestamp: Date;
  validUntil: Date;
}