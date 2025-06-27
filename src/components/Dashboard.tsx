import React, { useState, useEffect, useRef } from 'react';
import { Wind, Droplets, Volume2, AlertTriangle, TrendingUp, Users, MapPin, Activity, ArrowRight, Zap, Shield, Brain, Cpu, Eye, BarChart3, Thermometer, Settings, Grid, Clock, Leaf, Sun, Cloud, CloudRain, SunSnow as Snow } from 'lucide-react';
import EnvironmentalMap from './EnvironmentalMap';
import QuickStats from './QuickStats';
import AlertsList from './AlertsList';
import RecentActivity from './RecentActivity';
import PredictiveInsights from './PredictiveInsights';
import CustomizationPanel from './CustomizationPanel';

interface DashboardProps {
  setActiveTab?: (tab: string) => void;
  isDarkMode?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveTab, isDarkMode }) => {
  const [animationStep, setAnimationStep] = useState(0);
  const [currentWeather, setCurrentWeather] = useState('sunny');
  const [currentSeason, setCurrentSeason] = useState('spring');
  const [showCustomization, setShowCustomization] = useState(false);
  const customizationPanelRef = useRef<HTMLButtonElement>(null);
  const [cardLayout, setCardLayout] = useState([
    { id: 'stats', visible: true, order: 1 },
    { id: 'map', visible: true, order: 2 },
    { id: 'alerts', visible: true, order: 3 },
    { id: 'activity', visible: true, order: 4 },
    { id: 'insights', visible: true, order: 5 },
    { id: 'performance', visible: true, order: 6 }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationStep(prev => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Simulate weather and season changes
    const weatherCycle = ['sunny', 'cloudy', 'rainy', 'snowy'];
    const seasonCycle = ['spring', 'summer', 'autumn', 'winter'];
    
    const weatherTimer = setInterval(() => {
      setCurrentWeather(weatherCycle[Math.floor(Math.random() * weatherCycle.length)]);
    }, 30000); // Change weather every 30 seconds for demo

    const seasonTimer = setInterval(() => {
      setCurrentSeason(seasonCycle[Math.floor(Math.random() * seasonCycle.length)]);
    }, 60000); // Change season every minute for demo

    return () => {
      clearInterval(weatherTimer);
      clearInterval(seasonTimer);
    };
  }, []);

  const handleNavigation = (tab: string) => {
    if (setActiveTab) {
      setActiveTab(tab);
    }
  };

  const getWeatherIcon = () => {
    switch (currentWeather) {
      case 'sunny': return <Sun className="w-6 h-6 text-yellow-500" />;
      case 'cloudy': return <Cloud className="w-6 h-6 text-gray-500" />;
      case 'rainy': return <CloudRain className="w-6 h-6 text-blue-500" />;
      case 'snowy': return <Snow className="w-6 h-6 text-blue-300" />;
      default: return <Sun className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getSeasonalBackground = () => {
    const baseClass = "absolute inset-0 opacity-10 transition-all duration-1000";
    switch (currentSeason) {
      case 'spring':
        return `${baseClass} bg-gradient-to-br from-green-200 to-emerald-300`;
      case 'summer':
        return `${baseClass} bg-gradient-to-br from-yellow-200 to-orange-300`;
      case 'autumn':
        return `${baseClass} bg-gradient-to-br from-orange-200 to-red-300`;
      case 'winter':
        return `${baseClass} bg-gradient-to-br from-blue-200 to-cyan-300`;
      default:
        return `${baseClass} bg-gradient-to-br from-green-200 to-emerald-300`;
    }
  };

  const getEnvironmentalPattern = () => {
    const patterns = {
      spring: '🌸🌿🦋🌱',
      summer: '☀️🌻🦋🌳',
      autumn: '🍂🍁🌰🦔',
      winter: '❄️🌨️⛄🌲'
    };
    return patterns[currentSeason as keyof typeof patterns] || patterns.spring;
  };

  const heroStats = [
    { icon: MapPin, label: '247 Monitoring Points', description: 'Global sensor network' },
    { icon: Brain, label: 'AI-Powered Analytics', description: '4 active ML models' },
    { icon: TrendingUp, label: '98.7% Uptime', description: 'Reliable monitoring' },
    { icon: Shield, label: 'Enterprise Security', description: 'End-to-end encryption' }
  ];

  const quickAccessCards = [
    {
      id: 'air',
      title: 'Air Quality Monitor',
      description: 'Real-time atmospheric pollution tracking and air quality index monitoring',
      icon: Wind,
      gradient: 'from-sky-500 to-blue-600',
      bgGradient: 'from-sky-50 to-blue-100',
      value: '42 AQI',
      status: 'Good Quality',
      statusColor: 'bg-emerald-100 text-emerald-700',
      prediction: 'Expected to improve by 15% in next 2 hours'
    },
    {
      id: 'water',
      title: 'Water Quality Analysis',
      description: 'Comprehensive water contamination detection and purity assessment',
      icon: Droplets,
      gradient: 'from-blue-500 to-cyan-600',
      bgGradient: 'from-blue-50 to-cyan-100',
      value: '87/100',
      status: 'Excellent',
      statusColor: 'bg-emerald-100 text-emerald-700',
      prediction: 'Stable conditions predicted for next 6 hours'
    },
    {
      id: 'noise',
      title: 'Noise Pollution Control',
      description: 'Advanced acoustic monitoring and sound pollution analysis',
      icon: Volume2,
      gradient: 'from-purple-500 to-indigo-600',
      bgGradient: 'from-purple-50 to-indigo-100',
      value: '58 dB',
      status: 'Moderate',
      statusColor: 'bg-amber-100 text-amber-700',
      prediction: 'Levels may increase during evening rush hour'
    },
    {
      id: 'ai',
      title: 'AI Intelligence Center',
      description: 'Machine learning predictions and intelligent environmental insights',
      icon: Brain,
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-100',
      value: '4 Models',
      status: '92% Accuracy',
      statusColor: 'bg-emerald-100 text-emerald-700',
      prediction: 'New anomaly detection model training complete'
    }
  ];

  const visibleCards = cardLayout.filter(card => card.visible).sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-8 relative">
      {/* Environmental Background Pattern */}
      <div className={getSeasonalBackground()}>
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-4xl animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            >
              {getEnvironmentalPattern().charAt(i % 4)}
            </div>
          ))}
        </div>
      </div>

      {/* Premium Hero Section */}
      <div className="relative bg-gradient-to-br from-teal-600 via-emerald-600 to-blue-700 rounded-3xl p-8 lg:p-12 text-white overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full -translate-x-36 -translate-y-36 float"></div>
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-48 -translate-y-48 float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-white/10 rounded-full translate-y-32 float" style={{ animationDelay: '2s' }}></div>
          
          {/* Particle Effects */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              ></div>
            ))}
          </div>
        </div>
        
        <div className="relative z-10">
          <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4 slide-in-up">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl pulse-glow">
                  <Shield className="w-10 h-10" />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-6xl font-heading font-bold mb-2">
                    Environmental Intelligence Hub
                  </h1>
                  <p className="text-xl lg:text-2xl text-teal-100">
                    Real-time monitoring • AI-powered predictions • Smart environmental protection
                  </p>
                </div>
              </div>

              {/* Weather & Season Indicator */}
              <div className="hidden lg:flex flex-col items-center space-y-2 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                {getWeatherIcon()}
                <span className="text-sm font-medium capitalize">{currentWeather}</span>
                <span className="text-xs text-teal-100 capitalize">{currentSeason}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              {heroStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div 
                    key={index}
                    className="card-premium rounded-2xl p-6 hover-lift slide-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <Icon className="w-6 h-6" />
                      <span className="text-lg font-heading font-semibold">{stat.label}</span>
                    </div>
                    <p className="text-teal-100 text-sm">{stat.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Customization Button */}
        <button
          id="customization-panel-trigger"
          ref={customizationPanelRef}
          onClick={() => setShowCustomization(true)}
          className="absolute top-4 right-4 p-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all duration-300 hover:scale-110"
        >
          <Settings className="w-5 h-5" />
        </button>
        
        {/* Bolt Logo */}
        <a 
          href="https://bolt.new/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="absolute bottom-4 right-4 transition-transform hover:scale-110 z-20"
        >
          <img 
            src="/white_circle_360x360.png" 
            alt="Built with Bolt" 
            className="h-12 w-12"
          />
        </a>
      </div>

      {/* Customization Panel */}
      {showCustomization && (
        <CustomizationPanel
          cardLayout={cardLayout}
          setCardLayout={setCardLayout}
          onClose={() => setShowCustomization(false)}
        />
      )}

      {/* Dynamic Content Based on Layout */}
      {visibleCards.map((card) => {
        switch (card.id) {
          case 'stats':
            return (
              <div key={card.id} className="slide-in-up stagger-1">
                <QuickStats />
              </div>
            );

          case 'map':
            return (
              <div key={card.id} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 slide-in-up stagger-2">
                  <EnvironmentalMap />
                </div>
                <div className="space-y-6 slide-in-right">
                  <div className="card-premium rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-gray-100">System Status</h2>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full pulse-glow"></div>
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Live</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl border border-emerald-200 dark:border-emerald-700 hover-lift">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-emerald-100 dark:bg-emerald-800 rounded-lg">
                            <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <span className="font-semibold text-emerald-900 dark:text-emerald-100">System Health</span>
                        </div>
                        <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-800 px-3 py-1 rounded-full">Optimal</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-700 hover-lift">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                            <Cpu className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="font-semibold text-blue-900 dark:text-blue-100">Active Sensors</span>
                        </div>
                        <span className="text-sm font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-800 px-3 py-1 rounded-full">247/250</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-700 hover-lift">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-amber-100 dark:bg-amber-800 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <span className="font-semibold text-amber-900 dark:text-amber-100">Active Alerts</span>
                        </div>
                        <span className="text-sm font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-800 px-3 py-1 rounded-full">7 Low</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );

          case 'alerts':
            return (
              <div key={card.id} className="slide-in-up stagger-3">
                <AlertsList setActiveTab={setActiveTab} />
              </div>
            );

          case 'activity':
            return (
              <div key={card.id} className="slide-in-up stagger-4">
                <RecentActivity setActiveTab={setActiveTab} />
              </div>
            );

          case 'insights':
            return (
              <div key={card.id} className="slide-in-up stagger-5">
                <PredictiveInsights />
              </div>
            );

          case 'performance':
            return (
              <div key={card.id} className="card-premium rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-gray-700 slide-in-up stagger-6">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-heading font-bold text-slate-900 dark:text-gray-100">Performance Analytics</h3>
                  <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-gray-400">
                    <Zap className="w-4 h-4" />
                    <span>Real-time metrics</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { value: '98.7%', label: 'System Uptime', sublabel: 'Last 30 days', color: 'emerald', icon: TrendingUp },
                    { value: '2.3s', label: 'Response Time', sublabel: 'Average latency', color: 'blue', icon: Zap },
                    { value: '1.2M', label: 'Data Points', sublabel: 'Per day', color: 'purple', icon: BarChart3 },
                    { value: '99.9%', label: 'Data Accuracy', sublabel: 'Quality assurance', color: 'indigo', icon: Eye }
                  ].map((metric, index) => {
                    const Icon = metric.icon;
                    return (
                      <div 
                        key={index}
                        className={`text-center p-6 bg-gradient-to-br from-${metric.color}-50 to-${metric.color}-100 dark:from-${metric.color}-900/20 dark:to-${metric.color}-800/20 rounded-2xl border border-${metric.color}-200 dark:border-${metric.color}-700 hover-lift card-hover`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex justify-center mb-4">
                          <div className={`p-3 bg-gradient-to-br from-${metric.color}-500 to-${metric.color}-600 rounded-xl shadow-lg`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className={`text-4xl font-bold text-${metric.color}-600 dark:text-${metric.color}-400 mb-2`}>{metric.value}</div>
                        <div className={`text-sm font-semibold text-${metric.color}-700 dark:text-${metric.color}-300 mb-1`}>{metric.label}</div>
                        <div className={`text-xs text-${metric.color}-600 dark:text-${metric.color}-400`}>{metric.sublabel}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );

          default:
            return null;
        }
      })}

      {/* Premium Quick Access Cards with Predictions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickAccessCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              onClick={() => handleNavigation(card.id)}
              className={`group relative bg-gradient-to-br ${card.bgLight} dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 border border-slate-200 dark:border-gray-600 hover:border-slate-300 dark:hover:border-gray-500 transition-all duration-500 text-left overflow-hidden hover:shadow-2xl hover:scale-105 card-hover slide-in-up`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className={`p-4 bg-gradient-to-br ${card.gradient} rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-500 hover-glow`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-gray-300 group-hover:translate-x-1 transition-all duration-500" />
                </div>
                
                <h3 className="text-xl font-heading font-bold text-slate-900 dark:text-gray-100 mb-3">{card.title}</h3>
                <p className="text-slate-600 dark:text-gray-400 mb-4 leading-relaxed text-sm">{card.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl font-bold text-slate-900 dark:text-gray-100">{card.value}</div>
                  <div className={`px-3 py-1 ${card.statusColor} rounded-full text-sm font-semibold`}>
                    {card.status}
                  </div>
                </div>

                {/* Predictive Insight */}
                <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 border border-white/20 dark:border-gray-600/20">
                  <div className="flex items-center space-x-2 mb-1">
                    <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">AI Prediction</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-gray-300">{card.prediction}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Environmental Insights Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 slide-in-up stagger-7">
        <div className="card-premium rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-gray-700">
          <h3 className="text-xl font-heading font-bold text-slate-900 dark:text-gray-100 mb-6">Today's Insights</h3>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl border border-emerald-200 dark:border-emerald-700">
              <div className="flex items-center space-x-3 mb-2">
                <Thermometer className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-emerald-900 dark:text-emerald-100">Temperature Trend</span>
              </div>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">Average temperature decreased by 2°C, indicating improved air quality conditions.</p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
              <div className="flex items-center space-x-3 mb-2">
                <Droplets className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-blue-900 dark:text-blue-100">Water Quality</span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">All water sources maintain excellent quality standards with 99.2% purity rate.</p>
            </div>
          </div>
        </div>

        <div className="card-premium rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-gray-700">
          <h3 className="text-xl font-heading font-bold text-slate-900 dark:text-gray-100 mb-6">AI Recommendations</h3>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
              <div className="flex items-center space-x-3 mb-2">
                <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="font-semibold text-purple-900 dark:text-purple-100">Predictive Alert</span>
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-300">AI models predict potential air quality degradation in Industrial Zone within 6 hours.</p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-700">
              <div className="flex items-center space-x-3 mb-2">
                <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <span className="font-semibold text-amber-900 dark:text-amber-100">Optimization</span>
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-300">Sensor calibration recommended for 3 devices to maintain optimal accuracy levels.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;