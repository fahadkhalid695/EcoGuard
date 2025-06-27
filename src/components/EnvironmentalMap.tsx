import React, { useState, useEffect } from 'react';
import { MapPin, Wind, Droplets, Volume2, Eye, Maximize2, Layers, Filter, Zap, Compass, Ruler, Crosshair, Map } from 'lucide-react';

const EnvironmentalMap: React.FC = () => {
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [mapLayer, setMapLayer] = useState<'all' | 'air' | 'water' | 'noise'>('all');
  const [animationFrame, setAnimationFrame] = useState(0);
  const [mapView, setMapView] = useState<'street'>('street');
  const [showFilters, setShowFilters] = useState(false);
  const [filterValues, setFilterValues] = useState({
    airQuality: 100,
    waterQuality: 0,
    noiseLevel: 100
  });

  const monitoringPoints = [
    { id: 1, name: 'Downtown Hub', x: 35, y: 25, air: 45, water: 92, noise: 68, type: 'urban', status: 'excellent' },
    { id: 2, name: 'Industrial Zone', x: 75, y: 40, air: 78, water: 65, noise: 82, type: 'industrial', status: 'poor' },
    { id: 3, name: 'Riverside Park', x: 20, y: 60, air: 28, water: 98, noise: 35, type: 'park', status: 'excellent' },
    { id: 4, name: 'Residential Area', x: 60, y: 70, air: 38, water: 88, noise: 52, type: 'residential', status: 'good' },
    { id: 5, name: 'Highway Junction', x: 85, y: 20, air: 82, water: 75, noise: 95, type: 'highway', status: 'poor' },
    { id: 6, name: 'Harbor District', x: 15, y: 85, air: 55, water: 78, noise: 70, type: 'harbor', status: 'moderate' },
    { id: 7, name: 'Central Park', x: 45, y: 45, air: 32, water: 95, noise: 42, type: 'park', status: 'excellent' },
    { id: 8, name: 'Shopping District', x: 55, y: 30, air: 58, water: 82, noise: 75, type: 'commercial', status: 'moderate' },
    { id: 9, name: 'University Campus', x: 30, y: 35, air: 40, water: 90, noise: 60, type: 'educational', status: 'good' },
    { id: 10, name: 'Airport Area', x: 90, y: 60, air: 65, water: 70, noise: 88, type: 'transportation', status: 'moderate' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame(prev => (prev + 1) % 360);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value: number, type: 'air' | 'water' | 'noise') => {
    if (type === 'air') {
      if (value <= 50) return 'bg-emerald-500 shadow-emerald-500/50';
      if (value <= 100) return 'bg-yellow-500 shadow-yellow-500/50';
      return 'bg-red-500 shadow-red-500/50';
    }
    if (type === 'water') {
      if (value >= 80) return 'bg-emerald-500 shadow-emerald-500/50';
      if (value >= 60) return 'bg-yellow-500 shadow-yellow-500/50';
      return 'bg-red-500 shadow-red-500/50';
    }
    if (type === 'noise') {
      if (value <= 60) return 'bg-emerald-500 shadow-emerald-500/50';
      if (value <= 80) return 'bg-yellow-500 shadow-yellow-500/50';
      return 'bg-red-500 shadow-red-500/50';
    }
    return 'bg-gray-500 shadow-gray-500/50';
  };

  const getOverallStatus = (point: any) => {
    const airScore = point.air <= 50 ? 2 : point.air <= 100 ? 1 : 0;
    const waterScore = point.water >= 80 ? 2 : point.water >= 60 ? 1 : 0;
    const noiseScore = point.noise <= 60 ? 2 : point.noise <= 80 ? 1 : 0;
    const total = airScore + waterScore + noiseScore;
    
    if (total >= 5) return 'excellent';
    if (total >= 3) return 'good';
    if (total >= 1) return 'moderate';
    return 'poor';
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700';
      case 'good':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700';
      case 'moderate':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700';
      case 'poor':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const shouldShowPoint = (point: any) => {
    if (mapLayer === 'all') {
      return true;
    }
    
    if (mapLayer === 'air' && point.air > filterValues.airQuality) {
      return false;
    }
    
    if (mapLayer === 'water' && point.water < filterValues.waterQuality) {
      return false;
    }
    
    if (mapLayer === 'noise' && point.noise > filterValues.noiseLevel) {
      return false;
    }
    
    return true;
  };

  const getMapBackground = () => {
    return "bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-800 dark:to-gray-700";
  };

  const toggleFullscreen = () => {
    const mapElement = document.getElementById('environmental-map');
    if (!mapElement) return;
    
    if (!document.fullscreenElement) {
      mapElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleFilterChange = (type: keyof typeof filterValues, value: number) => {
    setFilterValues(prev => ({ ...prev, [type]: value }));
  };

  return (
    <div className="card-premium rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-gray-100">Environmental Monitoring Map</h2>
        <div className="flex items-center space-x-4">
          {/* Layer Controls */}
          <div className="flex items-center space-x-2 bg-slate-100 dark:bg-gray-800 rounded-lg p-1">
            {[
              { key: 'all', label: 'All', icon: Layers },
              { key: 'air', label: 'Air', icon: Wind },
              { key: 'water', label: 'Water', icon: Droplets },
              { key: 'noise', label: 'Noise', icon: Volume2 }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setMapLayer(key as any)}
                className={`flex items-center space-x-1 px-3 py-1 rounded text-xs font-medium transition-all duration-200 ${
                  mapLayer === key
                    ? 'bg-white dark:bg-gray-700 text-slate-900 dark:text-gray-100 shadow-sm'
                    : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="hidden md:flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50"></div>
              <span className="text-slate-600 dark:text-gray-400">Good</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-lg shadow-yellow-500/50"></div>
              <span className="text-slate-600 dark:text-gray-400">Moderate</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/50"></div>
              <span className="text-slate-600 dark:text-gray-400">Poor</span>
            </div>
          </div>

          <button 
            onClick={toggleFullscreen}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 transition-colors duration-200"
            aria-label="Fullscreen"
            title="Fullscreen"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div id="environmental-map" className={`relative ${getMapBackground()} rounded-xl h-96 overflow-hidden`}>
        {/* Enhanced Map Background */}
        <div className="absolute inset-0 opacity-40 dark:opacity-30">
          {/* Roads */}
          <div className="absolute top-0 left-1/2 w-4 h-full bg-gray-400 transform -translate-x-1/2"></div>
          <div className="absolute left-0 top-1/2 w-full h-4 bg-gray-400 transform -translate-y-1/2"></div>
          <div className="absolute top-1/4 left-0 w-full h-2 bg-gray-400 transform -translate-y-1/2"></div>
          <div className="absolute top-3/4 left-0 w-full h-2 bg-gray-400 transform -translate-y-1/2"></div>
          <div className="absolute top-0 left-1/4 w-2 h-full bg-gray-400 transform -translate-x-1/2"></div>
          <div className="absolute top-0 left-3/4 w-2 h-full bg-gray-400 transform -translate-x-1/2"></div>
          
          {/* Parks */}
          <div className="absolute top-10 left-10 w-20 h-16 bg-green-400 rounded-lg shadow-lg"></div>
          <div className="absolute bottom-20 left-16 w-32 h-24 bg-green-400 rounded-lg shadow-lg"></div>
          <div className="absolute bottom-10 right-10 w-28 h-20 bg-green-400 rounded-lg shadow-lg"></div>
          <div className="absolute top-40 left-1/2 w-24 h-24 bg-green-400 rounded-full shadow-lg transform -translate-x-1/2"></div>
          
          {/* Buildings */}
          <div className="absolute top-20 right-20 w-24 h-20 bg-gray-500 rounded-lg shadow-lg"></div>
          <div className="absolute top-32 right-32 w-16 h-24 bg-gray-600 rounded-lg shadow-lg"></div>
          <div className="absolute bottom-32 left-32 w-20 h-16 bg-gray-500 rounded-lg shadow-lg"></div>
          <div className="absolute top-20 left-1/4 grid grid-cols-3 gap-2">
            <div className="w-8 h-8 bg-gray-600 rounded-sm shadow-sm"></div>
            <div className="w-8 h-10 bg-gray-700 rounded-sm shadow-sm"></div>
            <div className="w-8 h-6 bg-gray-500 rounded-sm shadow-sm"></div>
            <div className="w-8 h-12 bg-gray-600 rounded-sm shadow-sm"></div>
            <div className="w-8 h-8 bg-gray-500 rounded-sm shadow-sm"></div>
            <div className="w-8 h-10 bg-gray-700 rounded-sm shadow-sm"></div>
          </div>
          <div className="absolute bottom-20 right-1/4 grid grid-cols-3 gap-2">
            <div className="w-8 h-8 bg-gray-600 rounded-sm shadow-sm"></div>
            <div className="w-8 h-10 bg-gray-700 rounded-sm shadow-sm"></div>
            <div className="w-8 h-6 bg-gray-500 rounded-sm shadow-sm"></div>
            <div className="w-8 h-12 bg-gray-600 rounded-sm shadow-sm"></div>
            <div className="w-8 h-8 bg-gray-500 rounded-sm shadow-sm"></div>
            <div className="w-8 h-10 bg-gray-700 rounded-sm shadow-sm"></div>
          </div>
          
          {/* Water */}
          <div className="absolute bottom-10 left-10 w-40 h-20 bg-blue-400 rounded-full shadow-lg"></div>
          <div className="absolute top-40 left-8 w-16 h-32 bg-blue-400 rounded-lg shadow-lg"></div>
          <div className="absolute bottom-40 right-20 w-30 h-15 bg-blue-400 rounded-full shadow-lg"></div>
        </div>

        {/* Data Visualization Overlay */}
        {mapLayer !== 'all' && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Heat map effect */}
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-blue-500/10 to-transparent opacity-50"></div>
          </div>
        )}

        {/* Monitoring Points */}
        {monitoringPoints.filter(shouldShowPoint).map((point) => {
          const overallStatus = getOverallStatus(point);
          const isSelected = selectedPoint === point.id;
          const primaryMetric = mapLayer === 'air' ? point.air : mapLayer === 'water' ? point.water : mapLayer === 'noise' ? point.noise : point.air;
          
          return (
            <div
              key={point.id}
              className="absolute group cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-10"
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
              onClick={() => setSelectedPoint(isSelected ? null : point.id)}
            >
              <div className="relative">
                {/* Pulse animation for active sensors */}
                <div className={`absolute inset-0 w-8 h-8 rounded-full ${getStatusColor(primaryMetric, mapLayer === 'all' ? 'air' : mapLayer as any)} animate-ping opacity-75`}></div>
                
                {/* Data visualization ring */}
                <div className="absolute inset-0 w-8 h-8">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 32 32">
                    <circle
                      cx="16"
                      cy="16"
                      r="12"
                      fill="none"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="2"
                    />
                    <circle
                      cx="16"
                      cy="16"
                      r="12"
                      fill="none"
                      stroke={mapLayer === 'air' ? '#3b82f6' : mapLayer === 'water' ? '#06b6d4' : mapLayer === 'noise' ? '#8b5cf6' : '#10b981'}
                      strokeWidth="2"
                      strokeDasharray={`${(primaryMetric / 100) * 75.4} 75.4`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                </div>
                
                {/* Main sensor point */}
                <div className={`relative w-8 h-8 rounded-full ${getStatusColor(primaryMetric, mapLayer === 'all' ? 'air' : mapLayer as any)} ring-4 ring-white dark:ring-gray-800 shadow-xl transition-all duration-300 ${
                  isSelected ? 'scale-150 z-20' : 'group-hover:scale-125'
                } hover-glow`}>
                  <div className="absolute inset-0 rounded-full bg-white bg-opacity-20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
                
                {/* Enhanced Tooltip */}
                <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 transition-all duration-300 z-30 ${
                  isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'
                }`}>
                  <div className="card-premium rounded-xl shadow-2xl border border-slate-200 dark:border-gray-700 p-4 min-w-max">
                    <div className="flex items-center space-x-2 mb-3">
                      <MapPin className="w-4 h-4 text-slate-500 dark:text-gray-400" />
                      <h4 className="font-bold text-slate-900 dark:text-gray-100">{point.name}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadgeColor(overallStatus)}`}>
                        {overallStatus}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between space-x-4">
                        <div className="flex items-center space-x-2">
                          <Wind className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                          <span className="text-sm text-slate-600 dark:text-gray-400">Air Quality:</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-slate-900 dark:text-gray-100">{point.air} AQI</span>
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(point.air, 'air').split(' ')[0]}`}></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between space-x-4">
                        <div className="flex items-center space-x-2">
                          <Droplets className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm text-slate-600 dark:text-gray-400">Water Quality:</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-slate-900 dark:text-gray-100">{point.water}/100</span>
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(point.water, 'water').split(' ')[0]}`}></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between space-x-4">
                        <div className="flex items-center space-x-2">
                          <Volume2 className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                          <span className="text-sm text-slate-600 dark:text-gray-400">Noise Level:</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-slate-900 dark:text-gray-100">{point.noise} dB</span>
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(point.noise, 'noise').split(' ')[0]}`}></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status indicators */}
                    <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-slate-200 dark:border-gray-600">
                      <Zap className="w-3 h-3 text-emerald-500 dark:text-emerald-400 animate-pulse" />
                      <span className="text-xs text-slate-500 dark:text-gray-400">Live data • Updated 2min ago</span>
                    </div>
                  </div>
                  
                  {/* Tooltip arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                    <div className="w-3 h-3 bg-white dark:bg-gray-800 border-r border-b border-slate-200 dark:border-gray-700 transform rotate-45"></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Map Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors duration-200"
            aria-label="Filter"
            title="Filter Data"
          >
            <Filter className="w-4 h-4 text-slate-600 dark:text-gray-400" />
          </button>
          <button 
            onClick={() => {
              const mapView = mapLayer === 'all' ? 'air' : 
                             mapLayer === 'air' ? 'water' : 
                             mapLayer === 'water' ? 'noise' : 'all';
              setMapLayer(mapView as any);
            }}
            className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors duration-200"
            aria-label="Toggle View"
            title="Toggle Map View"
          >
            <Eye className="w-4 h-4 text-slate-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-slate-200 dark:border-gray-700 p-4 w-64">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-gray-100 mb-3">Filter Data</h4>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-600 dark:text-gray-400">Air Quality (max AQI)</label>
                  <span className="text-xs font-medium text-slate-900 dark:text-gray-100">{filterValues.airQuality}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="150" 
                  value={filterValues.airQuality}
                  onChange={(e) => handleFilterChange('airQuality', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-600 dark:text-gray-400">Water Quality (min score)</label>
                  <span className="text-xs font-medium text-slate-900 dark:text-gray-100">{filterValues.waterQuality}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={filterValues.waterQuality}
                  onChange={(e) => handleFilterChange('waterQuality', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-600 dark:text-gray-400">Noise Level (max dB)</label>
                  <span className="text-xs font-medium text-slate-900 dark:text-gray-100">{filterValues.noiseLevel}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={filterValues.noiseLevel}
                  onChange={(e) => handleFilterChange('noiseLevel', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <button
                onClick={() => setFilterValues({ airQuality: 100, waterQuality: 0, noiseLevel: 100 })}
                className="w-full py-1 text-xs text-center text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 border border-slate-200 dark:border-gray-700 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}

        {/* Real-time indicator */}
        <div className="absolute top-4 left-4 flex items-center space-x-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-200 dark:border-gray-700">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-slate-700 dark:text-gray-300">Live Monitoring</span>
        </div>

        {/* Compass */}
        <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 dark:bg-gray-800/90 rounded-full border border-slate-200 dark:border-gray-700 flex items-center justify-center">
          <Compass className="w-6 h-6 text-slate-700 dark:text-gray-300" />
        </div>

        {/* Scale */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 dark:bg-gray-800/90 px-3 py-1 rounded-lg text-xs font-medium text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-gray-700">
          0 km 5 km 10 km
        </div>
      </div>

      {/* Enhanced Map Legend */}
      <div className="mt-4 p-4 bg-slate-50 dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between text-sm gap-4">
          <div className="flex items-center space-x-6">
            <span className="font-medium text-slate-700 dark:text-gray-300">Legend:</span>
            <div className="flex items-center space-x-2">
              <Wind className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span className="text-slate-600 dark:text-gray-400">Air Quality</span>
            </div>
            <div className="flex items-center space-x-2">
              <Droplets className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-slate-600 dark:text-gray-400">Water Quality</span>
            </div>
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-slate-600 dark:text-gray-400">Noise Level</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 dark:text-gray-400">Click sensors for details</span>
            <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
            <span className="text-slate-500 dark:text-gray-400">{monitoringPoints.filter(shouldShowPoint).length} active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentalMap;