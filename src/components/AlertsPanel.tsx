import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, MapPin, Filter } from 'lucide-react';

const AlertsPanel: React.FC = () => {
  const [filter, setFilter] = useState('all');

  const alerts = [
    {
      id: 1,
      type: 'air',
      severity: 'high',
      title: 'High PM2.5 Concentration Detected',
      description: 'PM2.5 levels have exceeded safe thresholds in the Industrial Zone area.',
      location: 'Industrial Zone - Sector 7',
      timestamp: '2024-01-15T14:30:00Z',
      value: '87 μg/m³',
      threshold: '35 μg/m³',
      status: 'active',
      predictions: 'Levels expected to remain high for next 2-3 hours'
    },
    {
      id: 2,
      type: 'noise',
      severity: 'high',
      title: 'Excessive Noise Pollution',
      description: 'Noise levels consistently above acceptable limits near residential areas.',
      location: 'Highway Junction - North Sector',
      timestamp: '2024-01-15T13:45:00Z',
      value: '95 dB',
      threshold: '70 dB',
      status: 'active',
      predictions: 'Expected to decrease after evening rush hour'
    },
    {
      id: 3,
      type: 'water',
      severity: 'medium',
      title: 'pH Level Fluctuation',
      description: 'Water pH levels showing unusual fluctuations outside normal range.',
      location: 'Harbor District - Monitoring Station 3',
      timestamp: '2024-01-15T12:15:00Z',
      value: 'pH 6.2',
      threshold: 'pH 6.5-8.5',
      status: 'monitoring',
      predictions: 'Stabilization expected within 4-6 hours'
    },
    {
      id: 4,
      type: 'air',
      severity: 'low',
      title: 'Minor Air Quality Degradation',
      description: 'Slight increase in nitrogen dioxide levels detected.',
      location: 'Downtown Hub - Central Plaza',
      timestamp: '2024-01-15T11:00:00Z',
      value: '42 ppb',
      threshold: '40 ppb',
      status: 'resolved',
      predictions: 'Normal levels restored'
    },
    {
      id: 5,
      type: 'noise',
      severity: 'medium',
      title: 'Construction Noise Violation',
      description: 'Construction activities exceeding permitted noise levels.',
      location: 'Residential Area - Block C',
      timestamp: '2024-01-15T10:30:00Z',
      value: '78 dB',
      threshold: '55 dB',
      status: 'investigating',
      predictions: 'Authorities have been notified'
    }
  ];

  const filteredAlerts = filter === 'all' ? alerts : alerts.filter(alert => alert.type === filter);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-amber-200 bg-amber-50';
      case 'low':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getSeverityIcon = (severity: string) => {
    const baseClasses = "w-5 h-5";
    switch (severity) {
      case 'high':
        return <AlertTriangle className={`${baseClasses} text-red-600`} />;
      case 'medium':
        return <AlertTriangle className={`${baseClasses} text-amber-600`} />;
      case 'low':
        return <AlertTriangle className={`${baseClasses} text-blue-600`} />;
      default:
        return <AlertTriangle className={`${baseClasses} text-gray-600`} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'monitoring':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'investigating':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    // You can import and use appropriate icons here
    return '🔍';
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ago`;
    }
    return `${minutes}m ago`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-700 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Environmental Alerts</h1>
        </div>
        <p className="text-red-100 text-lg">
          Real-time alerts and notifications for environmental threshold violations and anomalies.
        </p>
      </div>

      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Total Alerts</h3>
          <p className="text-3xl font-bold text-slate-900">{alerts.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">High Priority</h3>
          <p className="text-3xl font-bold text-red-600">{alerts.filter(a => a.severity === 'high').length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Active</h3>
          <p className="text-3xl font-bold text-amber-600">{alerts.filter(a => a.status === 'active').length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Resolved</h3>
          <p className="text-3xl font-bold text-emerald-600">{alerts.filter(a => a.status === 'resolved').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-slate-600" />
          <span className="font-medium text-slate-900">Filter by type:</span>
          <div className="flex space-x-2">
            {['all', 'air', 'water', 'noise'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  filter === type
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 ${getSeverityColor(alert.severity)}`}
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 p-2 bg-white rounded-lg shadow-sm">
                {getSeverityIcon(alert.severity)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-slate-900">{alert.title}</h3>
                  <span className={`px-3 py-1 text-sm font-medium border rounded-full ${getStatusColor(alert.status)}`}>
                    {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                  </span>
                </div>
                
                <p className="text-slate-700 mb-4">{alert.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-600">Location:</span>
                      <span className="font-medium text-slate-900">{alert.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-600">Time:</span>
                      <span className="font-medium text-slate-900">{formatTime(alert.timestamp)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-slate-600">Current Value:</span>
                      <span className="font-bold text-slate-900 ml-2">{alert.value}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-slate-600">Threshold:</span>
                      <span className="font-medium text-slate-700 ml-2">{alert.threshold}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/50 rounded-lg p-3 border border-white/20">
                  <h4 className="font-medium text-slate-900 mb-1">AI Prediction:</h4>
                  <p className="text-sm text-slate-700">{alert.predictions}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsPanel;