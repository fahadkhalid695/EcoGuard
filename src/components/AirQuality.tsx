import React from 'react';
import { Wind, Thermometer, Eye, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const AirQuality: React.FC = () => {
  const airQualityData = [
    { time: '00:00', aqi: 35, pm25: 12, pm10: 18, no2: 25, o3: 45 },
    { time: '04:00', aqi: 42, pm25: 15, pm10: 22, no2: 28, o3: 52 },
    { time: '08:00', aqi: 68, pm25: 25, pm10: 35, no2: 45, o3: 78 },
    { time: '12:00', aqi: 75, pm25: 28, pm10: 38, no2: 48, o3: 85 },
    { time: '16:00', aqi: 58, pm25: 22, pm10: 28, no2: 38, o3: 65 },
    { time: '20:00', aqi: 45, pm25: 18, pm10: 25, no2: 32, o3: 55 },
  ];

  const pollutantData = [
    { name: 'PM2.5', value: 25, limit: 35, unit: 'μg/m³', status: 'good' },
    { name: 'PM10', value: 35, limit: 50, unit: 'μg/m³', status: 'good' },
    { name: 'NO2', value: 45, limit: 40, unit: 'ppb', status: 'moderate' },
    { name: 'O3', value: 78, limit: 70, unit: 'ppb', status: 'moderate' },
    { name: 'CO', value: 0.8, limit: 9, unit: 'ppm', status: 'good' },
    { name: 'SO2', value: 15, limit: 75, unit: 'ppb', status: 'good' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'moderate':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'poor':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-600 to-blue-700 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Wind className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Air Quality Monitoring</h1>
        </div>
        <p className="text-sky-100 text-lg">
          Real-time air quality measurements and pollutant tracking across monitoring stations.
        </p>
      </div>

      {/* Current Conditions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Activity className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Air Quality Index</h3>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-slate-900">42</p>
            <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full">
              Good
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Thermometer className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Temperature</h3>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-slate-900">22°C</p>
            <p className="text-sm text-slate-600">Humidity: 65%</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Eye className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Visibility</h3>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-slate-900">8.5 km</p>
            <p className="text-sm text-slate-600">Clear</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Wind className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Wind Speed</h3>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-slate-900">12 km/h</p>
            <p className="text-sm text-slate-600">NE Direction</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AQI Trend */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">24-Hour AQI Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={airQualityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="aqi" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pollutant Levels */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Current Pollutant Levels</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pollutantData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="limit" fill="#f59e0b" opacity={0.3} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pollutant Details */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Detailed Pollutant Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pollutantData.map((pollutant, index) => (
            <div 
              key={index}
              className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-900">{pollutant.name}</h4>
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(pollutant.status)}`}>
                  {pollutant.status}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Current:</span>
                  <span className="font-medium">{pollutant.value} {pollutant.unit}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Limit:</span>
                  <span className="font-medium">{pollutant.limit} {pollutant.unit}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${pollutant.value > pollutant.limit ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min((pollutant.value / pollutant.limit) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AirQuality;