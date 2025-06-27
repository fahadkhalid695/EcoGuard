import React, { useState, useEffect, useRef } from 'react';
import { Shield, BarChart3, Droplets, Wind, Volume2, AlertTriangle, MessageSquare, TrendingUp, Cpu, Brain, Lock, Mic, ChevronDown, Menu, X, Bell, User, Settings, LogIn, UserCircle, Download, FileText } from 'lucide-react';
import { User as UserType } from '../services/authService';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
  currentUser: UserType | null;
  onShowLogin: () => void;
  onShowSignUp: () => void;
  onShowProfile: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  activeTab, 
  setActiveTab, 
  isDarkMode, 
  setIsDarkMode, 
  currentUser,
  onShowLogin,
  onShowSignUp,
  onShowProfile,
  onLogout
}) => {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New alert detected', message: 'High PM2.5 levels in Industrial Zone', time: '5 min ago', read: false },
    { id: 2, title: 'System update', message: 'EcoGuard Pro has been updated to v1.2.0', time: '1 hour ago', read: false },
    { id: 3, title: 'Maintenance reminder', message: 'Sensor calibration due in 3 days', time: '3 hours ago', read: true }
  ]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAnimating, setIsAnimating] = useState(false);
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper function to safely get user initials
  const getUserInitials = (user: UserType | null): string => {
    if (!user) return '';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName.charAt(0) || ''}${lastName.charAt(0) || ''}`;
  };

  const menuCategories = [
    {
      title: 'Environmental Monitoring',
      color: 'from-teal-500 to-emerald-600',
      icon: Wind,
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3, description: 'System overview & metrics', color: 'text-emerald-600' },
        { id: 'air', label: 'Air Quality', icon: Wind, description: 'Atmospheric monitoring', color: 'text-sky-600' },
        { id: 'water', label: 'Water Quality', icon: Droplets, description: 'Water analysis', color: 'text-blue-600' },
        { id: 'noise', label: 'Noise Levels', icon: Volume2, description: 'Acoustic tracking', color: 'text-purple-600' },
      ]
    },
    {
      title: 'AI & Technology',
      color: 'from-purple-500 to-indigo-600',
      icon: Brain,
      items: [
        { id: 'iot', label: 'IoT Sensors', icon: Cpu, description: 'Sensor management', color: 'text-indigo-600' },
        { id: 'ai', label: 'AI Analytics', icon: Brain, description: 'ML insights', color: 'text-purple-600' },
        { id: 'analytics', label: 'Predictions', icon: TrendingUp, description: 'Forecasting', color: 'text-pink-600' },
        { id: 'voice', label: 'Voice Control', icon: Mic, description: 'Voice interface', color: 'text-green-600' },
      ]
    },
    {
      title: 'Management',
      color: 'from-orange-500 to-red-600',
      icon: Shield,
      items: [
        { id: 'alerts', label: 'Alerts', icon: AlertTriangle, description: 'Notifications', color: 'text-red-600' },
        { id: 'reports', label: 'Reports', icon: MessageSquare, description: 'Community feedback', color: 'text-orange-600' },
        { id: 'security', label: 'Security', icon: Lock, description: 'Privacy controls', color: 'text-gray-600' },
      ]
    }
  ];

  const handleMenuItemClick = (itemId: string) => {
    setIsAnimating(true);
    setActiveTab(itemId);
    setIsMegaMenuOpen(false);
    setIsMobileMenuOpen(false);
    
    // Reset animation state
    setTimeout(() => setIsAnimating(false), 300);
    
    // Scroll to top when changing tabs
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleMegaMenu = () => {
    setIsMegaMenuOpen(!isMegaMenuOpen);
    setIsNotificationsOpen(false);
    setIsSettingsOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    setIsNotificationsOpen(false);
    setIsSettingsOpen(false);
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    setIsMegaMenuOpen(false);
    setIsSettingsOpen(false);
  };

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
    setIsMegaMenuOpen(false);
    setIsNotificationsOpen(false);
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markNotificationAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleDownloadData = () => {
    if (!currentUser) {
      alert("Please sign in to download data");
      onShowLogin();
      return;
    }
    
    // Generate CSV data
    const csvData = [
      ['Sensor ID', 'Type', 'Value', 'Unit', 'Timestamp'],
      ['temp-001', 'Temperature', '24.5', '°C', new Date().toISOString()],
      ['hum-001', 'Humidity', '65', '%', new Date().toISOString()],
      ['co2-001', 'CO2', '450', 'ppm', new Date().toISOString()],
      ['noise-001', 'Noise', '58', 'dB', new Date().toISOString()]
    ].map(row => row.join(',')).join('\n');
    
    // Create blob and download
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `ecoguard-data-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl shadow-2xl border-b border-slate-200/50 dark:border-gray-700/50 sticky top-0 z-50 header-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Enhanced Logo with Animation */}
            <div className="flex items-center space-x-4">
              <div className="relative group" ref={logoRef}>
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-emerald-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500 pulse-glow"></div>
                <div className="relative p-3 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-110 hover-bounce">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="slide-in-right">
                <h1 className="text-2xl font-heading font-bold text-gradient-primary">
                  EcoGuard Pro
                </h1>
                <p className="text-sm text-slate-500 dark:text-gray-400 font-medium">AI-Powered Environmental Intelligence</p>
              </div>
            </div>

            {/* Real-time Status Bar */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="flex items-center space-x-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 px-4 py-2 rounded-xl border border-emerald-200 dark:border-emerald-700 hover-lift">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></div>
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Live Monitoring</span>
              </div>
              
              <div className="text-sm font-mono text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-gray-100 transition-colors duration-300">
                {currentTime.toLocaleTimeString()}
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-2">
              <div className="relative">
                <button
                  onClick={toggleMegaMenu}
                  className="flex items-center space-x-2 px-6 py-3 rounded-xl text-slate-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 dark:hover:from-teal-900/20 dark:hover:to-emerald-900/20 transition-all duration-300 font-semibold group nav-item hover-bounce"
                >
                  <span>Explore Solutions</span>
                  <ChevronDown className={`w-5 h-5 transition-all duration-300 ${isMegaMenuOpen ? 'rotate-180 text-teal-600' : 'group-hover:text-teal-600'}`} />
                </button>

                {/* Enhanced Mega Menu */}
                {isMegaMenuOpen && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 w-screen max-w-4xl nav-mega-menu">
                    <div className="glass dark:glass-dark rounded-2xl shadow-2xl border border-slate-200/50 dark:border-gray-700/50 overflow-hidden">
                      <div className="p-6">
                        <div className="grid grid-cols-3 gap-6">
                          {menuCategories.map((category, categoryIndex) => {
                            const CategoryIcon = category.icon;
                            return (
                              <div key={categoryIndex} className="space-y-4 slide-in-up" style={{ animationDelay: `${categoryIndex * 0.1}s` }}>
                                <div className={`p-4 rounded-xl bg-gradient-to-r ${category.color} text-white card-hover hover-lift`}>
                                  <div className="flex items-center space-x-2 mb-1">
                                    <CategoryIcon className="w-5 h-5" />
                                    <h3 className="text-base font-heading font-bold">{category.title}</h3>
                                  </div>
                                  <p className="text-xs opacity-90">Advanced solutions</p>
                                </div>
                                
                                <div className="space-y-2">
                                  {category.items.map((item, itemIndex) => {
                                    const Icon = item.icon;
                                    return (
                                      <button
                                        key={item.id}
                                        onClick={() => handleMenuItemClick(item.id)}
                                        className={`w-full text-left p-3 rounded-lg transition-all duration-300 group hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:shadow-lg hover:scale-105 card-hover nav-item micro-bounce ${
                                          activeTab === item.id ? 'bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border-2 border-teal-200 dark:border-teal-700 shadow-md nav-item-active' : 'border-2 border-transparent'
                                        }`}
                                        style={{ animationDelay: `${(categoryIndex * 4 + itemIndex) * 0.05}s` }}
                                      >
                                        <div className="flex items-center space-x-3">
                                          <div className={`p-2 rounded-lg transition-all duration-300 ${
                                            activeTab === item.id 
                                              ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md pulse-glow' 
                                              : 'bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 group-hover:bg-gradient-to-r group-hover:from-teal-500 group-hover:to-emerald-600 group-hover:text-white'
                                          }`}>
                                            <Icon className="w-4 h-4" />
                                          </div>
                                          <div className="flex-1">
                                            <h4 className={`font-semibold text-sm transition-colors duration-300 ${
                                              activeTab === item.id ? 'text-teal-700 dark:text-teal-300' : 'text-slate-900 dark:text-gray-100 group-hover:text-teal-700 dark:group-hover:text-teal-300'
                                            }`}>
                                              {item.label}
                                            </h4>
                                            <p className="text-xs text-slate-600 dark:text-gray-400 mt-0.5">{item.description}</p>
                                          </div>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* Enhanced AI Section */}
                        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-gray-700">
                          <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-blue-50 dark:from-teal-900/20 dark:via-emerald-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-teal-200 dark:border-teal-700 card-hover hover-lift">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-lg pulse-glow">
                                  <Brain className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h4 className="font-heading font-bold text-teal-900 dark:text-teal-100 text-sm">AI-Powered Intelligence</h4>
                                  <p className="text-xs text-teal-700 dark:text-teal-300">Predictive analytics & insights</p>
                                </div>
                              </div>
                              <button 
                                onClick={() => handleMenuItemClick('ai')}
                                className="btn-premium px-4 py-2 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 micro-pulse"
                              >
                                Explore AI
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Quick Access Buttons */}
              <button
                onClick={() => handleMenuItemClick('dashboard')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 nav-item hover-bounce ${
                  activeTab === 'dashboard'
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-xl scale-105 pulse-glow'
                    : 'text-slate-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 dark:hover:from-teal-900/20 dark:hover:to-emerald-900/20'
                }`}
              >
                Dashboard
              </button>
              
              <button
                onClick={() => handleMenuItemClick('alerts')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 relative nav-item hover-bounce ${
                  activeTab === 'alerts'
                    ? 'bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-xl scale-105 pulse-glow'
                    : 'text-slate-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 dark:hover:from-red-900/20 dark:hover:to-orange-900/20'
                }`}
              >
                Alerts
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50 heart-beat"></span>
              </button>
            </nav>

            {/* Enhanced Action Bar */}
            <div className="hidden lg:flex items-center space-x-3">
              <button 
                onClick={toggleNotifications}
                className="p-3 text-slate-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-xl transition-all duration-300 hover:scale-110 relative micro-bounce"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </button>
              
              <button 
                onClick={toggleSettings}
                className="p-3 text-slate-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-xl transition-all duration-300 hover:scale-110 micro-bounce"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>

              <button 
                onClick={handleDownloadData}
                className="p-3 text-slate-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-xl transition-all duration-300 hover:scale-110 micro-bounce"
                aria-label="Download Data"
                title="Download Sensor Data (CSV)"
              >
                <Download className="w-5 h-5" />
              </button>

              {/* User Menu */}
              <div className="relative">
                {currentUser ? (
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-3 p-3 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-gray-700 dark:to-gray-600 hover:from-teal-100 hover:to-emerald-100 dark:hover:from-teal-800 dark:hover:to-emerald-800 rounded-xl transition-all duration-300 hover:scale-110 hover-lift"
                  >
                    {currentUser.avatar ? (
                      <img 
                        src={currentUser.avatar} 
                        alt="User Avatar" 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {getUserInitials(currentUser)}
                      </div>
                    )}
                    <span className="text-sm font-medium text-slate-700 dark:text-gray-300">
                      {currentUser.firstName || 'User'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-500 dark:text-gray-400" />
                  </button>
                ) : (
                  <button
                    onClick={onShowLogin}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 hover:scale-110 hover-lift font-semibold"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </button>
                )}

                {/* User Dropdown Menu */}
                {isUserMenuOpen && currentUser && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-slate-200 dark:border-gray-700 overflow-hidden z-50">
                    <div className="p-4 border-b border-slate-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        {currentUser.avatar ? (
                          <img 
                            src={currentUser.avatar} 
                            alt="User Avatar" 
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                            {getUserInitials(currentUser)}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-gray-100">
                            {currentUser.firstName || ''} {currentUser.lastName || ''}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-gray-400">{currentUser.email}</p>
                          <p className="text-xs text-slate-500 dark:text-gray-500 capitalize">{currentUser.role}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-2">
                      <button
                        onClick={() => {
                          onShowProfile();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                      >
                        <UserCircle className="w-5 h-5 text-slate-600 dark:text-gray-400" />
                        <span className="text-slate-700 dark:text-gray-300">Profile Settings</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          handleMenuItemClick('security');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                      >
                        <Shield className="w-5 h-5 text-slate-600 dark:text-gray-400" />
                        <span className="text-slate-700 dark:text-gray-300">Security</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('billing');
                          window.history.pushState({}, '', '/billing');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                      >
                        <FileText className="w-5 h-5 text-slate-600 dark:text-gray-400" />
                        <span className="text-slate-700 dark:text-gray-300">Billing History</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          onLogout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 text-red-600 dark:text-red-400"
                      >
                        <LogIn className="w-5 h-5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-3 rounded-xl text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-gray-100 hover:bg-slate-100 dark:hover:bg-gray-700 transition-all duration-300 micro-bounce"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          
          {/* Enhanced Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-slate-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl nav-mobile-menu">
              <div className="py-6 space-y-2">
                {/* User Section for Mobile */}
                <div className="px-4 py-3 border-b border-slate-200 dark:border-gray-700">
                  {currentUser ? (
                    <div className="flex items-center space-x-3 mb-4">
                      {currentUser.avatar ? (
                        <img 
                          src={currentUser.avatar} 
                          alt="User Avatar" 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                          {getUserInitials(currentUser)}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-gray-100">
                          {currentUser.firstName || ''} {currentUser.lastName || ''}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-gray-400">{currentUser.email}</p>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        onShowLogin();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-colors duration-200"
                    >
                      <LogIn className="w-5 h-5" />
                      <span className="font-medium">Sign In</span>
                    </button>
                  )}
                </div>

                {/* Download Data for Mobile */}
                <div className="px-4 py-3 border-b border-slate-200 dark:border-gray-700">
                  <button
                    onClick={handleDownloadData}
                    className="flex items-center space-x-3 w-full text-left p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors duration-200"
                  >
                    <div className="p-2 bg-slate-100 dark:bg-gray-700 rounded-lg">
                      <Download className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Download Sensor Data (CSV)</span>
                  </button>
                </div>

                {menuCategories.map((category) => (
                  <div key={category.title} className="space-y-2">
                    <div className="px-4 py-3">
                      <h3 className={`text-sm font-heading font-bold uppercase tracking-wide text-gradient-primary`}>
                        {category.title}
                      </h3>
                    </div>
                    {category.items.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleMenuItemClick(item.id)}
                          className={`w-full flex items-center space-x-4 px-4 py-4 text-left transition-all duration-300 nav-item slide-in-right ${
                            activeTab === item.id
                              ? 'bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 text-teal-700 dark:text-teal-300 border-r-4 border-teal-500 shadow-lg nav-item-active'
                              : 'text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-gray-100 hover:bg-slate-50 dark:hover:bg-gray-800'
                          }`}
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className={`p-2 rounded-lg transition-all duration-300 ${activeTab === item.id ? 'bg-teal-100 dark:bg-teal-800 pulse-glow' : 'bg-slate-100 dark:bg-gray-700'}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-semibold">{item.label}</div>
                            <div className="text-xs text-slate-500 dark:text-gray-400">{item.description}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))}

                {/* Mobile User Actions */}
                {currentUser && (
                  <div className="px-4 py-3 border-t border-slate-200 dark:border-gray-700 space-y-2">
                    <button
                      onClick={() => {
                        onShowProfile();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 p-3 text-left hover:bg-slate-50 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                    >
                      <UserCircle className="w-5 h-5 text-slate-600 dark:text-gray-400" />
                      <span className="text-slate-700 dark:text-gray-300">Profile Settings</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        onLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 p-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 text-red-600 dark:text-red-400"
                    >
                      <LogIn className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Notifications Panel */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white dark:bg-gray-800 h-full w-full max-w-md shadow-2xl overflow-hidden slide-in-right">
            <div className="p-4 border-b border-slate-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-slate-700 dark:text-gray-300" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-gray-100">Notifications</h2>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={markAllNotificationsAsRead}
                  className="text-sm text-teal-600 dark:text-teal-400 hover:underline"
                >
                  Mark all as read
                </button>
                <button
                  onClick={() => setIsNotificationsOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto h-full pb-20">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-slate-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-gray-100 mb-2">No notifications</h3>
                  <p className="text-slate-600 dark:text-gray-400">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-gray-700">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`p-4 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors duration-200 ${
                        !notification.read ? 'bg-teal-50 dark:bg-teal-900/10' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${
                          !notification.read 
                            ? 'bg-teal-100 dark:bg-teal-800 text-teal-600 dark:text-teal-400' 
                            : 'bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-400'
                        }`}>
                          <Bell className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900 dark:text-gray-100">{notification.title}</h4>
                          <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">{notification.message}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-slate-500 dark:text-gray-500">{notification.time}</span>
                            {!notification.read && (
                              <button
                                onClick={() => markNotificationAsRead(notification.id)}
                                className="text-xs text-teal-600 dark:text-teal-400 hover:underline"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white dark:bg-gray-800 h-full w-full max-w-md shadow-2xl overflow-hidden slide-in-right">
            <div className="p-4 border-b border-slate-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Settings className="w-5 h-5 text-slate-700 dark:text-gray-300" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-gray-100">Settings</h2>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto h-full pb-20 p-4 space-y-6">
              <div>
                <h3 className="text-md font-semibold text-slate-900 dark:text-gray-100 mb-3">Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 dark:text-gray-300">Email Notifications</span>
                    <button
                      className="relative inline-flex h-6 w-11 items-center rounded-full bg-teal-600 transition-colors duration-300 focus:outline-none"
                    >
                      <span
                        className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition-transform duration-300"
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 dark:text-gray-300">Push Notifications</span>
                    <button
                      className="relative inline-flex h-6 w-11 items-center rounded-full bg-teal-600 transition-colors duration-300 focus:outline-none"
                    >
                      <span
                        className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition-transform duration-300"
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 dark:text-gray-300">SMS Alerts</span>
                    <button
                      className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 dark:bg-gray-700 transition-colors duration-300 focus:outline-none"
                    >
                      <span
                        className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1 transition-transform duration-300"
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-md font-semibold text-slate-900 dark:text-gray-100 mb-3">Language & Region</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-slate-700 dark:text-gray-300 mb-1">Language</label>
                    <select className="w-full p-2 bg-slate-100 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg text-slate-900 dark:text-gray-100">
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 dark:text-gray-300 mb-1">Date Format</label>
                    <select className="w-full p-2 bg-slate-100 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg text-slate-900 dark:text-gray-100">
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 dark:text-gray-300 mb-1">Time Format</label>
                    <select className="w-full p-2 bg-slate-100 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg text-slate-900 dark:text-gray-100">
                      <option value="12">12-hour (AM/PM)</option>
                      <option value="24">24-hour</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-md font-semibold text-slate-900 dark:text-gray-100 mb-3">Dashboard Customization</h3>
                <button
                  onClick={() => {
                    setIsSettingsOpen(false);
                    document.getElementById('customization-panel-trigger')?.click();
                    // Scroll to top to ensure the customization panel is visible
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200"
                >
                  Customize Dashboard
                </button>
              </div>

              <div>
                <h3 className="text-md font-semibold text-slate-900 dark:text-gray-100 mb-3">Data & Privacy</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleDownloadData}
                    className="flex items-center space-x-2 text-slate-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download My Data</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setActiveTab('privacy');
                      window.history.pushState({}, '', '/privacy');
                      window.scrollTo(0, 0);
                    }}
                    className="flex items-center space-x-2 text-slate-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Privacy Policy</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Overlay for mega menu */}
      {isMegaMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 fade-in-scale"
          onClick={() => setIsMegaMenuOpen(false)}
        />
      )}

      {/* User menu overlay */}
      {isUserMenuOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Header;