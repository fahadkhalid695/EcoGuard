import React from 'react';
import { TrendingUp, Brain, AlertTriangle, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

const PredictiveAnalytics: React.FC = () => {
  const predictionData = [
    { time: 'Now', actual: 42, predicted: 42, confidence: 95 },
    { time: '+1h', actual: null, predicted: 48, confidence: 92 },
    { time: '+2h', actual: null, predicted: 56, confidence: 88 },
    { time: '+3h', actual: null, predicted: 62, confidence: 85 },
    { time: '+4h', actual: null, predicted: 58, confidence: 82 },
    { time: '+5h', actual: null, predicted: 51, confidence: 78 },
    { time: '+6h', actual: null, predicted: 45, confidence: 75 },
  ];

  const riskData = [
    { location: 'Industrial Zone', airQuality: 85, waterQuality: 15, noisePollution: 90, overallRisk: 'high' },
    { location: 'Highway Junction', airQuality: 70, waterQuality: 25, noisePollution: 95, overallRisk: 'high' },
    { location: 'Downtown Hub', airQuality: 60, waterQuality: 35, noisePollution: 75, overallRisk: 'medium' },
    { location: 'Residential Area', airQuality: 45, waterQuality: 20, noisePollution: 55, overallRisk: 'medium' },
    { location: 'Harbor District', airQuality: 55, waterQuality: 45, noisePollution: 65, overallRisk: 'medium' },
    { location: 'Park Area', airQuality: 25, waterQuality: 10, noisePollution: 35, overallRisk: 'low' },
  ];

  const trends = [
    { day: 'Mon', airQuality: 45, waterQuality: 82, noisePollution: 58 },
    { day: 'Tue', airQuality: 52, waterQuality: 85, noisePollution: 62 },
    { day: 'Wed', airQuality: 48, waterQuality: 79, noisePollution: 55 },
    { day: 'Thu', airQuality: 61, waterQuality: 88, noisePollution: 68 },
    { day: 'Fri', airQuality: 58, waterQuality: 86, noisePollution: 72 },
    { day: 'Sat', airQuality: 42, waterQuality: 91, noisePollution: 45 },
    { day: 'Sun', airQuality: 38, waterQuality: 89, noisePollution: 41 },
  ];

  const insights = [
    {
      title: 'Air Quality Improvement',
      description: 'Air quality is predicted to improve by 15% over the next 6 hours due to favorable wind conditions.',
      type: 'positive',
      confidence: 87,
      impact: 'High'
    },
    {
      title: 'Noise Spike Expected',
      description: 'Noise levels may increase during evening rush hour, particularly around highway junctions.',
      type: 'warning',
      confidence: 92,
      impact: 'Medium'
    },
    {
      title: 'Water Quality Alert',
      description: 'Potential pH fluctuation predicted in harbor district due to tidal changes.',
      type: 'alert',
      confidence: 78,
      impact: 'Low'
    },
    {
      title: 'Weekend Improvement',
      description: 'Overall environmental conditions expected to improve significantly over the weekend.',
      type: 'positive',
      confidence: 94,
      impact: 'High'
    }
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'medium':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'low':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive':
        return 'border-emerald-200 bg-emerald-50 text-emerald-800';
      case 'warning':
        return 'border-amber-200 bg-amber-50 text-amber-800';
      case 'alert':
        return 'border-red-200 bg-red-50 text-red-800';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <TrendingUp className="w-5 h-5 text-emerald-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <BarChart3 className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="w-8 h-8" />
          <h1 className="text-3xl font-bold">AI Predictive Analytics</h1>
        </div>
        <p className="text-indigo-100 text-lg">
          Advanced machine learning models providing environmental forecasting and intelligent insights.
        </p>
      </div>

      {/* Prediction Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Next Hour Forecast</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Air Quality:</span>
              <span className="font-bold text-amber-600">48 AQI</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Water Quality:</span>
              <span className="font-bold text-blue-600">85/100</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Noise Level:</span>
              <span className="font-bold text-purple-600">62 dB</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Model Confidence</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Short-term (1-3h):</span>
              <span className="font-bold text-emerald-600">92%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Medium-term (4-6h):</span>
              <span className="font-bold text-amber-600">78%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Long-term (12h+):</span>
              <span className="font-bold text-slate-600">65%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Active Predictions</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Air Quality:</span>
              <span className="text-sm bg-amber-100 text-amber-800 px-2 py-1 rounded-full">Moderate Risk</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Water Quality:</span>
              <span className="text-sm bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">Stable</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Noise Levels:</span>
              <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full">Increasing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Prediction Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Air Quality Prediction */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">6-Hour Air Quality Prediction</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={predictionData}>
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
                dataKey="predicted" 
                stroke="#6366f1" 
                fill="#6366f1"
                fillOpacity={0.3}
                name="Predicted AQI"
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#ef4444" 
                strokeWidth={3}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                name="Actual AQI"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Trends */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Weekly Environmental Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" stroke="#64748b" />
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
                dataKey="airQuality" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Air Quality"
              />
              <Line 
                type="monotone" 
                dataKey="waterQuality" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Water Quality"
              />
              <Line 
                type="monotone" 
                dataKey="noisePollution" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                name="Noise Pollution"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Environmental Risk Assessment by Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {riskData.map((location, index) => (
            <div key={index} className="p-4 border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-900">{location.location}</h4>
                <span className={`px-2 py-1 text-xs font-medium border rounded-full ${getRiskColor(location.overallRisk)}`}>
                  {location.overallRisk.charAt(0).toUpperCase() + location.overallRisk.slice(1)} Risk
                </span>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Air Quality Risk</span>
                    <span>{location.airQuality}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${location.airQuality}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Water Quality Risk</span>
                    <span>{location.waterQuality}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${location.waterQuality}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Noise Pollution Risk</span>
                    <span>{location.noisePollution}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${location.noisePollution}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">AI-Generated Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights.map((insight, index) => (
            <div 
              key={index}
              className={`p-4 border rounded-lg ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 p-2 bg-white rounded-lg">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">{insight.title}</h4>
                  <p className="text-sm opacity-90 mb-3">{insight.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span>Confidence: {insight.confidence}%</span>
                    <span>Impact: {insight.impact}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PredictiveAnalytics;