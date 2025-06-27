import React, { useEffect } from 'react';
import { ArrowLeft, Eye, Shield, Lock, Database, Users, Globe } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 transition-colors duration-200 mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
          <span className="font-medium">Back to Dashboard</span>
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white mb-8 slide-in-up">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Eye className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-heading font-bold">Privacy Policy</h1>
              <p className="text-blue-100 text-lg mt-2">Last updated: January 15, 2024</p>
            </div>
          </div>
          <p className="text-blue-100 text-xl leading-relaxed">
            Your privacy is important to us. This policy explains how EcoGuard Pro collects, uses, and protects your personal information.
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-slate-200 dark:border-gray-700 overflow-hidden slide-in-up stagger-1">
          <div className="p-8 lg:p-12">
            <div className="prose dark:prose-invert max-w-none">
              
              {/* Information We Collect */}
              <section className="mb-12">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-gray-100 m-0">Information We Collect</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">Environmental Data</h3>
                    <ul className="space-y-2 text-blue-800 dark:text-blue-200">
                      <li>• Sensor readings and measurements</li>
                      <li>• Timestamps and location data</li>
                      <li>• Air quality, water quality, noise levels</li>
                      <li>• Energy consumption metrics</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700">
                    <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">Device Information</h3>
                    <ul className="space-y-2 text-green-800 dark:text-green-200">
                      <li>• Sensor IDs and device identifiers</li>
                      <li>• Battery levels and connectivity status</li>
                      <li>• Calibration dates and maintenance schedules</li>
                      <li>• Network connection information</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
                    <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-3">Usage Data</h3>
                    <ul className="space-y-2 text-purple-800 dark:text-purple-200">
                      <li>• Platform interaction patterns</li>
                      <li>• Feature usage statistics</li>
                      <li>• Dashboard customization preferences</li>
                      <li>• Voice command history</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-700">
                    <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-3">Account Information</h3>
                    <ul className="space-y-2 text-amber-800 dark:text-amber-200">
                      <li>• Email address and authentication credentials</li>
                      <li>• User preferences and settings</li>
                      <li>• Alert notification preferences</li>
                      <li>• Role and permission levels</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* How We Use Information */}
              <section className="mb-12">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-gray-100 m-0">How We Use Your Information</h2>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700 mb-6">
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4">Primary Uses</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <span className="text-green-800 dark:text-green-200">Provide real-time environmental monitoring services</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <span className="text-green-800 dark:text-green-200">Generate AI-powered insights and predictions</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <span className="text-green-800 dark:text-green-200">Send alerts about environmental conditions</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <span className="text-green-800 dark:text-green-200">Improve platform performance and features</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <span className="text-green-800 dark:text-green-200">Ensure security and prevent unauthorized access</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <span className="text-green-800 dark:text-green-200">Provide customer support and assistance</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Data Protection */}
              <section className="mb-12">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Lock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-gray-100 m-0">Data Protection & Security</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
                    <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4">Encryption & Security</h3>
                    <ul className="space-y-2 text-purple-800 dark:text-purple-200">
                      <li><strong>AES-256 Encryption:</strong> All data encrypted at rest and in transit</li>
                      <li><strong>Secure Authentication:</strong> Multi-factor authentication support</li>
                      <li><strong>Access Control:</strong> Role-based permissions and audit logging</li>
                      <li><strong>Regular Security Audits:</strong> Continuous monitoring and updates</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-700">
                    <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-4">Data Anonymization</h3>
                    <ul className="space-y-2 text-indigo-800 dark:text-indigo-200">
                      <li><strong>Personal Identifiers:</strong> Automatically removed from sensor data</li>
                      <li><strong>Location Privacy:</strong> GPS coordinates rounded to protect privacy</li>
                      <li><strong>Data Minimization:</strong> Only necessary data is collected</li>
                      <li><strong>Secure Storage:</strong> Data stored in compliant data centers</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Your Rights */}
              <section className="mb-12">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-gray-100 m-0">Your Privacy Rights</h2>
                </div>
                
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 mb-3">Data Access & Control</h3>
                      <ul className="space-y-2 text-emerald-800 dark:text-emerald-200">
                        <li>✓ Access your personal data</li>
                        <li>✓ Correct inaccurate information</li>
                        <li>✓ Delete your account and data</li>
                        <li>✓ Export data in portable format</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 mb-3">Privacy Controls</h3>
                      <ul className="space-y-2 text-emerald-800 dark:text-emerald-200">
                        <li>✓ Opt-out of non-essential data collection</li>
                        <li>✓ Control notification preferences</li>
                        <li>✓ Manage data sharing settings</li>
                        <li>✓ Request data anonymization</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* International Compliance */}
              <section className="mb-12">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-gray-100 m-0">International Compliance</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700 text-center">
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">GDPR Compliant</h3>
                    <p className="text-blue-800 dark:text-blue-200 text-sm">European Union General Data Protection Regulation compliance</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700 text-center">
                    <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-3">CCPA Compliant</h3>
                    <p className="text-purple-800 dark:text-purple-200 text-sm">California Consumer Privacy Act compliance</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700 text-center">
                    <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">PIPEDA Ready</h3>
                    <p className="text-green-800 dark:text-green-200 text-sm">Personal Information Protection and Electronic Documents Act</p>
                  </div>
                </div>
              </section>

              {/* Contact Information */}
              <section className="mb-8">
                <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-gray-100 mb-6">Contact Us</h2>
                <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-slate-200 dark:border-gray-600">
                  <p className="text-slate-700 dark:text-gray-300 mb-4">
                    If you have questions about this privacy policy or our data practices, please contact us:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-gray-100 mb-2">Email</h3>
                      <p className="text-blue-600 dark:text-blue-400">fahadkhalid695@gmail.com</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-gray-100 mb-2">Address</h3>
                      <p className="text-slate-700 dark:text-gray-300">
                        Lahore, Punjab<br />
                        Pakistan
                      </p>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;