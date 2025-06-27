import React, { useState } from 'react';
import { MessageSquare, Plus, MapPin, Clock, Camera, Send } from 'lucide-react';

const CitizenReports: React.FC = () => {
  const [showReportForm, setShowReportForm] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    location: '',
    description: '',
    severity: 'medium'
  });

  const reports = [
    {
      id: 1,
      type: 'noise',
      title: 'Construction Noise During Night Hours',
      description: 'Heavy machinery operating past permitted hours in residential area, causing sleep disturbance.',
      location: 'Maple Street, Block 15',
      timestamp: '2024-01-15T23:30:00Z',
      severity: 'high',
      status: 'investigating',
      reporter: 'Anonymous',
      votes: 12,
      images: 1
    },
    {
      id: 2,
      type: 'air',
      title: 'Strong Chemical Odor',
      description: 'Persistent chemical smell in the area, possibly from nearby industrial facility.',
      location: 'Industrial Park, Zone B',
      timestamp: '2024-01-15T16:45:00Z',
      severity: 'medium',
      status: 'verified',
      reporter: 'John D.',
      votes: 8,
      images: 2
    },
    {
      id: 3,
      type: 'water',
      title: 'Water Discoloration in Fountain',
      description: 'Public fountain water appears cloudy and has unusual brownish tint.',
      location: 'Central Park, Main Fountain',
      timestamp: '2024-01-15T14:20:00Z',
      severity: 'medium',
      status: 'resolved',
      reporter: 'Sarah M.',
      votes: 5,
      images: 3
    },
    {
      id: 4,
      type: 'noise',
      title: 'Loud Music from Event',
      description: 'Outdoor event playing music at excessive volume levels.',
      location: 'Community Center Plaza',
      timestamp: '2024-01-15T19:15:00Z',
      severity: 'low',
      status: 'acknowledged',
      reporter: 'Mike R.',
      votes: 3,
      images: 0
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'air':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'water':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'noise':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'investigating':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'verified':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'acknowledged':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ago`;
    }
    return `${minutes}m ago`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Report submitted:', formData);
    setShowReportForm(false);
    setFormData({ type: '', location: '', description: '', severity: 'medium' });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <MessageSquare className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Citizen Reports</h1>
            </div>
            <p className="text-emerald-100 text-lg">
              Community-driven environmental monitoring and incident reporting platform.
            </p>
          </div>
          <button
            onClick={() => setShowReportForm(true)}
            className="flex items-center space-x-2 bg-white text-emerald-700 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors duration-200"
          >
            <Plus className="w-5 h-5" />
            <span>Report Issue</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Total Reports</h3>
          <p className="text-3xl font-bold text-slate-900">{reports.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">This Week</h3>
          <p className="text-3xl font-bold text-blue-600">23</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Resolved</h3>
          <p className="text-3xl font-bold text-emerald-600">{reports.filter(r => r.status === 'resolved').length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Under Review</h3>
          <p className="text-3xl font-bold text-amber-600">{reports.filter(r => r.status === 'investigating').length}</p>
        </div>
      </div>

      {/* Report Form Modal */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Report Environmental Issue</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Issue Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                >
                  <option value="">Select type...</option>
                  <option value="air">Air Quality</option>
                  <option value="water">Water Quality</option>
                  <option value="noise">Noise Pollution</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Enter location or address"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Severity</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the environmental issue in detail..."
                  rows={4}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex items-center space-x-2 p-3 border-2 border-dashed border-slate-300 rounded-lg">
                <Camera className="w-5 h-5 text-slate-400" />
                <span className="text-sm text-slate-600">Add photos (optional)</span>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  className="flex-1 px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors duration-200"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Report</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reports List */}
      <div className="space-y-6">
        {reports.map((report) => (
          <div key={report.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className={`px-2 py-1 text-xs font-medium border rounded-full ${getTypeColor(report.type)}`}>
                    {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium border rounded-full ${getSeverityColor(report.severity)}`}>
                    {report.severity.charAt(0).toUpperCase() + report.severity.slice(1)}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium border rounded-full ${getStatusColor(report.status)}`}>
                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{report.title}</h3>
                <p className="text-slate-700 mb-4">{report.description}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-slate-600">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{report.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(report.timestamp)}</span>
                </div>
                {report.images > 0 && (
                  <div className="flex items-center space-x-1">
                    <Camera className="w-4 h-4" />
                    <span>{report.images} image{report.images > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <span>By: {report.reporter}</span>
                <span>👍 {report.votes}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CitizenReports;