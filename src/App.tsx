import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import AirQuality from './components/AirQuality';
import WaterQuality from './components/WaterQuality';
import NoiseMonitoring from './components/NoiseMonitoring';
import AlertsPanel from './components/AlertsPanel';
import CitizenReports from './components/CitizenReports';
import PredictiveAnalytics from './components/PredictiveAnalytics';
import IoTDashboard from './components/IoTDashboard';
import AIAnalytics from './components/AIAnalytics';
import SecurityPanel from './components/SecurityPanel';
import VoiceInterface from './components/VoiceInterface';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import CookiePolicy from './components/CookiePolicy';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/auth/SignUpPage';
import PricingPage from './components/PricingPage';
import SuccessPage from './components/SuccessPage';
import BillingHistory from './components/BillingHistory';
import UserProfile from './components/UserProfile';
import { useAuth } from './hooks/useAuth';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousTab, setPreviousTab] = useState('dashboard');
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('ecoguard-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const { user, loading, signOut, updateUserProfile } = useAuth();

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('ecoguard-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    if (activeTab !== previousTab) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setPreviousTab(activeTab);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [activeTab, previousTab]);

  // Handle URL routing
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/login') {
      setShowLogin(true);
    } else if (path === '/signup') {
      setShowSignUp(true);
    } else if (path === '/pricing') {
      setActiveTab('pricing');
    } else if (path === '/success') {
      setActiveTab('success');
    } else if (path === '/billing') {
      setActiveTab('billing');
    } else if (path.startsWith('/')) {
      const tab = path.slice(1) || 'dashboard';
      setActiveTab(tab);
    }
  }, []);

  const handleTabChange = (tab: string) => {
    if (tab !== activeTab) {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveTab(tab);
        window.history.pushState({}, '', `/${tab === 'dashboard' ? '' : tab}`);
        // Scroll to top when changing tabs
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 150);
    }
  };

  const handleLogin = (user: any) => {
    setShowLogin(false);
    setActiveTab('dashboard');
    window.history.pushState({}, '', '/');
  };

  const handleSignUp = () => {
    setShowSignUp(false);
    setActiveTab('dashboard');
    window.history.pushState({}, '', '/');
  };

  const handleLogout = async () => {
    await signOut();
    setShowProfile(false);
    setActiveTab('dashboard');
    window.history.pushState({}, '', '/');
  };

  const handleShowLogin = () => {
    setShowLogin(true);
    setShowSignUp(false);
    setShowProfile(false);
    window.history.pushState({}, '', '/login');
  };

  const handleShowSignUp = () => {
    setShowSignUp(true);
    setShowLogin(false);
    setShowProfile(false);
    window.history.pushState({}, '', '/signup');
  };

  const handleShowProfile = () => {
    setShowProfile(true);
    setShowLogin(false);
    setShowSignUp(false);
  };

  const handleBackToDashboard = () => {
    setShowLogin(false);
    setShowSignUp(false);
    setShowProfile(false);
    setActiveTab('dashboard');
    window.history.pushState({}, '', '/');
  };

  const handleUpdateProfile = async (updatedUser: any) => {
    if (user) {
      try {
        await updateUserProfile({
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          organization: updatedUser.organization
        });
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    }
  };

  const getPageTransitionClass = () => {
    if (isTransitioning) {
      return 'opacity-0 transform scale-95';
    }
    return 'opacity-100 transform scale-100 page-transition-container';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-gray-400">Loading EcoGuard Pro...</p>
        </div>
      </div>
    );
  }

  // Show login page
  if (showLogin) {
    return <LoginPage onBack={handleBackToDashboard} onLogin={handleLogin} />;
  }

  // Show signup page
  if (showSignUp) {
    return <SignUpPage onBack={handleBackToDashboard} />;
  }

  // Show user profile
  if (showProfile && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto py-8">
          <UserProfile 
            user={user}
            onLogout={handleLogout}
            onUpdateProfile={handleUpdateProfile}
          />
        </div>
      </div>
    );
  }

  const renderContent = () => {
    const contentClass = `transition-all duration-500 ease-in-out ${getPageTransitionClass()}`;
    
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className={contentClass}>
            <Dashboard setActiveTab={handleTabChange} isDarkMode={isDarkMode} />
          </div>
        );
      case 'air':
        return (
          <div className={contentClass}>
            <AirQuality />
          </div>
        );
      case 'water':
        return (
          <div className={contentClass}>
            <WaterQuality />
          </div>
        );
      case 'noise':
        return (
          <div className={contentClass}>
            <NoiseMonitoring />
          </div>
        );
      case 'alerts':
        return (
          <div className={contentClass}>
            <AlertsPanel />
          </div>
        );
      case 'reports':
        return (
          <div className={contentClass}>
            <CitizenReports />
          </div>
        );
      case 'analytics':
        return (
          <div className={contentClass}>
            <PredictiveAnalytics />
          </div>
        );
      case 'iot':
        return (
          <div className={contentClass}>
            <IoTDashboard />
          </div>
        );
      case 'ai':
        return (
          <div className={contentClass}>
            <AIAnalytics />
          </div>
        );
      case 'security':
        return (
          <div className={contentClass}>
            <SecurityPanel />
          </div>
        );
      case 'voice':
        return (
          <div className={contentClass}>
            <VoiceInterface />
          </div>
        );
      case 'pricing':
        return (
          <div className={contentClass}>
            <PricingPage />
          </div>
        );
      case 'success':
        return (
          <div className={contentClass}>
            <SuccessPage />
          </div>
        );
      case 'billing':
        return (
          <div className={contentClass}>
            <BillingHistory />
          </div>
        );
      case 'privacy':
        return (
          <div className={contentClass}>
            <PrivacyPolicy onBack={() => handleTabChange('dashboard')} />
          </div>
        );
      case 'terms':
        return (
          <div className={contentClass}>
            <TermsOfService onBack={() => handleTabChange('dashboard')} />
          </div>
        );
      case 'cookies':
        return (
          <div className={contentClass}>
            <CookiePolicy onBack={() => handleTabChange('dashboard')} />
          </div>
        );
      default:
        return (
          <div className={contentClass}>
            <Dashboard setActiveTab={handleTabChange} isDarkMode={isDarkMode} />
          </div>
        );
    }
  };

  // Don't render header and footer for policy pages, pricing, and success pages
  const isFullPageView = ['privacy', 'terms', 'cookies', 'pricing', 'success'].includes(activeTab);

  if (isFullPageView) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
        {renderContent()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex flex-col transition-all duration-500">
      <div className="header-transition">
        <Header 
          activeTab={activeTab} 
          setActiveTab={handleTabChange} 
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          currentUser={user}
          onShowLogin={handleShowLogin}
          onShowSignUp={handleShowSignUp}
          onShowProfile={handleShowProfile}
          onLogout={handleLogout}
        />
      </div>
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 content-transition">
        <div className="relative overflow-hidden">
          {renderContent()}
        </div>
      </main>
      
      <div className="footer-transition">
        <Footer setActiveTab={handleTabChange} />
      </div>
    </div>
  );
}

export default App;