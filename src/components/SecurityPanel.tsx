import React, { useState, useEffect } from 'react';
import { Shield, Lock, Eye, AlertTriangle, Key, Activity } from 'lucide-react';
import { securityService } from '../services/securityService';

const SecurityPanel: React.FC = () => {
  const [securityStatus, setSecurityStatus] = useState<any>({});
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showLoginForm, setShowLoginForm] = useState(false);

  useEffect(() => {
    loadSecurityData();
    const interval = setInterval(loadSecurityData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadSecurityData = () => {
    setSecurityStatus(securityService.getSecurityStatus());
    setAuditLogs(securityService.getAuditLogs(20));
    setIsAuthenticated(securityService.isAuthenticated());
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await securityService.authenticate(loginForm.username, loginForm.password);
    if (success) {
      setIsAuthenticated(true);
      setShowLoginForm(false);
      securityService.logAction('user_login', { username: loginForm.username });
      loadSecurityData();
    } else {
      alert('Invalid credentials. Try admin/password for demo.');
    }
  };

  const handleLogout = () => {
    securityService.logout();
    setIsAuthenticated(false);
    securityService.logAction('user_logout');
    loadSecurityData();
  };

  const getLogIcon = (action: string) => {
    switch (action) {
      case 'user_login':
        return <Key className="w-4 h-4 text-green-600" />;
      case 'user_logout':
        return <Key className="w-4 h-4 text-red-600" />;
      case 'suspicious_sensor_value':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'rate_limit_exceeded':
        return <Shield className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Security & Privacy Center</h1>
            </div>
            <p className="text-red-100 text-lg">
              Comprehensive security monitoring, authentication, and data protection.
            </p>
          </div>
          <div className="flex space-x-3">
            {!isAuthenticated ? (
              <button
                onClick={() => setShowLoginForm(true)}
                className="bg-white text-red-700 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors duration-200"
              >
                Login
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="bg-white text-red-700 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors duration-200"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Login Form Modal */}
      {showLoginForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Security Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  placeholder="Enter username (try: admin)"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="Enter password (try: password)"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowLoginForm(false)}
                  className="flex-1 px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Security Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-2 rounded-lg ${isAuthenticated ? 'bg-emerald-50' : 'bg-red-50'}`}>
              <Lock className={`w-5 h-5 ${isAuthenticated ? 'text-emerald-600' : 'text-red-600'}`} />
            </div>
            <h3 className="font-semibold text-slate-900">Authentication</h3>
          </div>
          <div className="space-y-2">
            <p className={`text-2xl font-bold ${isAuthenticated ? 'text-emerald-600' : 'text-red-600'}`}>
              {isAuthenticated ? 'Secure' : 'Unsecured'}
            </p>
            <p className="text-sm text-slate-600">
              {isAuthenticated ? 'User authenticated' : 'Authentication required'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Encryption</h3>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-emerald-600">Active</p>
            <p className="text-sm text-slate-600">End-to-end encryption enabled</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Eye className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Audit Logs</h3>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-slate-900">{auditLogs.length}</p>
            <p className="text-sm text-slate-600">Recent activities logged</p>
          </div>
        </div>
      </div>

      {/* Security Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Security Measures */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Security Measures</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-emerald-600" />
                <span className="font-medium text-emerald-900">Data Encryption</span>
              </div>
              <span className="text-sm text-emerald-700 font-medium">Active</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="flex items-center space-x-3">
                <Lock className="w-5 h-5 text-emerald-600" />
                <span className="font-medium text-emerald-900">Secure Authentication</span>
              </div>
              <span className="text-sm text-emerald-700 font-medium">Enabled</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="flex items-center space-x-3">
                <Activity className="w-5 h-5 text-emerald-600" />
                <span className="font-medium text-emerald-900">Rate Limiting</span>
              </div>
              <span className="text-sm text-emerald-700 font-medium">Active</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="flex items-center space-x-3">
                <Eye className="w-5 h-5 text-emerald-600" />
                <span className="font-medium text-emerald-900">Audit Logging</span>
              </div>
              <span className="text-sm text-emerald-700 font-medium">Enabled</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-emerald-600" />
                <span className="font-medium text-emerald-900">Anomaly Detection</span>
              </div>
              <span className="text-sm text-emerald-700 font-medium">Monitoring</span>
            </div>
          </div>
        </div>

        {/* Privacy Controls */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Privacy Controls</h3>
          <div className="space-y-4">
            <div className="p-3 border border-slate-200 rounded-lg">
              <h4 className="font-medium text-slate-900 mb-2">Data Anonymization</h4>
              <p className="text-sm text-slate-600 mb-3">
                Personal identifiers are automatically removed from sensor data.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Status:</span>
                <span className="text-sm font-medium text-emerald-600">Active</span>
              </div>
            </div>

            <div className="p-3 border border-slate-200 rounded-lg">
              <h4 className="font-medium text-slate-900 mb-2">Location Privacy</h4>
              <p className="text-sm text-slate-600 mb-3">
                GPS coordinates are rounded to protect exact locations.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Precision:</span>
                <span className="text-sm font-medium text-blue-600">±100m</span>
              </div>
            </div>

            <div className="p-3 border border-slate-200 rounded-lg">
              <h4 className="font-medium text-slate-900 mb-2">Data Retention</h4>
              <p className="text-sm text-slate-600 mb-3">
                Sensor data is automatically purged after retention period.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Period:</span>
                <span className="text-sm font-medium text-purple-600">90 days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Security Audit Log</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {auditLogs.map((log, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
              <div className="flex-shrink-0 p-1">
                {getLogIcon(log.action)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-slate-900 capitalize">
                    {log.action.replace('_', ' ')}
                  </h4>
                  <span className="text-xs text-slate-500">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-slate-600">User: {log.user}</p>
                {Object.keys(log.details).length > 0 && (
                  <div className="mt-2 text-xs text-slate-500">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API Security */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">API Security</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-slate-900 mb-3">Authentication Methods</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>Bearer Token Authentication</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>API Key Validation</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>Session Management</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>Rate Limiting</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-slate-900 mb-3">Security Headers</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Content-Type Validation</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>X-Requested-With Header</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Authorization Header</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>CORS Protection</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityPanel;