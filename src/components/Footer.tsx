import React from 'react';
import { Shield, Heart, Globe, Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  setActiveTab?: (tab: string) => void;
}

const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  const currentYear = new Date().getFullYear();

  const handleNavigation = (tab: string) => {
    if (setActiveTab) {
      setActiveTab(tab);
    }
  };

  const handlePolicyClick = (policy: string) => {
    if (setActiveTab) {
      setActiveTab(policy);
      // Scroll to top when navigating to policy pages
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">EcoGuard Pro</h3>
                <p className="text-sm text-slate-400">Environmental Monitoring</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Advanced AI-powered IoT environmental monitoring system providing real-time insights 
              for a sustainable future.
            </p>
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <Heart className="w-4 h-4 text-red-500" />
              <span>Made with care for our planet</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button 
                  onClick={() => handleNavigation('dashboard')}
                  className="text-slate-300 hover:text-emerald-400 transition-colors duration-200 text-left w-full"
                >
                  Dashboard
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('air')}
                  className="text-slate-300 hover:text-emerald-400 transition-colors duration-200 text-left w-full"
                >
                  Air Quality Monitoring
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('water')}
                  className="text-slate-300 hover:text-emerald-400 transition-colors duration-200 text-left w-full"
                >
                  Water Quality Analysis
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('noise')}
                  className="text-slate-300 hover:text-emerald-400 transition-colors duration-200 text-left w-full"
                >
                  Noise Pollution Tracking
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('ai')}
                  className="text-slate-300 hover:text-emerald-400 transition-colors duration-200 text-left w-full"
                >
                  AI Analytics
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('alerts')}
                  className="text-slate-300 hover:text-emerald-400 transition-colors duration-200 text-left w-full"
                >
                  Alert System
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('reports')}
                  className="text-slate-300 hover:text-emerald-400 transition-colors duration-200 text-left w-full"
                >
                  Citizen Reports
                </button>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button 
                  onClick={() => handleNavigation('iot')}
                  className="text-slate-300 hover:text-emerald-400 transition-colors duration-200 text-left w-full"
                >
                  IoT Sensor Networks
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('analytics')}
                  className="text-slate-300 hover:text-emerald-400 transition-colors duration-200 text-left w-full"
                >
                  Predictive Analytics
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('voice')}
                  className="text-slate-300 hover:text-emerald-400 transition-colors duration-200 text-left w-full"
                >
                  Voice Interface
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('security')}
                  className="text-slate-300 hover:text-emerald-400 transition-colors duration-200 text-left w-full"
                >
                  Security & Privacy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleExternalLink('https://github.com/your-username/ecoguard-pro')}
                  className="text-slate-300 hover:text-emerald-400 transition-colors duration-200 text-left w-full"
                >
                  API Documentation
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contact</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <a 
                  href="mailto:fahadkhalid695@gmail.com" 
                  className="text-slate-300 hover:text-emerald-400 transition-colors duration-200"
                >
                  fahadkhalid695@gmail.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <a 
                  href="tel:+923004343753" 
                  className="text-slate-300 hover:text-emerald-400 transition-colors duration-200"
                >
                  +92300-4343753
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-300">Lahore, Punjab, Pakistan</span>
              </div>
              <div className="flex items-center space-x-3">
                <Globe className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <a 
                  href="https://www.ecoguard.pro" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-emerald-400 transition-colors duration-200"
                >
                  www.ecoguard.pro
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div className="pt-4">
              <h5 className="text-sm font-semibold mb-3">Follow Us</h5>
              <div className="flex space-x-3">
                <button 
                  onClick={() => handleExternalLink('https://twitter.com/ecoguardpro')}
                  className="w-8 h-8 bg-slate-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-colors duration-200"
                  aria-label="Twitter"
                >
                  <span className="text-xs">𝕏</span>
                </button>
                <button 
                  onClick={() => handleExternalLink('https://github.com/your-username/ecoguard-pro')}
                  className="w-8 h-8 bg-slate-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-colors duration-200"
                  aria-label="GitHub"
                >
                  <span className="text-xs">⚡</span>
                </button>
                <button 
                  onClick={() => handleExternalLink('https://linkedin.com/company/ecoguard-pro')}
                  className="w-8 h-8 bg-slate-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-colors duration-200"
                  aria-label="LinkedIn"
                >
                  <span className="text-xs">💼</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-800 mt-12 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="text-sm text-slate-400 text-center lg:text-left">
              © {currentYear} EcoGuard Pro. All rights reserved.
            </div>
            
            <div className="flex flex-wrap items-center justify-center lg:justify-end space-x-6 text-sm">
              <button 
                onClick={() => handlePolicyClick('privacy')}
                className="text-slate-400 hover:text-emerald-400 transition-colors duration-200"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => handlePolicyClick('terms')}
                className="text-slate-400 hover:text-emerald-400 transition-colors duration-200"
              >
                Terms of Service
              </button>
              <button 
                onClick={() => handlePolicyClick('cookies')}
                className="text-slate-400 hover:text-emerald-400 transition-colors duration-200"
              >
                Cookie Policy
              </button>
            </div>

            <div className="text-sm text-slate-400 text-center lg:text-right">
              Version 1.0.0
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;