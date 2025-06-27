import React, { useState, useEffect } from 'react';
import { Plus, Wifi, Bluetooth, Radio, Smartphone, Search, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import { hardwareService, HardwareConfig } from '../services/hardwareService';

const SensorSetup: React.FC = () => {
  const [discoveredSensors, setDiscoveredSensors] = useState<HardwareConfig[]>([]);
  const [connectedDevices, setConnectedDevices] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSensorConfig, setNewSensorConfig] = useState<Partial<HardwareConfig>>({
    sensorType: 'temperature',
    connectionType: 'wifi'
  });

  useEffect(() => {
    loadConnectedDevices();
  }, []);

  const loadConnectedDevices = () => {
    setConnectedDevices(hardwareService.getConnectedDevices());
  };

  const handleDiscoverSensors = async () => {
    setIsScanning(true);
    try {
      const sensors = await hardwareService.discoverSensors();
      setDiscoveredSensors(sensors);
    } catch (error) {
      console.error('Sensor discovery failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleConnectSensor = async (config: HardwareConfig) => {
    let success = false;
    
    switch (config.connectionType) {
      case 'wifi':
        success = await hardwareService.connectWiFiSensor(config);
        break;
      case 'bluetooth':
        success = await hardwareService.connectBluetoothSensor(config);
        break;
      case 'lorawan':
        success = await hardwareService.connectMQTTSensor(config);
        break;
    }

    if (success) {
      loadConnectedDevices();
      setDiscoveredSensors(prev => prev.filter(s => s.deviceId !== config.deviceId));
    }
  };

  const handleAddManualSensor = async () => {
    if (!newSensorConfig.deviceId || !newSensorConfig.sensorType) return;

    const config: HardwareConfig = {
      sensorType: newSensorConfig.sensorType!,
      connectionType: newSensorConfig.connectionType!,
      deviceId: newSensorConfig.deviceId!,
      apiEndpoint: newSensorConfig.apiEndpoint,
      mqttTopic: newSensorConfig.mqttTopic,
      bluetoothUUID: newSensorConfig.bluetoothUUID
    };

    await handleConnectSensor(config);
    setShowAddForm(false);
    setNewSensorConfig({ sensorType: 'temperature', connectionType: 'wifi' });
  };

  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'wifi': return <Wifi className="w-5 h-5" />;
      case 'bluetooth': return <Bluetooth className="w-5 h-5" />;
      case 'lorawan': return <Radio className="w-5 h-5" />;
      case 'cellular': return <Smartphone className="w-5 h-5" />;
      default: return <Settings className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-4">Sensor Setup & Management</h1>
            <p className="text-blue-100 text-lg">
              Connect and configure your IoT sensors for real-time environmental monitoring.
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleDiscoverSensors}
              disabled={isScanning}
              className="flex items-center space-x-2 bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50"
            >
              <Search className={`w-5 h-5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning...' : 'Discover Sensors'}</span>
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors duration-200"
            >
              <Plus className="w-5 h-5" />
              <span>Add Manually</span>
            </button>
          </div>
        </div>
      </div>

      {/* Connected Devices */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Connected Devices ({connectedDevices.length})</h3>
        {connectedDevices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectedDevices.map((device, index) => (
              <div key={index} className="p-4 border border-emerald-200 bg-emerald-50 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    {getConnectionIcon(device.type)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{device.deviceId}</h4>
                    <p className="text-sm text-slate-600 capitalize">{device.type} connection</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-xs text-slate-500">
                  Last seen: {device.lastSeen.toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">No sensors connected. Discover or add sensors to get started.</p>
          </div>
        )}
      </div>

      {/* Discovered Sensors */}
      {discoveredSensors.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Discovered Sensors</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {discoveredSensors.map((sensor, index) => (
              <div key={index} className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {getConnectionIcon(sensor.connectionType)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{sensor.deviceId}</h4>
                      <p className="text-sm text-slate-600 capitalize">{sensor.sensorType}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleConnectSensor(sensor)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors duration-200"
                  >
                    Connect
                  </button>
                </div>
                <p className="text-xs text-slate-500 capitalize">
                  {sensor.connectionType} connection
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Add Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Add Sensor Manually</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Sensor Type</label>
                <select
                  value={newSensorConfig.sensorType}
                  onChange={(e) => setNewSensorConfig({ ...newSensorConfig, sensorType: e.target.value })}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="temperature">Temperature</option>
                  <option value="humidity">Humidity</option>
                  <option value="co2">CO2</option>
                  <option value="voc">VOC</option>
                  <option value="pm25">PM2.5</option>
                  <option value="sound">Sound Level</option>
                  <option value="light">Light</option>
                  <option value="motion">Motion</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Connection Type</label>
                <select
                  value={newSensorConfig.connectionType}
                  onChange={(e) => setNewSensorConfig({ ...newSensorConfig, connectionType: e.target.value as any })}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="wifi">WiFi</option>
                  <option value="bluetooth">Bluetooth</option>
                  <option value="lorawan">LoRaWAN</option>
                  <option value="cellular">Cellular</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Device ID</label>
                <input
                  type="text"
                  value={newSensorConfig.deviceId || ''}
                  onChange={(e) => setNewSensorConfig({ ...newSensorConfig, deviceId: e.target.value })}
                  placeholder="Enter unique device identifier"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {newSensorConfig.connectionType === 'wifi' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">API Endpoint</label>
                  <input
                    type="url"
                    value={newSensorConfig.apiEndpoint || ''}
                    onChange={(e) => setNewSensorConfig({ ...newSensorConfig, apiEndpoint: e.target.value })}
                    placeholder="http://192.168.1.100:8080"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              {newSensorConfig.connectionType === 'lorawan' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">MQTT Topic</label>
                  <input
                    type="text"
                    value={newSensorConfig.mqttTopic || ''}
                    onChange={(e) => setNewSensorConfig({ ...newSensorConfig, mqttTopic: e.target.value })}
                    placeholder="sensors/temperature/device123"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              {newSensorConfig.connectionType === 'bluetooth' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Bluetooth Service UUID</label>
                  <input
                    type="text"
                    value={newSensorConfig.bluetoothUUID || ''}
                    onChange={(e) => setNewSensorConfig({ ...newSensorConfig, bluetoothUUID: e.target.value })}
                    placeholder="environmental_sensing"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddManualSensor}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Add Sensor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Setup Instructions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Sensor Setup Instructions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900">WiFi Sensors</h4>
            <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
              <li>Connect sensor to your WiFi network</li>
              <li>Note the sensor's IP address</li>
              <li>Ensure sensor API is accessible on port 8080</li>
              <li>Use discovery or add manually with IP</li>
            </ol>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900">Bluetooth Sensors</h4>
            <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
              <li>Enable Bluetooth on your device</li>
              <li>Put sensor in pairing mode</li>
              <li>Click "Discover Sensors" to scan</li>
              <li>Select and connect to your sensor</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensorSetup;