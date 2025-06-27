import React, { useState, useEffect } from 'react';
import { Cpu, Wifi, Battery, Activity, AlertTriangle, Settings } from 'lucide-react';
import { sensorService } from '../services/sensorService';
import { aiService } from '../services/aiService';
import { securityService } from '../services/securityService';
import { Sensor, SensorReading } from '../types/sensor';

const IoTDashboard: React.FC = () => {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [statistics, setStatistics] = useState<any>({});
  const [aiStats, setAiStats] = useState<any>({});
  const [securityStatus, setSecurityStatus] = useState<any>({});
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);
  const [recentReadings, setRecentReadings] = useState<SensorReading[]>([]);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = () => {
    setSensors(sensorService.getAllSensors());
    setStatistics(sensorService.getSensorStatistics());
    setAiStats(aiService.getModelStatistics());
    setSecurityStatus(securityService.getSecurityStatus());
    
    if (selectedSensor) {
      setRecentReadings(sensorService.getRecentReadings(selectedSensor, 20));
    }
  };

  const getConnectivityIcon = (connectivity: string) => {
    switch (connectivity) {
      case 'wifi':
        return <Wifi className="w-4 h-4" />;
      case 'bluetooth':
        return <Activity className="w-4 h-4" />;
      case 'lorawan':
        return <Cpu className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'offline':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'maintenance':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 60) return 'text-emerald-600';
    if (level > 30) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Cpu className="w-8 h-8" />
          <h1 className="text-3xl font-bold">IoT & AI Dashboard</h1>
        </div>
        <p className="text-indigo-100 text-lg">
          Comprehensive sensor network monitoring with AI-powered analytics and security.
        </p>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Total Sensors</h3>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-slate-900">{statistics.totalSensors || 0}</p>
            <p className="text-sm text-slate-600">{statistics.onlineSensors || 0} online</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Wifi className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-slate-900">System Uptime</h3>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-slate-900">{statistics.uptime || 0}%</p>
            <p className="text-sm text-slate-600">Network health</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Cpu className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-900">AI Models</h3>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-slate-900">{aiStats.activeModels || 0}</p>
            <p className="text-sm text-slate-600">{aiStats.averageAccuracy || 0}% accuracy</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Active Alerts</h3>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-slate-900">{statistics.activeAlerts || 0}</p>
            <p className="text-sm text-slate-600">Require attention</p>
          </div>
        </div>
      </div>

      {/* Sensor Grid */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Sensor Network Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sensors.map((sensor) => (
            <div
              key={sensor.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedSensor === sensor.id ? 'ring-2 ring-blue-500 border-blue-200' : 'border-slate-200'
              }`}
              onClick={() => setSelectedSensor(sensor.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getConnectivityIcon(sensor.connectivity)}
                  <h4 className="font-semibold text-slate-900 text-sm">{sensor.name}</h4>
                </div>
                <span className={`px-2 py-1 text-xs font-medium border rounded-full ${getStatusColor(sensor.status)}`}>
                  {sensor.status}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Type:</span>
                  <span className="font-medium capitalize">{sensor.type.replace('_', ' ')}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Location:</span>
                  <span className="font-medium text-xs">{sensor.location.name}</span>
                </div>

                {sensor.batteryLevel && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Battery:</span>
                    <div className="flex items-center space-x-1">
                      <Battery className={`w-3 h-3 ${getBatteryColor(sensor.batteryLevel)}`} />
                      <span className={`font-medium ${getBatteryColor(sensor.batteryLevel)}`}>
                        {sensor.batteryLevel}%
                      </span>
                    </div>
                  </div>
                )}

                {sensor.lastReading && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Last Reading:</span>
                    <span className="font-medium">
                      {sensor.lastReading.value} {sensor.lastReading.unit}
                    </span>
                  </div>
                )}

                <div className="w-full bg-slate-200 rounded-full h-1">
                  <div 
                    className={`h-1 rounded-full ${
                      sensor.status === 'online' ? 'bg-emerald-500' : 
                      sensor.status === 'maintenance' ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: sensor.status === 'online' ? '100%' : '50%' }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Sensor Details */}
      {selectedSensor && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">
            Sensor Details: {sensors.find(s => s.id === selectedSensor)?.name}
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Readings */}
            <div>
              <h4 className="font-medium text-slate-900 mb-4">Recent Readings</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recentReadings.map((reading, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <span className="text-sm text-slate-600">
                      {reading.timestamp.toLocaleTimeString()}
                    </span>
                    <span className="font-medium">
                      {reading.value} {reading.unit}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      reading.quality === 'excellent' ? 'bg-emerald-100 text-emerald-800' :
                      reading.quality === 'good' ? 'bg-blue-100 text-blue-800' :
                      reading.quality === 'moderate' ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {reading.quality}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sensor Information */}
            <div>
              <h4 className="font-medium text-slate-900 mb-4">Sensor Information</h4>
              <div className="space-y-3">
                {(() => {
                  const sensor = sensors.find(s => s.id === selectedSensor);
                  if (!sensor) return null;
                  
                  return (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Connectivity:</span>
                        <span className="font-medium capitalize">{sensor.connectivity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Last Calibration:</span>
                        <span className="font-medium">{sensor.calibrationDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Next Maintenance:</span>
                        <span className="font-medium">{sensor.nextMaintenanceDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Coordinates:</span>
                        <span className="font-medium text-sm">
                          {sensor.location.lat.toFixed(4)}, {sensor.location.lng.toFixed(4)}
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Status */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Security Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
              securityStatus.authenticated ? 'bg-emerald-100' : 'bg-red-100'
            }`}>
              <Settings className={`w-6 h-6 ${
                securityStatus.authenticated ? 'text-emerald-600' : 'text-red-600'
              }`} />
            </div>
            <h4 className="font-medium text-slate-900">Authentication</h4>
            <p className={`text-sm ${
              securityStatus.authenticated ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {securityStatus.authenticated ? 'Authenticated' : 'Not Authenticated'}
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-medium text-slate-900">Encryption</h4>
            <p className="text-sm text-emerald-600">
              {securityStatus.encryptionEnabled ? 'Enabled' : 'Disabled'}
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full mx-auto mb-3 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-medium text-slate-900">Audit Logs</h4>
            <p className="text-sm text-slate-600">
              {securityStatus.auditLogCount || 0} entries
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IoTDashboard;