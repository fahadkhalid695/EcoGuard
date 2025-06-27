import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, Clock, Target, Zap, Eye, BarChart3 } from 'lucide-react';

const PredictiveInsights: React.FC = () => {
  const [insights, setInsights] = useState([
    {
      id: 1,
      type: 'prediction',
      title: 'PM2.5 levels likely to rise in 2 hours',
      description: 'AI models predict a 35% increase in particulate matter due to wind pattern changes and increased traffic.',
      confidence: 87,
      timeframe: '2 hours',
      impact: 'Medium',
      icon: TrendingUp,
      color: 'amber',
      gradient: 'from-amber-500 to-orange-600'
    },
    {
      id: 2,
      type: 'optimization',
      title: 'Energy consumption can be reduced by 15%',
      description: 'Optimize HVAC systems in Buildings A-C during low occupancy periods (2-6 AM).',
      confidence: 92,
      timeframe: 'Tonight',
      impact: 'High',
      icon: Zap,
      color: 'emerald',
      gradient: 'from-emerald-500 to-green-600'
    },
    {
      id: 3,
      type: 'maintenance',
      title: 'Sensor calibration needed in 3 days',
      description: 'Temperature sensors in Industrial Zone showing drift patterns. Preventive maintenance recommended.',
      confidence: 94,
      timeframe: '3 days',
      impact: 'Low',
      icon: Target,
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-600'
    },
    {
      id: 4,
      type: 'anomaly',
      title: 'Unusual water quality pattern detected',
      description: 'pH levels in Harbor District showing irregular fluctuations. Investigation recommended.',
      confidence: 78,
      timeframe: 'Now',
      impact: 'Medium',
      icon: AlertTriangle,
      color: 'red',
      gradient: 'from-red-500 to-orange-600'
    }
  ]);

  const [selectedInsight, setSelectedInsight] = useState<number | null>(null);

  useEffect(() => {
    // Simulate real-time insight updates
    const interval = setInterval(() => {
      setInsights(prev => prev.map(insight => ({
        ...insight,
        confidence: Math.max(70, Math.min(99, insight.confidence + (Math.random() - 0.5) * 4))
      })));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Low':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-emerald-600';
    if (confidence >= 80) return 'text-blue-600';
    if (confidence >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="card-premium rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl pulse-glow">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-gray-100">Predictive Insights</h2>
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-gray-400">
          <Eye className="w-4 h-4" />
          <span>AI-powered predictions</span>
        </div>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          const isSelected = selectedInsight === insight.id;
          
          return (
            <div
              key={insight.id}
              className={`relative bg-gradient-to-br from-${insight.color}-50 to-${insight.color}-100 dark:from-${insight.color}-900/20 dark:to-${insight.color}-800/20 rounded-xl p-4 border border-${insight.color}-200 dark:border-${insight.color}-700 cursor-pointer transition-all duration-500 hover:shadow-xl group card-hover slide-in-up ${
                isSelected ? 'ring-2 ring-purple-500 scale-105' : ''
              }`}
              onClick={() => setSelectedInsight(isSelected ? null : insight.id)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Animated Background */}
              <div className={`absolute inset-0 bg-gradient-to-r ${insight.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-xl`}></div>
              
              <div className="relative z-10">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 bg-gradient-to-r ${insight.gradient} rounded-xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-500 hover-glow`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-gray-100 group-hover:text-slate-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                        {insight.title}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium border rounded-full ${getImpactColor(insight.impact)}`}>
                          {insight.impact} Impact
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-slate-700 dark:text-gray-300 mb-4 leading-relaxed">{insight.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-slate-500 dark:text-gray-400" />
                          <span className="text-sm font-medium text-slate-600 dark:text-gray-400">{insight.timeframe}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="w-4 h-4 text-slate-500 dark:text-gray-400" />
                          <span className={`text-sm font-bold ${getConfidenceColor(insight.confidence)}`}>
                            {Math.round(insight.confidence)}% confidence
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Confidence Bar */}
                    <div className="mt-3 w-full bg-slate-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className={`h-2 bg-gradient-to-r ${insight.gradient} rounded-full transition-all duration-1000 shadow-glow`}
                        style={{ width: `${insight.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-gray-600 slide-in-up">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-3">
                        <h5 className="font-semibold text-slate-900 dark:text-gray-100 mb-1">Recommended Action</h5>
                        <p className="text-sm text-slate-700 dark:text-gray-300">
                          {insight.type === 'prediction' && 'Monitor closely and prepare mitigation measures'}
                          {insight.type === 'optimization' && 'Implement suggested optimizations immediately'}
                          {insight.type === 'maintenance' && 'Schedule maintenance within recommended timeframe'}
                          {insight.type === 'anomaly' && 'Investigate root cause and implement corrective measures'}
                        </p>
                      </div>
                      
                      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-3">
                        <h5 className="font-semibold text-slate-900 dark:text-gray-100 mb-1">Data Sources</h5>
                        <p className="text-sm text-slate-700 dark:text-gray-300">
                          Historical patterns, weather data, sensor readings, traffic patterns
                        </p>
                      </div>
                      
                      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-3">
                        <h5 className="font-semibold text-slate-900 dark:text-gray-100 mb-1">Model Used</h5>
                        <p className="text-sm text-slate-700 dark:text-gray-300">
                          {insight.type === 'prediction' && 'Time Series Forecasting'}
                          {insight.type === 'optimization' && 'Energy Optimization Model'}
                          {insight.type === 'maintenance' && 'Predictive Maintenance AI'}
                          {insight.type === 'anomaly' && 'Anomaly Detection Neural Network'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-xl"></div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {insights.filter(i => i.type === 'prediction').length}
            </div>
            <div className="text-sm text-slate-600 dark:text-gray-400">Predictions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {insights.filter(i => i.type === 'optimization').length}
            </div>
            <div className="text-sm text-slate-600 dark:text-gray-400">Optimizations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {Math.round(insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length)}%
            </div>
            <div className="text-sm text-slate-600 dark:text-gray-400">Avg Confidence</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {insights.filter(i => i.impact === 'High').length}
            </div>
            <div className="text-sm text-slate-600 dark:text-gray-400">High Impact</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictiveInsights;