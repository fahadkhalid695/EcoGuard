import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, Zap, Target, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { aiService } from '../services/aiService';
import { sensorService } from '../services/sensorService';
import { AIModel, Prediction } from '../types/sensor';

const AIAnalytics: React.FC = () => {
  const [models, setModels] = useState<AIModel[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [aiStats, setAiStats] = useState<any>({});

  useEffect(() => {
    loadAIData();
    const interval = setInterval(loadAIData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadAIData = () => {
    setModels(aiService.getAllModels());
    setPredictions(aiService.getPredictions());
    setAiStats(aiService.getModelStatistics());
    
    // Generate some predictions for demonstration
    const sensors = sensorService.getAllSensors();
    sensors.forEach(sensor => {
      const readings = sensorService.getRecentReadings(sensor.id, 50);
      if (readings.length > 10) {
        // Generate maintenance prediction
        aiService.predictMaintenanceNeeds(sensor, readings);
        
        // Detect anomalies
        aiService.detectAnomalies(readings);
        
        // Recognize patterns
        aiService.recognizePatterns(readings);
      }
    });
  };

  const getModelIcon = (type: string) => {
    switch (type) {
      case 'predictive_maintenance':
        return <Target className="w-5 h-5" />;
      case 'anomaly_detection':
        return <AlertTriangle className="w-5 h-5" />;
      case 'pattern_recognition':
        return <BarChart3 className="w-5 h-5" />;
      case 'optimization':
        return <Zap className="w-5 h-5" />;
      default:
        return <Brain className="w-5 h-5" />;
    }
  };

  const getModelColor = (type: string) => {
    switch (type) {
      case 'predictive_maintenance':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'anomaly_detection':
        return 'bg-red-50 text-red-600 border-red-200';
      case 'pattern_recognition':
        return 'bg-green-50 text-green-600 border-green-200';
      case 'optimization':
        return 'bg-purple-50 text-purple-600 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getPredictionsByType = (type: string) => {
    return predictions.filter(p => p.type === type);
  };

  const modelPerformanceData = models.map(model => ({
    name: model.name.split(' ')[0],
    accuracy: Math.round(model.accuracy * 100),
    predictions: predictions.filter(p => p.modelId === model.id).length
  }));

  const predictionTrendData = [
    { time: '00:00', maintenance: 2, anomalies: 1, patterns: 5, optimization: 3 },
    { time: '04:00', maintenance: 1, anomalies: 0, patterns: 4, optimization: 2 },
    { time: '08:00', maintenance: 3, anomalies: 2, patterns: 8, optimization: 5 },
    { time: '12:00', maintenance: 4, anomalies: 3, patterns: 12, optimization: 7 },
    { time: '16:00', maintenance: 2, anomalies: 1, patterns: 9, optimization: 4 },
    { time: '20:00', maintenance: 1, anomalies: 0, patterns: 6, optimization: 3 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="w-8 h-8" />
          <h1 className="text-3xl font-bold">AI Analytics & Machine Learning</h1>
        </div>
        <p className="text-purple-100 text-lg">
          Advanced AI models providing predictive insights, anomaly detection, and intelligent optimization.
        </p>
      </div>

      {/* AI Model Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Active Models</h3>
          <p className="text-3xl font-bold text-slate-900">{aiStats.activeModels || 0}</p>
          <p className="text-sm text-slate-600">Running continuously</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Average Accuracy</h3>
          <p className="text-3xl font-bold text-slate-900">{aiStats.averageAccuracy || 0}%</p>
          <p className="text-sm text-slate-600">Model performance</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Total Predictions</h3>
          <p className="text-3xl font-bold text-slate-900">{aiStats.totalPredictions || 0}</p>
          <p className="text-sm text-slate-600">Generated today</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Valid Predictions</h3>
          <p className="text-3xl font-bold text-slate-900">{aiStats.validPredictions || 0}</p>
          <p className="text-sm text-slate-600">Currently active</p>
        </div>
      </div>

      {/* AI Models Grid */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">AI Models</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {models.map((model) => (
            <div
              key={model.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedModel === model.id ? 'ring-2 ring-purple-500 border-purple-200' : 'border-slate-200'
              }`}
              onClick={() => setSelectedModel(model.id)}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className={`p-2 rounded-lg ${getModelColor(model.type)}`}>
                  {getModelIcon(model.type)}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{model.name}</h4>
                  <p className="text-sm text-slate-600 capitalize">{model.type.replace('_', ' ')}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium border rounded-full ${
                  model.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  model.status === 'training' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-gray-50 text-gray-700 border-gray-200'
                }`}>
                  {model.status}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Accuracy:</span>
                  <span className="font-medium">{Math.round(model.accuracy * 100)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Last Training:</span>
                  <span className="font-medium">{model.lastTraining.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Predictions:</span>
                  <span className="font-medium">{predictions.filter(p => p.modelId === model.id).length}</span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${model.accuracy * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Model Performance */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Model Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={modelPerformanceData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Accuracy"
                dataKey="accuracy"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Prediction Trends */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Prediction Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={predictionTrendData}>
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
              <Area type="monotone" dataKey="maintenance" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              <Area type="monotone" dataKey="anomalies" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
              <Area type="monotone" dataKey="patterns" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              <Area type="monotone" dataKey="optimization" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Predictions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Recent AI Predictions</h3>
        <div className="space-y-4">
          {predictions.slice(0, 10).map((prediction, index) => (
            <div key={index} className="p-4 border border-slate-200 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getModelColor(prediction.type)}`}>
                    {getModelIcon(prediction.type)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 capitalize">
                      {prediction.type.replace('_', ' ')} Prediction
                    </h4>
                    <p className="text-sm text-slate-600">
                      Sensor: {prediction.sensorId} • Confidence: {Math.round(prediction.confidence * 100)}%
                    </p>
                  </div>
                </div>
                <span className="text-xs text-slate-500">
                  {prediction.timestamp.toLocaleTimeString()}
                </span>
              </div>

              <div className="bg-slate-50 rounded-lg p-3">
                <pre className="text-sm text-slate-700 whitespace-pre-wrap">
                  {JSON.stringify(prediction.prediction, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prediction Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <Target className="w-6 h-6 text-blue-600" />
            <h3 className="font-semibold text-slate-900">Maintenance</h3>
          </div>
          <p className="text-2xl font-bold text-slate-900 mb-2">
            {getPredictionsByType('maintenance').length}
          </p>
          <p className="text-sm text-slate-600">Active predictions</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h3 className="font-semibold text-slate-900">Anomalies</h3>
          </div>
          <p className="text-2xl font-bold text-slate-900 mb-2">
            {getPredictionsByType('anomaly').length}
          </p>
          <p className="text-sm text-slate-600">Detected today</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <BarChart3 className="w-6 h-6 text-green-600" />
            <h3 className="font-semibold text-slate-900">Patterns</h3>
          </div>
          <p className="text-2xl font-bold text-slate-900 mb-2">
            {getPredictionsByType('pattern').length}
          </p>
          <p className="text-sm text-slate-600">Identified patterns</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <Zap className="w-6 h-6 text-purple-600" />
            <h3 className="font-semibold text-slate-900">Optimizations</h3>
          </div>
          <p className="text-2xl font-bold text-slate-900 mb-2">
            {getPredictionsByType('optimization').length}
          </p>
          <p className="text-sm text-slate-600">Recommendations</p>
        </div>
      </div>
    </div>
  );
};

export default AIAnalytics;