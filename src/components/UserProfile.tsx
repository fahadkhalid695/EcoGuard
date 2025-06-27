import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Building, Shield, Settings, LogOut, Edit3, Save, X, Camera, Key, Bell, Globe, ArrowLeft } from 'lucide-react';
import SubscriptionManagement from './SubscriptionManagement';
import { useAuth } from '../hooks/useAuth';

interface UserProfileProps {
  user: any;
  onLogout: () => void;
  onUpdateProfile: (updatedUser: any) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onLogout, onUpdateProfile }) => {
  const { updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    ...user,
    firstName: user.user_metadata?.firstName || '',
    lastName: user.user_metadata?.lastName || '',
    organization: user.user_metadata?.organization || ''
  });
  const [activeTab, setActiveTab] = useState('profile');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.user_metadata?.avatar || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [activeSessions, setActiveSessions] = useState([
    { id: 1, device: 'Chrome on Windows', location: 'San Francisco, CA', lastActive: 'Just now', current: true },
    { id: 2, device: 'Safari on iPhone', location: 'San Francisco, CA', lastActive: '2 hours ago', current: false },
    { id: 3, device: 'Firefox on MacOS', location: 'New York, NY', lastActive: '3 days ago', current: false }
  ]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Reset form when user changes
    setEditedUser({
      ...user,
      firstName: user.user_metadata?.firstName || '',
      lastName: user.user_metadata?.lastName || '',
      organization: user.user_metadata?.organization || ''
    });
    setAvatarPreview(user.user_metadata?.avatar || null);
  }, [user]);

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      const updatedUser = { ...editedUser };
      if (avatarPreview !== user.user_metadata?.avatar) {
        updatedUser.avatar = avatarPreview;
      }
      
      // Update user profile in Supabase
      const { error } = await updateUserProfile({
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        organization: updatedUser.organization
      });
      
      if (error) {
        console.error("Error updating profile:", error);
        setSaveStatus('error');
        return;
      }
      
      onUpdateProfile(updatedUser);
      setIsEditing(false);
      setSaveStatus('success');
      
      // Reset status after a delay
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      setSaveStatus('error');
    }
  };

  const handleCancel = () => {
    setEditedUser({
      ...user,
      firstName: user.user_metadata?.firstName || '',
      lastName: user.user_metadata?.lastName || '',
      organization: user.user_metadata?.organization || ''
    });
    setAvatarPreview(user.user_metadata?.avatar || null);
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    // Simulate password change
    alert('Password changed successfully');
    setShowPasswordModal(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleTwoFactorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate 2FA setup
    if (verificationCode === '123456') {
      setTwoFactorEnabled(true);
      alert('Two-factor authentication enabled successfully');
      setShowTwoFactorModal(false);
      setVerificationCode('');
    } else {
      alert('Invalid verification code');
    }
  };

  const handleLogoutSession = (id: number) => {
    // Simulate session logout
    setActiveSessions(prev => prev.filter(session => session.id !== id));
  };

  const handleLogoutAllSessions = () => {
    // Simulate logout all sessions except current
    setActiveSessions(prev => prev.filter(session => session.current));
  };

  const handleBackToDashboard = () => {
    window.history.back();
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'subscription', label: 'Subscription', icon: Globe },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Settings }
  ];

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div 
            className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold cursor-pointer overflow-hidden"
            onClick={handleAvatarClick}
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
            ) : (
              `${editedUser.firstName?.charAt(0) || ''}${editedUser.lastName?.charAt(0) || ''}`
            )}
          </div>
          {isEditing && (
            <button 
              className="absolute bottom-0 right-0 p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors duration-200"
              onClick={handleAvatarClick}
            >
              <Camera className="w-4 h-4" />
            </button>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-gray-100">
            {editedUser.firstName} {editedUser.lastName}
          </h3>
          <p className="text-slate-600 dark:text-gray-400">{editedUser.email}</p>
          <p className="text-sm text-slate-500 dark:text-gray-500 capitalize">{editedUser.role || 'User'}</p>
        </div>
      </div>

      {/* Profile Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
            First Name
          </label>
          {isEditing ? (
            <input
              type="text"
              name="firstName"
              value={editedUser.firstName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-gray-100"
              placeholder="Enter your first name"
            />
          ) : (
            <p className="px-4 py-3 bg-slate-50 dark:bg-gray-700 rounded-lg text-slate-900 dark:text-gray-100">
              {editedUser.firstName || ''}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
            Last Name
          </label>
          {isEditing ? (
            <input
              type="text"
              name="lastName"
              value={editedUser.lastName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-gray-100"
              placeholder="Enter your last name"
            />
          ) : (
            <p className="px-4 py-3 bg-slate-50 dark:bg-gray-700 rounded-lg text-slate-900 dark:text-gray-100">
              {editedUser.lastName || ''}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          {isEditing ? (
            <input
              type="email"
              name="email"
              value={editedUser.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-gray-100"
            />
          ) : (
            <p className="px-4 py-3 bg-slate-50 dark:bg-gray-700 rounded-lg text-slate-900 dark:text-gray-100">
              {editedUser.email}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
            Organization
          </label>
          {isEditing ? (
            <input
              type="text"
              name="organization"
              value={editedUser.organization}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-gray-100"
              placeholder="Enter your organization"
            />
          ) : (
            <p className="px-4 py-3 bg-slate-50 dark:bg-gray-700 rounded-lg text-slate-900 dark:text-gray-100">
              {editedUser.organization || ''}
            </p>
          )}
        </div>

        {isEditing && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              value={editedUser.bio || ''}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-gray-100"
              placeholder="Tell us about yourself..."
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 disabled:opacity-50"
            >
              {saveStatus === 'saving' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center space-x-2 px-6 py-3 border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-300 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>
      
      {/* Save Status Message */}
      {saveStatus === 'success' && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg text-green-700 dark:text-green-300">
          Profile updated successfully!
        </div>
      )}
      
      {saveStatus === 'error' && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300">
          Failed to update profile. Please try again.
        </div>
      )}
    </div>
  );

  const renderSubscriptionTab = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-3">
          <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">Subscription Management</h3>
        </div>
        <p className="text-blue-800 dark:text-blue-200 text-sm mt-2">
          Manage your EcoGuard Pro subscription and billing information.
        </p>
      </div>

      <SubscriptionManagement />
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <h3 className="font-semibold text-amber-900 dark:text-amber-100">Security Settings</h3>
        </div>
        <p className="text-amber-800 dark:text-amber-200 text-sm mt-2">
          Manage your account security and authentication preferences.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-gray-600 rounded-lg">
          <div>
            <h4 className="font-medium text-slate-900 dark:text-gray-100">Change Password</h4>
            <p className="text-sm text-slate-600 dark:text-gray-400">Update your account password</p>
          </div>
          <button 
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200"
          >
            <Key className="w-4 h-4" />
            <span>Change</span>
          </button>
        </div>

        <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-gray-600 rounded-lg">
          <div>
            <h4 className="font-medium text-slate-900 dark:text-gray-100">Two-Factor Authentication</h4>
            <p className="text-sm text-slate-600 dark:text-gray-400">Add an extra layer of security</p>
          </div>
          <button 
            onClick={() => setShowTwoFactorModal(true)}
            className={`px-4 py-2 ${twoFactorEnabled ? 'border border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' : 'border border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'} rounded-lg transition-colors duration-200`}
          >
            {twoFactorEnabled ? 'Disable' : 'Enable'}
          </button>
        </div>

        <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-gray-600 rounded-lg">
          <div>
            <h4 className="font-medium text-slate-900 dark:text-gray-100">Login Sessions</h4>
            <p className="text-sm text-slate-600 dark:text-gray-400">Manage your active sessions</p>
          </div>
          <button 
            onClick={() => setShowSessionsModal(true)}
            className="px-4 py-2 border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-300 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            View
          </button>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-slate-900 dark:text-gray-100 mb-4">Change Password</h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-gray-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-gray-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-gray-100"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 text-slate-600 dark:text-gray-400 border border-slate-300 dark:border-gray-600 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors duration-200"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Two-Factor Authentication Modal */}
      {showTwoFactorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-slate-900 dark:text-gray-100 mb-4">
              {twoFactorEnabled ? 'Disable Two-Factor Authentication' : 'Enable Two-Factor Authentication'}
            </h3>
            {!twoFactorEnabled ? (
              <form onSubmit={handleTwoFactorSubmit} className="space-y-4">
                <div className="bg-slate-50 dark:bg-gray-700 p-4 rounded-lg text-center mb-4">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg inline-block mb-4">
                    <img 
                      src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/EcoGuard:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=EcoGuard" 
                      alt="QR Code" 
                      className="w-32 h-32"
                    />
                  </div>
                  <p className="text-sm text-slate-600 dark:text-gray-400 mb-2">
                    Scan this QR code with your authenticator app
                  </p>
                  <div className="font-mono text-sm text-slate-900 dark:text-gray-100 bg-slate-100 dark:bg-gray-600 p-2 rounded">
                    JBSWY3DPEHPK3PXP
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="Enter 6-digit code"
                    required
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowTwoFactorModal(false)}
                    className="flex-1 px-4 py-2 text-slate-600 dark:text-gray-400 border border-slate-300 dark:border-gray-600 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors duration-200"
                  >
                    Verify & Enable
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-slate-600 dark:text-gray-400">
                  Are you sure you want to disable two-factor authentication? This will make your account less secure.
                </p>
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowTwoFactorModal(false)}
                    className="flex-1 px-4 py-2 text-slate-600 dark:text-gray-400 border border-slate-300 dark:border-gray-600 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setTwoFactorEnabled(false);
                      setShowTwoFactorModal(false);
                    }}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                  >
                    Disable 2FA
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sessions Modal */}
      {showSessionsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-gray-100 mb-4">Active Sessions</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {activeSessions.map(session => (
                <div 
                  key={session.id}
                  className={`p-4 border ${session.current ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-gray-700'} rounded-lg`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-gray-100">{session.device}</h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-sm text-slate-600 dark:text-gray-400">{session.location}</p>
                        <p className="text-sm text-slate-500 dark:text-gray-500">{session.lastActive}</p>
                      </div>
                    </div>
                    {session.current ? (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 text-xs font-medium rounded-full">
                        Current Session
                      </span>
                    ) : (
                      <button
                        onClick={() => handleLogoutSession(session.id)}
                        className="px-3 py-1 border border-red-300 text-red-600 dark:border-red-700 dark:text-red-400 text-xs font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Logout
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-6">
              <button
                onClick={() => handleLogoutAllSessions()}
                className="px-4 py-2 border border-red-300 text-red-600 dark:border-red-700 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Logout All Other Sessions
              </button>
              <button
                onClick={() => setShowSessionsModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 rounded-lg hover:bg-slate-200 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">Notification Preferences</h3>
        </div>
        <p className="text-blue-800 dark:text-blue-200 text-sm mt-2">
          Choose how you want to receive notifications and alerts.
        </p>
      </div>

      <div className="space-y-4">
        {[
          { title: 'Email Notifications', description: 'Receive alerts via email', enabled: true },
          { title: 'Push Notifications', description: 'Browser push notifications', enabled: true },
          { title: 'SMS Alerts', description: 'Critical alerts via SMS', enabled: false },
          { title: 'Weekly Reports', description: 'Weekly summary reports', enabled: true }
        ].map((item, index) => (
          <div key={index} className="flex items-center justify-between p-4 border border-slate-200 dark:border-gray-600 rounded-lg">
            <div>
              <h4 className="font-medium text-slate-900 dark:text-gray-100">{item.title}</h4>
              <p className="text-sm text-slate-600 dark:text-gray-400">{item.description}</p>
            </div>
            <button
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                item.enabled ? 'bg-teal-600' : 'bg-slate-200 dark:bg-gray-700'
              }`}
              onClick={() => {
                // Toggle functionality would be implemented here
              }}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                  item.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100">Notification Types</h3>
        
        {[
          { title: 'System Alerts', description: 'Critical system notifications', enabled: true },
          { title: 'Environmental Alerts', description: 'Threshold violations and anomalies', enabled: true },
          { title: 'Maintenance Reminders', description: 'Sensor maintenance notifications', enabled: true },
          { title: 'AI Insights', description: 'Predictive analytics notifications', enabled: true },
          { title: 'Product Updates', description: 'New features and improvements', enabled: false }
        ].map((item, index) => (
          <div key={index} className="flex items-center justify-between p-4 border border-slate-200 dark:border-gray-600 rounded-lg">
            <div>
              <h4 className="font-medium text-slate-900 dark:text-gray-100">{item.title}</h4>
              <p className="text-sm text-slate-600 dark:text-gray-400">{item.description}</p>
            </div>
            <button
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                item.enabled ? 'bg-teal-600' : 'bg-slate-200 dark:bg-gray-700'
              }`}
              onClick={() => {
                // Toggle functionality would be implemented here
              }}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                  item.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="font-semibold text-purple-900 dark:text-purple-100">Application Preferences</h3>
        </div>
        <p className="text-purple-800 dark:text-purple-200 text-sm mt-2">
          Customize your application experience and interface.
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-4 border border-slate-200 dark:border-gray-600 rounded-lg">
          <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
            Language
          </label>
          <select className="w-full px-4 py-3 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-gray-100">
            <option value="en-US">English (US)</option>
            <option value="en-GB">English (UK)</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="zh">Chinese (Simplified)</option>
            <option value="ja">Japanese</option>
          </select>
        </div>

        <div className="p-4 border border-slate-200 dark:border-gray-600 rounded-lg">
          <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
            Timezone
          </label>
          <select className="w-full px-4 py-3 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-gray-100">
            <option value="UTC-8">UTC-8 (Pacific Time)</option>
            <option value="UTC-7">UTC-7 (Mountain Time)</option>
            <option value="UTC-6">UTC-6 (Central Time)</option>
            <option value="UTC-5">UTC-5 (Eastern Time)</option>
            <option value="UTC+0">UTC+0 (GMT)</option>
            <option value="UTC+1">UTC+1 (Central European Time)</option>
            <option value="UTC+8">UTC+8 (China Standard Time)</option>
            <option value="UTC+9">UTC+9 (Japan Standard Time)</option>
          </select>
        </div>

        <div className="p-4 border border-slate-200 dark:border-gray-600 rounded-lg">
          <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
            Date Format
          </label>
          <select className="w-full px-4 py-3 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-gray-100">
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            <option value="YYYY/MM/DD">YYYY/MM/DD</option>
            <option value="DD-MMM-YYYY">DD-MMM-YYYY</option>
          </select>
        </div>

        <div className="p-4 border border-slate-200 dark:border-gray-600 rounded-lg">
          <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
            Time Format
          </label>
          <select className="w-full px-4 py-3 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-gray-100">
            <option value="12">12-hour (AM/PM)</option>
            <option value="24">24-hour</option>
          </select>
        </div>

        <div className="p-4 border border-slate-200 dark:border-gray-600 rounded-lg">
          <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
            Measurement Units
          </label>
          <select className="w-full px-4 py-3 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-gray-100">
            <option value="metric">Metric (°C, km, kg)</option>
            <option value="imperial">Imperial (°F, mi, lb)</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-slate-200 dark:border-gray-700 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">User Profile</h1>
              <p className="text-emerald-100">Manage your account settings and preferences</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleBackToDashboard}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'subscription' && renderSubscriptionTab()}
          {activeTab === 'security' && renderSecurityTab()}
          {activeTab === 'notifications' && renderNotificationsTab()}
          {activeTab === 'preferences' && renderPreferencesTab()}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;