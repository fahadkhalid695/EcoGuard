import React from 'react';
import { Droplets, ThermometerSun, Zap, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const WaterQuality: React.FC = () => {
  const waterQualityData = [
    { time: '00:00', pH: 7.2, turbidity: 2.1, dissolved_oxygen: 8.5, temperature: 18.5 },
    { time: '04:00', pH: 7.3, turbidity: 1.8, dissolved_oxygen: 8.7, temperature: 17.8 },
    { time: '08:00', pH: 7.1, turbidity: 2.5, dissolved_oxygen: 8.2, temperature: 19.2 },
    { time: '12:00', pH: 7.0, turbidity: 3.1, dissolved_oxygen: 7.9, temperature: 21.1 },
    { time: '16:00', pH: 7.2, turbidity: 2.8, dissolved_oxygen: 8.1, temperature: 22.3 },
    { time: '20:00', pH: 7.4, turbidity: 2.2, dissolved_oxygen: 8.4, temperature: 20.5 },
  ];

  const parameters = [
    { 
      name: 'pH Level', 
      value: 7.2, 
      unit: 'pH', 
      range: '6.5-8.5', 
      status: 'good',
      icon: Zap,
      description: 'Measure of water acidity/alkalinity'
    },
    { 
      name: 'Turbidity', 
      value: 2.1, 
      unit: 'NTU', 
      range: '0-4', 
      status: 'good',
      icon: Droplets,
      description: 'Water clarity measurement'
    },
    { 
      name: 'Dissolved Oxygen', 
      value: 8.5, 
      unit: 'mg/L', 
      range: '>5', 
      status: 'excellent',
      icon: AlertCircle,
      description: 'Oxygen content in water'
    },
    { 
      name: 'Temperature', 
      value: 18.5, 
      unit: '°C', 
      range: '15-25', 
      status: 'good',
      icon: ThermometerSun,
      description: 'Water temperature'
    }
  ];

  const contaminants = [
    { name: 'E. coli', value: 0, limit: 0, unit: 'CFU/100mL', status: 'excellent' },
    { name: 'Chlorine', value: 0.5, limit: 4, unit: 'mg/L', status: 'good' },
    { name: 'Lead', value: 2, limit: 15, unit: 'ppb', status: 'good' },
    { name: 'Nitrates', value: 3.2, limit: 10, unit: 'mg/L', status: 'good' },
    { name: 'Fluoride', value: 0.8, limit: 4, unit: 'mg/L', status: 'good' },
    { name: 'Copper', value: 0.1, limit: 1.3, unit: 'mg/L', status: 'excellent' },
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-700 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Droplets className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Water Quality Monitoring</h1>
        </div>
        <p className="text-blue-100 text-lg">
          Comprehensive water quality analysis and contamination detection across water sources.
        </p>
      </div>

      {/* Water Quality Score */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Overall Water Quality Score</h2>
          <div className="text-6xl font-bold text-emerald-600 mb-4">87</div>
          <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-800 text-lg font-semibold rounded-full">
            Excellent Quality
          </span>
          <p className="text-slate-600 mt-4 max-w-2xl mx-auto">
            Water quality is excellent across all monitored parameters. Safe for consumption and recreational activities.
          </p>
        </div>
      </div>

      {/* Key Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {parameters.map((param, index) => {
          const Icon = param.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900">{param.name}</h3>
              </div>
              <div className="space-y-3">
                <div className="text-2xl font-bold text-slate-900">
                  {param.value} <span className="text-lg font-normal text-slate-600">{param.unit}</span>
                </div>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(param.status)}`}>
                  {param.status.charAt(0).toUpperCase() + param.status.slice(1)}
                </span>
                <p className="text-sm text-slate-600">{param.description}</p>
                <p className="text-xs text-slate-500">Range: {param.range}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* pH and Temperature Trends */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">pH Level & Temperature Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={waterQualityData}>
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
                dataKey="pH" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                name="pH Level"
              />
              <Line 
                type="monotone" 
                dataKey="temperature" 
                stroke="#f59e0b" 
                strokeWidth={3}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                name="Temperature (°C)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Dissolved Oxygen and Turbidity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Dissolved Oxygen & Turbidity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={waterQualityData}>
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
              <Area 
                type="monotone" 
                dataKey="dissolved_oxygen" 
                stackId="1"
                stroke="#10b981" 
                fill="#10b981"
                fillOpacity={0.3}
                name="Dissolved Oxygen (mg/L)"
              />
              <Area 
                type="monotone" 
                dataKey="turbidity" 
                stackId="2"
                stroke="#8b5cf6" 
                fill="#8b5cf6"
                fillOpacity={0.3}
                name="Turbidity (NTU)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Contaminants Analysis */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Contaminant Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contaminants.map((contaminant, index) => (
            <div 
              key={index}
              className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-900">{contaminant.name}</h4>
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(contaminant.status)}`}>
                  {contaminant.status}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Current:</span>
                  <span className="font-medium">{contaminant.value} {contaminant.unit}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Limit:</span>
                  <span className="font-medium">{contaminant.limit} {contaminant.unit}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${contaminant.value > contaminant.limit ? 'bg-red-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min((contaminant.value / contaminant.limit) * 100, 100)}%` }}
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

export default WaterQuality;