import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, Zap, Target, BarChart3, Cpu, Settings, RefreshCw, Activity, PieChart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';
import { aiService } from '../services/aiService';
import { apiService } from '../services/apiService';
import { sensorService } from '../services/sensorService';
import { AIModel, Prediction } from '../types/sensor';

const AIAnalytics: React.FC = () => {
  const [models, setModels] = useState<AIModel[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [aiStats, setAiStats] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [realTimePredictions, setRealTimePredictions] = useState<any[]>([]);
  const [modelPerformance, setModelPerformance] = useState<any>({});

  useEffect(() => {
    loadAIData();
    const interval = setInterval(loadAIData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadAIData = async () => {
    try {
      setIsLoading(true);
      
      // Load AI models and predictions
      const aiModels = aiService.getModels();
      const aiPredictions = aiService.getPredictions();
      const statistics = aiService.getModelStatistics();
      
      setModels(aiModels);
      setPredictions(aiPredictions);
      setAiStats(statistics);

      // Load real-time predictions from backend
      await loadRealTimePredictions();
      
      // Load model performance metrics
      await loadModelPerformance();
      
    } catch (error) {
      console.error('Error loading AI data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRealTimePredictions = async () => {
    try {
      const response = await apiService.request('/analytics/predictions');
      if (response.predictions) {
        setRealTimePredictions(response.predictions);
      }
    } catch (error) {
      console.error('Error loading real-time predictions:', error);
      // Fallback to mock data
      setRealTimePredictions([]);
    }
  };

  const loadModelPerformance = async () => {
    try {
      // Mock performance data - in production, this would come from model evaluation
      const performance = {
        maintenance: { accuracy: 0.92, precision: 0.89, recall: 0.94, f1Score: 0.91 },
        anomaly: { accuracy: 0.88, precision: 0.85, recall: 0.91, f1Score: 0.88 },
        pattern: { accuracy: 0.85, precision: 0.82, recall: 0.88, f1Score: 0.85 },
        optimization: { accuracy: 0.90, precision: 0.87, recall: 0.93, f1Score: 0.90 }
      };
      setModelPerformance(performance);
    } catch (error) {
      console.error('Error loading model performance:', error);
    }
  };

  const runAIPredictions = async () => {
    try {
      setIsLoading(true);
      const sensors = sensorService.getAllSensors();
      const newPredictions = await aiService.runAllPredictions(sensors);
      setPredictions(newPredictions);
      
      // Also trigger backend predictions
      await loadRealTimePredictions();
      
    } catch (error) {
      console.error('Error running AI predictions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPredictionsByType = () => {
    const types = ['maintenance', 'anomaly', 'pattern', 'optimization'];
    return types.map(type => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: predictions.filter(p => p.type === type).length,
      color: getTypeColor(type)
    }));
  };

  const getTypeColor = (type: string) => {
    const colors = {
      maintenance: '#f59e0b',
      anomaly: '#ef4444',
      pattern: '#3b82f6',
      optimization: '#10b981'
    };
    return colors[type as keyof typeof colors] || '#6b7280';
  };

  const getModelAccuracyData = () => {
    return models.map(model => ({
      name: model.name.replace(' Model', ''),
      accuracy: Math.round(model.accuracy * 100),
      type: model.type
    }));
  };

  const getPredictionTrendData = () => {
    // Generate trend data for the last 7 days
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        maintenance: Math.floor(Math.random() * 10) + 5,
        anomaly: Math.floor(Math.random() * 8) + 2,
        optimization: Math.floor(Math.random() * 6) + 3,
        pattern: Math.floor(Math.random() * 4) + 1
      });
    }
    return days;
  };

  const getHighPriorityPredictions = () => {
    return [...predictions, ...realTimePredictions]
      .filter(p => p.priority === 'high' || p.priority === 'critical')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  };

  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}%`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="w-8 h-8" />
            <div>
              <h1 className="text-3xl font-bold">AI Analytics & Predictions</h1>
              <p className="text-purple-100 text-lg">
                Machine learning insights and predictive analytics for your environmental data
              </p>
            </div>
          </div>
          <button
            onClick={runAIPredictions}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Run Predictions</span>
          </button>
        </div>
      </div>

      {/* AI Models Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {models.map((model) => (
          <div
            key={model.id}
            className={`bg-white rounded-xl p-6 shadow-sm border cursor-pointer transition-all duration-200 ${
              selectedModel === model.id ? 'ring-2 ring-purple-500 border-purple-200' : 'border-slate-200 hover:shadow-md'
            }`}
            onClick={() => setSelectedModel(selectedModel === model.id ? null : model.id)}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Cpu className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">{model.name}</h3>
                <p className="text-xs text-slate-600 capitalize">{model.type.replace('_', ' ')}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Accuracy:</span>
                <span className="font-medium text-emerald-600">{formatConfidence(model.accuracy)}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Status:</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  model.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {model.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Last Training:</span>
                <span className="font-medium text-xs">
                  {new Date(model.lastTraining).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Accuracy Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${model.accuracy * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Model Performance Comparison */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Model Performance Comparison</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getModelAccuracyData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => [`${value}%`, 'Accuracy']} />
              <Bar dataKey="accuracy" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Predictions Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Predictions by Type */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Predictions by Type</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={getPredictionsByType()}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {getPredictionsByType().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Prediction Trends */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Prediction Trends (7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getPredictionTrendData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="maintenance" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                <Area type="monotone" dataKey="anomaly" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                <Area type="monotone" dataKey="optimization" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="pattern" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* High Priority Predictions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">High Priority Predictions</h3>
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <AlertTriangle className="w-4 h-4" />
            <span>{getHighPriorityPredictions().length} critical items</span>
          </div>
        </div>

        <div className="space-y-4">
          {getHighPriorityPredictions().length > 0 ? (
            getHighPriorityPredictions().map((prediction, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg">
                <div className="flex-shrink-0">
                  {prediction.type === 'maintenance' && <Settings className="w-5 h-5 text-orange-600" />}
                  {prediction.type === 'anomaly' && <AlertTriangle className="w-5 h-5 text-red-600" />}
                  {prediction.type === 'pattern' && <TrendingUp className="w-5 h-5 text-blue-600" />}
                  {prediction.type === 'optimization' && <Zap className="w-5 h-5 text-green-600" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-slate-900">{prediction.sensorName || 'System'}</h4>
                    <span className={`px-2 py-1 text-xs font-medium border rounded-full ${getPriorityColor(prediction.priority)}`}>
                      {prediction.priority}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-600 mb-2">
                    {prediction.prediction?.message || prediction.prediction?.description || 'No description available'}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs text-slate-500">
                    <span>Confidence: {formatConfidence(prediction.confidence)}</span>
                    <span>Type: {prediction.type}</span>
                    <span>{new Date(prediction.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No high priority predictions at this time</p>
              <p className="text-sm">Run AI predictions to generate new insights</p>
            </div>
          )}
        </div>
      </div>

      {/* AI System Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-900">System Health</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Active Models:</span>
              <span className="font-medium">{aiStats.activeModels || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Avg Accuracy:</span>
              <span className="font-medium text-emerald-600">{Math.round((aiStats.averageAccuracy || 0) * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Total Predictions:</span>
              <span className="font-medium">{predictions.length + realTimePredictions.length}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Prediction Accuracy</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(modelPerformance).map(([model, perf]: [string, any]) => (
              <div key={model} className="flex justify-between">
                <span className="text-slate-600 capitalize">{model}:</span>
                <span className="font-medium">{Math.round((perf.accuracy || 0) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Last Training:</span>
              <span className="font-medium text-sm">
                {aiStats.lastTraining ? new Date(aiStats.lastTraining).toLocaleDateString() : 'Never'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Predictions Today:</span>
              <span className="font-medium">{Math.floor(Math.random() * 50) + 10}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Model Updates:</span>
              <span className="font-medium">3 pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Model Details */}
      {selectedModel && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">
            Model Details: {models.find(m => m.id === selectedModel)?.name}
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-slate-900 mb-4">Performance Metrics</h4>
              <div className="space-y-3">
                {selectedModel && modelPerformance[selectedModel.split('-')[0]] && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Accuracy:</span>
                      <span className="font-medium">{Math.round(modelPerformance[selectedModel.split('-')[0]].accuracy * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Precision:</span>
                      <span className="font-medium">{Math.round(modelPerformance[selectedModel.split('-')[0]].precision * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Recall:</span>
                      <span className="font-medium">{Math.round(modelPerformance[selectedModel.split('-')[0]].recall * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">F1 Score:</span>
                      <span className="font-medium">{Math.round(modelPerformance[selectedModel.split('-')[0]].f1Score * 100)}%</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-slate-900 mb-4">Recent Predictions</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {predictions
                  .filter(p => p.modelId === selectedModel)
                  .slice(0, 5)
                  .map((prediction, index) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium">{prediction.type}</span>
                        <span className="text-xs text-slate-500">
                          {formatConfidence(prediction.confidence)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        {new Date(prediction.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalytics;