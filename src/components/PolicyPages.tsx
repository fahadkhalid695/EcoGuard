import React from 'react';
import { Shield, Eye, Cookie, ArrowLeft } from 'lucide-react';

interface PolicyPagesProps {
  policyType: 'privacy' | 'terms' | 'cookies';
  onBack: () => void;
}

const PolicyPages: React.FC<PolicyPagesProps> = ({ policyType, onBack }) => {
  const renderPrivacyPolicy = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Eye className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
        </div>
        <p className="text-blue-100 text-lg">
          Your privacy is important to us. This policy explains how we collect, use, and protect your data.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-gray-700">
        <div className="prose dark:prose-invert max-w-none">
          <h2>Information We Collect</h2>
          <p>EcoGuard Pro collects the following types of information:</p>
          <ul>
            <li><strong>Environmental Data:</strong> Sensor readings, timestamps, and location data</li>
            <li><strong>Device Information:</strong> Sensor IDs, battery levels, and connectivity status</li>
            <li><strong>Usage Data:</strong> How you interact with our platform and features used</li>
            <li><strong>Account Information:</strong> Email address and authentication credentials</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>We use collected information to:</p>
          <ul>
            <li>Provide real-time environmental monitoring services</li>
            <li>Generate AI-powered insights and predictions</li>
            <li>Send alerts and notifications about environmental conditions</li>
            <li>Improve our platform and develop new features</li>
            <li>Ensure security and prevent unauthorized access</li>
          </ul>

          <h2>Data Protection</h2>
          <p>We implement industry-standard security measures:</p>
          <ul>
            <li><strong>Encryption:</strong> All data is encrypted using AES-256 encryption</li>
            <li><strong>Access Control:</strong> Role-based permissions and authentication</li>
            <li><strong>Data Anonymization:</strong> Personal identifiers are removed from sensor data</li>
            <li><strong>Secure Storage:</strong> Data is stored in secure, compliant data centers</li>
          </ul>

          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate information</li>
            <li>Delete your account and associated data</li>
            <li>Export your data in a portable format</li>
            <li>Opt-out of non-essential data collection</li>
          </ul>

          <h2>Contact Us</h2>
          <p>If you have questions about this privacy policy, contact us at:</p>
          <p><strong>Email:</strong> privacy@ecoguard.pro<br />
          <strong>Address:</strong> 123 Environmental Way, San Francisco, CA 94105</p>
        </div>
      </div>
    </div>
  );

  const renderTermsOfService = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Terms of Service</h1>
        </div>
        <p className="text-green-100 text-lg">
          These terms govern your use of EcoGuard Pro environmental monitoring platform.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-gray-700">
        <div className="prose dark:prose-invert max-w-none">
          <h2>Acceptance of Terms</h2>
          <p>By accessing and using EcoGuard Pro, you accept and agree to be bound by the terms and provision of this agreement.</p>

          <h2>Use License</h2>
          <p>Permission is granted to temporarily use EcoGuard Pro for personal and commercial environmental monitoring purposes. This license shall automatically terminate if you violate any of these restrictions.</p>

          <h2>Disclaimer</h2>
          <p>The materials on EcoGuard Pro are provided on an 'as is' basis. EcoGuard Pro makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>

          <h2>Limitations</h2>
          <p>In no event shall EcoGuard Pro or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use EcoGuard Pro, even if EcoGuard Pro or an authorized representative has been notified orally or in writing of the possibility of such damage.</p>

          <h2>Accuracy of Materials</h2>
          <p>The materials appearing on EcoGuard Pro could include technical, typographical, or photographic errors. EcoGuard Pro does not warrant that any of the materials on its platform are accurate, complete, or current.</p>

          <h2>User Responsibilities</h2>
          <p>Users are responsible for:</p>
          <ul>
            <li>Proper installation and maintenance of sensors</li>
            <li>Accurate interpretation of environmental data</li>
            <li>Compliance with local environmental regulations</li>
            <li>Protecting their account credentials</li>
          </ul>

          <h2>Modifications</h2>
          <p>EcoGuard Pro may revise these terms of service at any time without notice. By using this platform, you are agreeing to be bound by the then current version of these terms of service.</p>
        </div>
      </div>
    </div>
  );

  const renderCookiePolicy = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Cookie className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Cookie Policy</h1>
        </div>
        <p className="text-purple-100 text-lg">
          Learn about how we use cookies to improve your experience on EcoGuard Pro.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-gray-700">
        <div className="prose dark:prose-invert max-w-none">
          <h2>What Are Cookies</h2>
          <p>Cookies are small text files that are placed on your computer or mobile device when you visit our website. They are widely used to make websites work more efficiently and provide information to website owners.</p>

          <h2>How We Use Cookies</h2>
          <p>EcoGuard Pro uses cookies for the following purposes:</p>
          
          <h3>Essential Cookies</h3>
          <ul>
            <li><strong>Authentication:</strong> Remember your login status</li>
            <li><strong>Security:</strong> Protect against cross-site request forgery</li>
            <li><strong>Preferences:</strong> Store your theme and language settings</li>
          </ul>

          <h3>Analytics Cookies</h3>
          <ul>
            <li><strong>Usage Analytics:</strong> Understand how you use our platform</li>
            <li><strong>Performance Monitoring:</strong> Track page load times and errors</li>
            <li><strong>Feature Usage:</strong> See which features are most popular</li>
          </ul>

          <h3>Functional Cookies</h3>
          <ul>
            <li><strong>Dashboard Layout:</strong> Remember your customized dashboard</li>
            <li><strong>Alert Preferences:</strong> Store your notification settings</li>
            <li><strong>Data Filters:</strong> Remember your preferred data views</li>
          </ul>

          <h2>Managing Cookies</h2>
          <p>You can control and manage cookies in several ways:</p>
          <ul>
            <li><strong>Browser Settings:</strong> Most browsers allow you to block or delete cookies</li>
            <li><strong>Platform Settings:</strong> Use our cookie preferences center</li>
            <li><strong>Opt-out Tools:</strong> Use third-party opt-out tools for analytics</li>
          </ul>

          <h2>Third-Party Cookies</h2>
          <p>We may use third-party services that set cookies:</p>
          <ul>
            <li><strong>Google Analytics:</strong> For usage analytics and insights</li>
            <li><strong>Supabase:</strong> For authentication and data storage</li>
            <li><strong>CDN Services:</strong> For faster content delivery</li>
          </ul>

          <h2>Cookie Retention</h2>
          <p>Different cookies have different retention periods:</p>
          <ul>
            <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
            <li><strong>Persistent Cookies:</strong> Stored for up to 2 years</li>
            <li><strong>Authentication Cookies:</strong> Expire after 30 days of inactivity</li>
          </ul>

          <h2>Updates to This Policy</h2>
          <p>We may update this cookie policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 transition-colors duration-200"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Dashboard</span>
      </button>

      {policyType === 'privacy' && renderPrivacyPolicy()}
      {policyType === 'terms' && renderTermsOfService()}
      {policyType === 'cookies' && renderCookiePolicy()}
    </div>
  );
};

export default PolicyPages;