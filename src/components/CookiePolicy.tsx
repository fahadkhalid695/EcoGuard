import React, { useEffect } from 'react';
import { ArrowLeft, Cookie, Settings, BarChart3, Shield, Globe, Eye } from 'lucide-react';

interface CookiePolicyProps {
  onBack: () => void;
}

const CookiePolicy: React.FC<CookiePolicyProps> = ({ onBack }) => {
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
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-8 text-white mb-8 slide-in-up">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Cookie className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-heading font-bold">Cookie Policy</h1>
              <p className="text-purple-100 text-lg mt-2">Last updated: January 15, 2024</p>
            </div>
          </div>
          <p className="text-purple-100 text-xl leading-relaxed">
            Learn about how we use cookies to improve your experience on EcoGuard Pro.
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-slate-200 dark:border-gray-700 overflow-hidden slide-in-up stagger-1">
          <div className="p-8 lg:p-12">
            <div className="prose dark:prose-invert max-w-none">
              
              {/* What Are Cookies */}
              <section className="mb-12">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Cookie className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-gray-100 m-0">What Are Cookies</h2>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
                  <p className="text-purple-800 dark:text-purple-200 text-lg leading-relaxed mb-4">
                    Cookies are small text files that are placed on your computer or mobile device when you visit our website. 
                    They are widely used to make websites work more efficiently and provide information to website owners.
                  </p>
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                    <p className="text-purple-700 dark:text-purple-300 text-sm">
                      <strong>Technical Note:</strong> Cookies contain information that is transferred to your computer's hard drive. 
                      They help us recognize you when you return to our site and remember your preferences.
                    </p>
                  </div>
                </div>
              </section>

              {/* Types of Cookies */}
              <section className="mb-12">
                <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-gray-100 mb-6">Types of Cookies We Use</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Essential Cookies */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                        <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">Essential Cookies</h3>
                    </div>
                    <p className="text-green-800 dark:text-green-200 text-sm mb-4">
                      These cookies are necessary for the website to function and cannot be switched off.
                    </p>
                    <ul className="space-y-2 text-green-700 dark:text-green-300 text-sm">
                      <li>• Authentication and login status</li>
                      <li>• Security and fraud prevention</li>
                      <li>• Theme and language preferences</li>
                      <li>• Shopping cart and session data</li>
                    </ul>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Analytics Cookies</h3>
                    </div>
                    <p className="text-blue-800 dark:text-blue-200 text-sm mb-4">
                      Help us understand how visitors interact with our website.
                    </p>
                    <ul className="space-y-2 text-blue-700 dark:text-blue-300 text-sm">
                      <li>• Page views and user behavior</li>
                      <li>• Performance monitoring</li>
                      <li>• Feature usage statistics</li>
                      <li>• Error tracking and debugging</li>
                    </ul>
                  </div>

                  {/* Functional Cookies */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-700">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-amber-100 dark:bg-amber-800 rounded-lg">
                        <Settings className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">Functional Cookies</h3>
                    </div>
                    <p className="text-amber-800 dark:text-amber-200 text-sm mb-4">
                      Enable enhanced functionality and personalization.
                    </p>
                    <ul className="space-y-2 text-amber-700 dark:text-amber-300 text-sm">
                      <li>• Dashboard layout preferences</li>
                      <li>• Alert notification settings</li>
                      <li>• Data filter preferences</li>
                      <li>• Customized user interface</li>
                    </ul>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl p-6 border border-pink-200 dark:border-pink-700">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-pink-100 dark:bg-pink-800 rounded-lg">
                        <Globe className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-pink-900 dark:text-pink-100">Marketing Cookies</h3>
                    </div>
                    <p className="text-pink-800 dark:text-pink-200 text-sm mb-4">
                      Used to deliver relevant advertisements and track campaigns.
                    </p>
                    <ul className="space-y-2 text-pink-700 dark:text-pink-300 text-sm">
                      <li>• Targeted advertising</li>
                      <li>• Social media integration</li>
                      <li>• Campaign effectiveness</li>
                      <li>• Cross-platform tracking</li>
                    </ul>
                  </div>

                </div>
              </section>

              {/* Cookie Details */}
              <section className="mb-12">
                <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-gray-100 mb-6">Detailed Cookie Information</h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-300 dark:border-gray-600 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-gradient-to-r from-slate-100 to-gray-100 dark:from-gray-700 dark:to-gray-600">
                        <th className="border border-slate-300 dark:border-gray-600 px-4 py-3 text-left font-semibold text-slate-900 dark:text-gray-100">Cookie Name</th>
                        <th className="border border-slate-300 dark:border-gray-600 px-4 py-3 text-left font-semibold text-slate-900 dark:text-gray-100">Purpose</th>
                        <th className="border border-slate-300 dark:border-gray-600 px-4 py-3 text-left font-semibold text-slate-900 dark:text-gray-100">Duration</th>
                        <th className="border border-slate-300 dark:border-gray-600 px-4 py-3 text-left font-semibold text-slate-900 dark:text-gray-100">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="hover:bg-slate-50 dark:hover:bg-gray-700">
                        <td className="border border-slate-300 dark:border-gray-600 px-4 py-3 font-mono text-sm">ecoguard_session</td>
                        <td className="border border-slate-300 dark:border-gray-600 px-4 py-3 text-sm">User authentication and session management</td>
                        <td className="border border-slate-300 dark:border-gray-600 px-4 py-3 text-sm">30 days</td>
                        <td className="border border-slate-300 dark:border-gray-600 px-4 py-3 text-sm">Essential</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-gray-700">
                        <td className="border border-slate-300 dark:border-gray-600 px-4 py-3 font-mono text-sm">ecoguard_theme</td>
                        <td className="border border-slate-300 dark:border-gray-600 px-4 py-3 text-sm">Remember dark/light mode preference</td>
                        <td className="border border-slate-300 dark:border-gray-600 px-4 py-3 text-sm">1 year</td>
                        <td className="border border-slate-300 dark:border-gray-600 px-4 py-3 text-sm">Functional</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-gray-700">
                        <td className="border border-slate-300 dark:border-gray-600 px-4 py-3 font-mono text-sm">_ga</td>
                        <td className="border border-slate-300 dark:border-gray-600 px-4 py-3 text-sm">Google Analytics - distinguish users</td>
                        <td className="border border-slate-300 dark:border-gray-600 px-4 py-3 text-sm">2 years</td>
                        <td className="border border-slate-300 dark:border-gray-600 px-4 py-3 text-sm">Analytics</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-gray-700">
                        <td className="border border-slate-300 dark:border-gray-600 px-4 py-3 font-mono text-sm">dashboard_layout</td>
                        <td className="border border-slate-300 dark:border-gray-600 px-4 py-3 text-sm">Save customized dashboard configuration</td>
                        <td className="border border-slate-300 dark:border-gray-600 px-4 py-3 text-sm">6 months</td>
                        <td className="border border-slate-300 dark:border-gray-600 px-4 py-3 text-sm">Functional</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Managing Cookies */}
              <section className="mb-12">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <Settings className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-gray-100 m-0">Managing Your Cookie Preferences</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-700">
                    <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-4">Browser Settings</h3>
                    <p className="text-indigo-800 dark:text-indigo-200 text-sm mb-4">
                      Most browsers allow you to control cookies through their settings preferences.
                    </p>
                    <ul className="space-y-2 text-indigo-700 dark:text-indigo-300 text-sm">
                      <li>• Block all cookies</li>
                      <li>• Block third-party cookies</li>
                      <li>• Delete existing cookies</li>
                      <li>• Set cookie expiration preferences</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700">
                    <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4">Platform Settings</h3>
                    <p className="text-green-800 dark:text-green-200 text-sm mb-4">
                      Use our cookie preferences center to customize your experience.
                    </p>
                    <div className="space-y-3">
                      <button className="w-full bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-200 dark:hover:bg-green-700 transition-colors duration-200">
                        Cookie Preferences Center
                      </button>
                      <p className="text-green-700 dark:text-green-300 text-xs">
                        Customize which cookies you want to accept
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Third-Party Cookies */}
              <section className="mb-12">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <Globe className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-gray-100 m-0">Third-Party Services</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-700">
                    <p className="text-orange-800 dark:text-orange-200 leading-relaxed mb-4">
                      We may use third-party services that set cookies on our behalf. These services help us provide 
                      better functionality and analyze how our platform is used.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                        <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">Google Analytics</h4>
                        <p className="text-orange-700 dark:text-orange-300 text-sm">
                          Usage analytics and insights
                        </p>
                        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 text-xs hover:underline">
                          Privacy Policy
                        </a>
                      </div>
                      
                      <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                        <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">Supabase</h4>
                        <p className="text-orange-700 dark:text-orange-300 text-sm">
                          Authentication and data storage
                        </p>
                        <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 text-xs hover:underline">
                          Privacy Policy
                        </a>
                      </div>
                      
                      <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                        <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">CDN Services</h4>
                        <p className="text-orange-700 dark:text-orange-300 text-sm">
                          Faster content delivery
                        </p>
                        <span className="text-gray-500 dark:text-gray-400 text-xs">
                          Various providers
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Cookie Retention */}
              <section className="mb-12">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-gray-100 m-0">Cookie Retention Periods</h2>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">S</span>
                      </div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Session Cookies</h3>
                      <p className="text-blue-800 dark:text-blue-200 text-sm">
                        Deleted when you close your browser
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">P</span>
                      </div>
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Persistent Cookies</h3>
                      <p className="text-purple-800 dark:text-purple-200 text-sm">
                        Stored for up to 2 years
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">A</span>
                      </div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Authentication</h3>
                      <p className="text-green-800 dark:text-green-200 text-sm">
                        Expire after 30 days of inactivity
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Updates */}
              <section className="mb-12">
                <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-gray-100 mb-6">Updates to This Policy</h2>
                
                <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-slate-200 dark:border-gray-600">
                  <p className="text-slate-700 dark:text-gray-300 leading-relaxed mb-4">
                    We may update this cookie policy from time to time to reflect changes in our practices or for other 
                    operational, legal, or regulatory reasons. We will notify you of any changes by posting the new policy on this page.
                  </p>
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                    <p className="text-slate-600 dark:text-gray-400 text-sm">
                      <strong>Last Updated:</strong> January 15, 2024 | 
                      <strong> Next Review:</strong> July 15, 2024
                    </p>
                  </div>
                </div>
              </section>

              {/* Contact Information */}
              <section className="mb-8">
                <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-gray-100 mb-6">Questions About Cookies</h2>
                <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-slate-200 dark:border-gray-600">
                  <p className="text-slate-700 dark:text-gray-300 mb-4">
                    If you have any questions about our use of cookies or this policy, please contact us:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-gray-100 mb-2">Email</h3>
                      <p className="text-blue-600 dark:text-blue-400">fahadkhalid695@gmail.com</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-gray-100 mb-2">Phone</h3>
                      <p className="text-slate-700 dark:text-gray-300">+92300-4343753</p>
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

export default CookiePolicy;