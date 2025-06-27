import React, { useState, useEffect } from 'react';
import { Wind, Droplets, Volume2, AlertTriangle, TrendingUp, TrendingDown, Activity, Zap, Eye, Thermometer } from 'lucide-react';

const QuickStats: React.FC = () => {
  const [animatedValues, setAnimatedValues] = useState([0, 0, 0, 0]);
  const [isVisible, setIsVisible] = useState(false);

  const stats = [
    {
      title: 'Air Quality Index',
      value: 42,
      displayValue: '42',
      status: 'Good',
      change: '+5%',
      trend: 'up',
      icon: Wind,
      color: 'emerald',
      bgGradient: 'from-emerald-500 to-green-600',
      bgLight: 'from-emerald-50 to-green-100',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-700',
      description: 'Excellent air quality conditions',
      unit: 'AQI'
    },
    {
      title: 'Water Quality Score',
      value: 87,
      displayValue: '87',
      status: 'Excellent',
      change: '+2%',
      trend: 'up',
      icon: Droplets,
      color: 'blue',
      bgGradient: 'from-blue-500 to-cyan-600',
      bgLight: 'from-blue-50 to-cyan-100',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      description: 'Superior water purity levels',
      unit: '/100'
    },
    {
      title: 'Noise Level',
      value: 58,
      displayValue: '58 dB',
      status: 'Moderate',
      change: '-3%',
      trend: 'down',
      icon: Volume2,
      color: 'amber',
      bgGradient: 'from-amber-500 to-orange-600',
      bgLight: 'from-amber-50 to-orange-100',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-700',
      description: 'Acceptable noise pollution levels',
      unit: 'dB'
    },
    {
      title: 'Active Alerts',
      value: 7,
      displayValue: '7',
      status: 'Low Priority',
      change: '-12%',
      trend: 'down',
      icon: AlertTriangle,
      color: 'orange',
      bgGradient: 'from-orange-500 to-red-600',
      bgLight: 'from-orange-50 to-red-100',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-700',
      description: 'Minimal system alerts active',
      unit: 'alerts'
    }
  ];

  useEffect(() => {
    setIsVisible(true);
    
    // Animate values
    const timers = stats.map((stat, index) => {
      return setTimeout(() => {
        let current = 0;
        const increment = stat.value / 30;
        const timer = setInterval(() => {
          current += increment;
          if (current >= stat.value) {
            current = stat.value;
            clearInterval(timer);
          }
          setAnimatedValues(prev => {
            const newValues = [...prev];
            newValues[index] = Math.round(current);
            return newValues;
          });
        }, 50);
      }, index * 200);
    });

    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
        const animatedValue = animatedValues[index];
        
        return (
          <div 
            key={index}
            className={`relative bg-gradient-to-br ${stat.bgLight} dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 border ${stat.borderColor} dark:border-gray-600 hover:shadow-2xl transition-all duration-500 group overflow-hidden card-hover slide-in-up`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Animated Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
            
            {/* Floating Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 dark:bg-gray-600/20 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-700 float"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 dark:bg-gray-600/10 rounded-full translate-y-10 -translate-x-10 group-hover:scale-110 transition-transform duration-700 delay-100 float" style={{ animationDelay: '1s' }}></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className={`p-4 bg-gradient-to-br ${stat.bgGradient} rounded-2xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-500 pulse-glow`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className={`flex items-center space-x-2 text-sm font-bold ${
                  stat.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                } bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg`}>
                  <TrendIcon className="w-4 h-4" />
                  <span>{stat.change}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-baseline space-x-2">
                  <h3 className="text-4xl font-bold text-slate-900 dark:text-gray-100 group-hover:scale-105 transition-transform duration-300 font-mono">
                    {index === 2 ? `${animatedValue} dB` : animatedValue}
                    {index === 1 && '/100'}
                  </h3>
                  {stat.unit && index !== 1 && index !== 2 && (
                    <span className="text-lg text-slate-600 dark:text-gray-400">{stat.unit}</span>
                  )}
                </div>
                
                <p className="text-lg font-semibold text-slate-700 dark:text-gray-300">{stat.title}</p>
                
                <div className="flex items-center justify-between">
                  <span className={`inline-block text-sm font-bold px-3 py-1 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm ${stat.textColor} dark:text-gray-300 shadow-lg`}>
                    {stat.status}
                  </span>
                  <Activity className="w-4 h-4 text-slate-400 dark:text-gray-500 breathe" />
                </div>
                
                <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">{stat.description}</p>
                
                {/* Progress Bar */}
                <div className="w-full bg-slate-200 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-2 bg-gradient-to-r ${stat.bgGradient} rounded-full transition-all duration-1000 ease-out shadow-glow`}
                    style={{ 
                      width: `${index === 1 ? animatedValue : index === 2 ? (animatedValue / 100) * 100 : (animatedValue / 100) * 100}%`,
                      transitionDelay: `${index * 200}ms`
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </div>
        );
      })}
    </div>
  );
};

export default QuickStats;