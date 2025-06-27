import React from 'react';
import { Volume2, Clock, MapPin, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const NoiseMonitoring: React.FC = () => {
  const noiseData = [
    { time: '00:00', level: 35, residential: 32, commercial: 45, industrial: 55 },
    { time: '04:00', level: 28, residential: 25, commercial: 38, industrial: 48 },
    { time: '08:00', level: 65, residential: 58, commercial: 72, industrial: 78 },
    { time: '12:00', level: 72, residential: 65, commercial: 78, industrial: 85 },
    { time: '16:00', level: 68, residential: 62, commercial: 75, industrial: 82 },
    { time: '20:00', level: 58, residential: 55, commercial: 65, industrial: 75 },
  ];

  const locationData = [
    { location: 'Residential Area', current: 52, limit: 55, peak: 68, status: 'good' },
    { location: 'Commercial District', current: 65, limit: 65, peak: 78, status: 'moderate' },
    { location: 'Industrial Zone', current: 82, limit: 70, peak: 95, status: 'poor' },
    { location: 'Highway Junction', current: 85, limit: 70, peak: 95, status: 'poor' },
    { location: 'Park Area', current: 35, limit: 50, peak: 45, status: 'excellent' },
    { location: 'School Zone', current: 48, limit: 45, peak: 62, status: 'moderate' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'good':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'moderate':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'poor':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getNoiseLevel = (db: number) => {
    if (db < 40) return { level: 'Quiet', color: 'text-emerald-600' };
    if (db < 55) return { level: 'Moderate', color: 'text-blue-600' };
    if (db < 70) return { level: 'Loud', color: 'text-amber-600' };
    return { level: 'Very Loud', color: 'text-red-600' };
  };

  const currentNoise = getNoiseLevel(58);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Volume2 className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Noise Pollution Monitoring</h1>
        </div>
        <p className="text-purple-100 text-lg">
          Real-time noise level monitoring and acoustic pollution tracking across urban areas.
        </p>
      </div>

      {/* Current Noise Level */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Current Average Noise Level</h2>
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="text-6xl font-bold text-purple-600">58</div>
            <div className="text-left">
              <div className="text-2xl font-semibold text-slate-700">dB</div>
              <div className={`text-lg font-semibold ${currentNoise.color}`}>{currentNoise.level}</div>
            </div>
          </div>
          <div className="flex items-center justify-center space-x-8 text-sm text-slate-600">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Last updated: 2 minutes ago</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Trending: Decreasing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Noise Level Guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="text-center">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Volume2 className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Quiet</h3>
            <p className="text-2xl font-bold text-emerald-600 my-2">&lt; 40 dB</p>
            <p className="text-sm text-slate-600">Library, bedroom</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Volume2 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Moderate</h3>
            <p className="text-2xl font-bold text-blue-600 my-2">40-55 dB</p>
            <p className="text-sm text-slate-600">Normal conversation</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="text-center">
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Volume2 className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Loud</h3>
            <p className="text-2xl font-bold text-amber-600 my-2">55-70 dB</p>
            <p className="text-sm text-slate-600">Busy traffic</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Volume2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Very Loud</h3>
            <p className="text-2xl font-bold text-red-600 my-2">&gt; 70 dB</p>
            <p className="text-sm text-slate-600">Heavy machinery</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 24-Hour Noise Trend */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">24-Hour Noise Level Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={noiseData}>
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
                dataKey="level" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                name="Average Noise (dB)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Zone Comparison */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Noise Levels by Zone Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={noiseData}>
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
              <Bar dataKey="residential" fill="#10b981" name="Residential" />
              <Bar dataKey="commercial" fill="#3b82f6" name="Commercial" />
              <Bar dataKey="industrial" fill="#f59e0b" name="Industrial" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Location Analysis */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Noise Levels by Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locationData.map((location, index) => (
            <div 
              key={index}
              className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-slate-600" />
                  <h4 className="font-semibold text-slate-900">{location.location}</h4>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(location.status)}`}>
                  {location.status}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Current:</span>
                  <span className="font-medium">{location.current} dB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Limit:</span>
                  <span className="font-medium">{location.limit} dB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Peak Today:</span>
                  <span className="font-medium">{location.peak} dB</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${location.current > location.limit ? 'bg-red-500' : 'bg-purple-500'}`}
                    style={{ width: `${Math.min((location.current / location.limit) * 100, 100)}%` }}
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

export default NoiseMonitoring;