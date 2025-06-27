import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle, AlertCircle, User, MapPin, ArrowRight, Clock, Zap } from 'lucide-react';

interface RecentActivityProps {
  setActiveTab?: (tab: string) => void;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ setActiveTab }) => {
  const [realtimeUpdate, setRealtimeUpdate] = useState(false);

  const activities = [
    {
      id: 1,
      type: 'alert_resolved',
      title: 'Air quality alert resolved',
      location: 'Downtown Hub',
      time: '5 min ago',
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'from-emerald-500 to-green-600',
      bgLight: 'from-emerald-50 to-green-100',
      relatedTab: 'air',
      priority: 'high'
    },
    {
      id: 2,
      type: 'new_report',
      title: 'Citizen reported noise issue',
      location: 'Residential Area',
      time: '12 min ago',
      icon: User,
      color: 'text-blue-600',
      bgColor: 'from-blue-500 to-cyan-600',
      bgLight: 'from-blue-50 to-cyan-100',
      relatedTab: 'reports',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'sensor_maintenance',
      title: 'Sensor maintenance completed',
      location: 'Industrial Zone',
      time: '28 min ago',
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'from-purple-500 to-indigo-600',
      bgLight: 'from-purple-50 to-indigo-100',
      relatedTab: 'iot',
      priority: 'low'
    },
    {
      id: 4,
      type: 'new_alert',
      title: 'Water quality threshold exceeded',
      location: 'Harbor District',
      time: '45 min ago',
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'from-orange-500 to-red-600',
      bgLight: 'from-orange-50 to-red-100',
      relatedTab: 'water',
      priority: 'high'
    }
  ];

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setRealtimeUpdate(true);
      setTimeout(() => setRealtimeUpdate(false), 1000);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const handleViewActivityLog = () => {
    if (setActiveTab) {
      setActiveTab('security');
    }
  };

  const handleActivityClick = (activity: any) => {
    if (setActiveTab && activity.relatedTab) {
      setActiveTab(activity.relatedTab);
    }
  };

  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500 animate-pulse';
      case 'medium':
        return 'bg-amber-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="card-premium rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-gray-100">Recent Activity</h2>
        </div>
        <div className="flex items-center space-x-2">
          {realtimeUpdate && (
            <div className="flex items-center space-x-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
              <Zap className="w-3 h-3" />
              <span>Live Update</span>
            </div>
          )}
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <div 
              key={activity.id} 
              className={`relative bg-gradient-to-br ${activity.bgLight} dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 border border-slate-200 dark:border-gray-600 cursor-pointer hover:shadow-xl transition-all duration-500 group overflow-hidden card-hover slide-in-up`}
              onClick={() => handleActivityClick(activity)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Animated Background */}
              <div className={`absolute inset-0 bg-gradient-to-r ${activity.bgColor} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
              
              {/* Priority Indicator */}
              <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${getPriorityIndicator(activity.priority)}`}></div>
              
              <div className="relative z-10 flex items-start space-x-4">
                <div className={`p-3 bg-gradient-to-r ${activity.bgColor} rounded-xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-500 hover-glow`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-slate-900 dark:text-gray-100 group-hover:text-slate-700 dark:group-hover:text-gray-300 transition-colors duration-300 mb-2">
                    {activity.title}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-slate-600 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm font-medium">{activity.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">{activity.time}</span>
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

      <button 
        onClick={handleViewActivityLog}
        className="w-full mt-6 flex items-center justify-center space-x-3 text-lg font-bold py-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:shadow-xl transition-all duration-500 group hover:scale-105 btn-premium"
      >
        <span>View Activity Log</span>
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
      </button>
    </div>
  );
};

export default RecentActivity;