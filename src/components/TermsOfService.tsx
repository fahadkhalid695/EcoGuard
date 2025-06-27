import React, { useEffect } from 'react';
import { ArrowLeft, Shield, Scale, FileText, AlertTriangle, Users, Gavel } from 'lucide-react';

interface TermsOfServiceProps {
  onBack: () => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
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
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-8 text-white mb-8 slide-in-up">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-heading font-bold">Terms of Service</h1>
              <p className="text-green-100 text-lg mt-2">Last updated: January 15, 2024</p>
            </div>
          </div>
          <p className="text-green-100 text-xl leading-relaxed">
            These terms govern your use of EcoGuard Pro environmental monitoring platform and services.
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-slate-200 dark:border-gray-700 overflow-hidden slide-in-up stagger-1">
          <div className="p-8 lg:p-12">
            <div className="prose dark:prose-invert max-w-none">
              
              {/* Acceptance of Terms */}
              <section className="mb-12">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-gray-100 m-0">Acceptance of Terms</h2>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700">
                  <p className="text-green-800 dark:text-green-200 text-lg leading-relaxed mb-4">
                    By accessing and using EcoGuard Pro, you accept and agree to be bound by the terms and provisions of this agreement. 
                    If you do not agree to abide by the above, please do not use this service.
                  </p>
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                    <p className="text-green-700 dark:text-green-300 text-sm">
                      <strong>Important:</strong> These terms constitute a legally binding agreement between you and EcoGuard Pro. 
                      Please read them carefully before using our services.
                    </p>
                  </div>
                </div>
              </section>

              {/* Use License */}
              <section className="mb-12">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Scale className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-gray-100 m-0">Use License</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">Permitted Uses</h3>
                    <ul className="space-y-2 text-blue-800 dark:text-blue-200">
                      <li>✓ Personal environmental monitoring</li>
                      <li>✓ Commercial environmental analysis</li>
                      <li>✓ Research and educational purposes</li>
                      <li>✓ Integration with existing systems</li>
                      <li>✓ Data export for reporting</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-red-200 dark:border-red-700">
                    <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-4">Prohibited Uses</h3>
                    <ul className="space-y-2 text-red-800 dark:text-red-200">
                      <li>✗ Reverse engineering the platform</li>
                      <li>✗ Unauthorized data scraping</li>
                      <li>✗ Malicious or harmful activities</li>
                      <li>✗ Violation of applicable laws</li>
                      <li>✗ Interference with system operation</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* User Responsibilities */}
              <section className="mb-12">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-gray-100 m-0">User Responsibilities</h2>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4">Technical Responsibilities</h3>
                      <ul className="space-y-3 text-purple-800 dark:text-purple-200">
                        <li className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                          <span>Proper installation and maintenance of sensors</span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                          <span>Accurate interpretation of environmental data</span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                          <span>Regular calibration of monitoring equipment</span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                          <span>Secure network configuration and access</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4">Legal Responsibilities</h3>
                      <ul className="space-y-3 text-purple-800 dark:text-purple-200">
                        <li className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                          <span>Compliance with local environmental regulations</span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                          <span>Protection of account credentials and data</span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                          <span>Responsible use of AI predictions and insights</span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                          <span>Reporting of system vulnerabilities or issues</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Disclaimer */}
              <section className="mb-12">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-gray-100 m-0">Disclaimer & Limitations</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-700">
                    <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-3">Service Disclaimer</h3>
                    <p className="text-amber-800 dark:text-amber-200 leading-relaxed">
                      The materials and services on EcoGuard Pro are provided on an 'as is' basis. EcoGuard Pro makes no warranties, 
                      expressed or implied, and hereby disclaims and negates all other warranties including without limitation, 
                      implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement 
                      of intellectual property or other violation of rights.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-red-200 dark:border-red-700">
                    <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-3">Limitation of Liability</h3>
                    <p className="text-red-800 dark:text-red-200 leading-relaxed">
                      In no event shall EcoGuard Pro or its suppliers be liable for any damages (including, without limitation, 
                      damages for loss of data or profit, or due to business interruption) arising out of the use or inability 
                      to use EcoGuard Pro, even if EcoGuard Pro or an authorized representative has been notified orally or in 
                      writing of the possibility of such damage.
                    </p>
                  </div>
                </div>
              </section>

              {/* Data Accuracy */}
              <section className="mb-12">
                <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-gray-100 mb-6">Data Accuracy & Reliability</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">Data Quality</h3>
                    <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                      While we strive for accuracy, environmental data may contain technical, typographical, or measurement errors. 
                      EcoGuard Pro does not warrant that any of the materials or data on its platform are accurate, complete, or current.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700">
                    <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">AI Predictions</h3>
                    <p className="text-green-800 dark:text-green-200 text-sm leading-relaxed">
                      AI-generated predictions and insights are based on historical data and algorithms. They should be used as 
                      guidance only and not as definitive forecasts. Users should exercise professional judgment in decision-making.
                    </p>
                  </div>
                </div>
              </section>

              {/* Modifications */}
              <section className="mb-12">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <Gavel className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-gray-100 m-0">Modifications & Updates</h2>
                </div>
                
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-700">
                  <p className="text-indigo-800 dark:text-indigo-200 leading-relaxed mb-4">
                    EcoGuard Pro may revise these terms of service at any time without notice. By using this platform, 
                    you are agreeing to be bound by the then current version of these terms of service.
                  </p>
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                    <p className="text-indigo-700 dark:text-indigo-300 text-sm">
                      <strong>Notification:</strong> We will notify users of significant changes to these terms via email 
                      and platform notifications at least 30 days before they take effect.
                    </p>
                  </div>
                </div>
              </section>

              {/* Governing Law */}
              <section className="mb-12">
                <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-gray-100 mb-6">Governing Law & Jurisdiction</h2>
                
                <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-slate-200 dark:border-gray-600">
                  <p className="text-slate-700 dark:text-gray-300 leading-relaxed mb-4">
                    These terms and conditions are governed by and construed in accordance with the laws of Pakistan, 
                    and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-gray-100 mb-2">Dispute Resolution</h3>
                      <p className="text-slate-600 dark:text-gray-400 text-sm">
                        Any disputes will be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-gray-100 mb-2">Severability</h3>
                      <p className="text-slate-600 dark:text-gray-400 text-sm">
                        If any provision of these terms is found to be unenforceable, the remaining provisions will remain in full force and effect.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Contact Information */}
              <section className="mb-8">
                <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-gray-100 mb-6">Contact Information</h2>
                <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-slate-200 dark:border-gray-600">
                  <p className="text-slate-700 dark:text-gray-300 mb-4">
                    If you have any questions about these Terms of Service, please contact us:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-gray-100 mb-2">Email</h3>
                      <p className="text-blue-600 dark:text-blue-400">fahadkhalid695@gmail.com</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-gray-100 mb-2">Phone</h3>
                      <p className="text-slate-700 dark:text-gray-300">
                        +92300-4343753
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

export default TermsOfService;