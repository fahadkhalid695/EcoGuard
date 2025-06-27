import React, { useState, useEffect } from 'react';
import { AlertTriangle, Wind, Volume2, Droplets, Clock, ArrowRight, Zap, Bell, X } from 'lucide-react';

interface AlertsListProps {
  setActiveTab?: (tab: string) => void;
}

const AlertsList: React.FC<AlertsListProps> = ({ setActiveTab }) => {
  const [dismissedAlerts, setDismissedAlerts] = useState<number[]>([]);
  const [newAlertAnimation, setNewAlertAnimation] = useState<number | null>(null);

  const alerts = [
    {
      id: 1,
      type: 'air',
      severity: 'high',
      title: 'High PM2.5 Levels',
      location: 'Industrial Zone',
      time: '15 min ago',
      value: '87 μg/m³',
      icon: Wind,
      gradient: 'from-red-500 to-orange-600',
      priority: 1
    },
    {
      id: 2,
      type: 'noise',
      severity: 'medium',
      title: 'Noise Pollution',
      location: 'Highway Junction',
      time: '32 min ago',
      value: '95 dB',
      icon: Volume2,
      gradient: 'from-amber-500 to-orange-600',
      priority: 2
    },
    {
      id: 3,
      type: 'water',
      severity: 'low',
      title: 'Water pH Anomaly',
      location: 'Harbor District',
      time: '1 hour ago',
      value: 'pH 6.2',
      icon: Droplets,
      gradient: 'from-blue-500 to-cyan-600',
      priority: 3
    }
  ];

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.includes(alert.id));

  useEffect(() => {
    // Simulate new alert animation
    const timer = setTimeout(() => {
      setNewAlertAnimation(1);
      setTimeout(() => setNewAlertAnimation(null), 2000);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'from-red-50 to-orange-100 border-red-200 dark:from-red-900/20 dark:to-orange-900/20 dark:border-red-700';
      case 'medium':
        return 'from-amber-50 to-yellow-100 border-amber-200 dark:from-amber-900/20 dark:to-yellow-900/20 dark:border-amber-700';
      case 'low':
        return 'from-blue-50 to-cyan-100 border-blue-200 dark:from-blue-900/20 dark:to-cyan-900/20 dark:border-blue-700';
      default:
        return 'from-gray-50 to-slate-100 border-gray-200 dark:from-gray-800 dark:to-gray-700 dark:border-gray-600';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-lg shadow-red-500/30';
      case 'medium':
        return 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-lg shadow-amber-500/30';
      case 'low':
        return 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/30';
      default:
        return 'bg-gradient-to-r from-gray-500 to-slate-600 text-white shadow-lg shadow-gray-500/30';
    }
  };

  const handleViewAllAlerts = () => {
    if (setActiveTab) {
      setActiveTab('alerts');
    }
  };

  const handleDismissAlert = (alertId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setDismissedAlerts(prev => [...prev, alertId]);
  };

  return (
    <div className="card-premium rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-red-500 to-orange-600 rounded-xl pulse-glow">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-gray-100">Active Alerts</h2>
        </div>
        <div className="flex items-center space-x-3">
          <span className="bg-gradient-to-r from-red-500 to-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
            {visibleAlerts.length} Active
          </span>
          <Bell className="w-4 h-4 text-amber-500 breathe" />
        </div>
      </div>

      <div className="space-y-4">
        {visibleAlerts.map((alert, index) => {
          const Icon = alert.icon;
          const isNewAlert = newAlertAnimation === alert.id;
          
          return (
            <div
              key={alert.id}
              className={`relative bg-gradient-to-br ${getSeverityColor(alert.severity)} rounded-xl p-4 border hover:shadow-xl transition-all duration-500 cursor-pointer group overflow-hidden card-hover slide-in-up ${
                isNewAlert ? 'animate-pulse ring-2 ring-red-400' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Animated Background */}
              <div className={`absolute inset-0 bg-gradient-to-r ${alert.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
              
              {/* Priority Indicator */}
              <div className={`absolute top-2 left-2 w-2 h-2 rounded-full ${
                alert.severity === 'high' ? 'bg-red-500' : 
                alert.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
              } animate-pulse`}></div>
              
              <div className="relative z-10 flex items-start space-x-4">
                <div className={`p-3 bg-gradient-to-r ${alert.gradient} rounded-xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-500 hover-glow`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-gray-100 group-hover:text-slate-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                      {alert.title}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${getSeverityBadge(alert.severity)}`}>
                        {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                      </span>
                      <button
                        onClick={(e) => handleDismissAlert(alert.id, e)}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 transition-colors duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-slate-600 dark:text-gray-400 mb-3 font-medium">{alert.location}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-lg font-bold text-slate-900 dark:text-gray-100 font-mono">{alert.value}</span>
                      <div className="flex items-center space-x-1 text-slate-500 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">{alert.time}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-gray-300 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </div>
              </div>

              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </div>
          );
        })}
      </div>

      {visibleAlerts.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100 mb-2">All Clear!</h3>
          <p className="text-slate-600 dark:text-gray-400">No active alerts at this time.</p>
        </div>
      )}

      <button 
        onClick={handleViewAllAlerts}
        className="w-full mt-6 flex items-center justify-center space-x-3 text-lg font-bold py-4 btn-premium text-white rounded-xl hover:shadow-xl transition-all duration-500 group hover:scale-105"
      >
        <span>View All Alerts</span>
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
      </button>
    </div>
  );
};

export default AlertsList;