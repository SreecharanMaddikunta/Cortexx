import React, { useState, useEffect } from 'react';
import { Save, User, Lock, Bell, Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Settings = () => {
  const { isDark, setIsDark } = useTheme();

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('cortexx_profile');
    return saved ? JSON.parse(saved) : { name: 'Admin User', email: 'sreecharanmaddikunta25@gmail.com' };
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('cortexx_notifications');
    return saved ? JSON.parse(saved) : { soundAlerts: true, emailSummary: true };
  });

  const [display, setDisplay] = useState(() => {
    const saved = localStorage.getItem('cortexx_display');
    return saved ? JSON.parse(saved) : { theme: isDark ? 'dark' : 'light', defaultView: 'markers' };
  });

  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleProfileChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });
  const handleNotifChange = (name) => setNotifications({ ...notifications, [name]: !notifications[name] });
  const handleDisplayChange = (e) => setDisplay({ ...display, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) => setPassword({ ...password, [e.target.name]: e.target.value });

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('cortexx_profile', JSON.stringify(profile));
    localStorage.setItem('cortexx_notifications', JSON.stringify(notifications));
    localStorage.setItem('cortexx_display', JSON.stringify(display));
    
    if (display.theme === 'light') setIsDark(false);
    if (display.theme === 'dark') setIsDark(true);
    
    alert('Settings saved successfully!');
  };

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto p-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Settings</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account and dashboard preferences</p>
          </div>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-medium transition shadow-sm"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Account Profile */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-5 flex items-center gap-2 text-gray-800 dark:text-white">
              <User size={20} className="text-green-500" /> Profile Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
                <input 
                  type="text" name="name" value={profile.name} onChange={handleProfileChange}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Email</label>
                <input 
                  type="email" name="email" value={profile.email} onChange={handleProfileChange}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-5 flex items-center gap-2 text-gray-800 dark:text-white">
              <Lock size={20} className="text-green-500" /> Security
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                <input 
                  type="password" name="current" value={password.current} onChange={handlePasswordChange}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                <input 
                  type="password" name="new" value={password.new} onChange={handlePasswordChange}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Display Preferences */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-5 flex items-center gap-2 text-gray-800 dark:text-white">
              <Monitor size={20} className="text-green-500" /> Display Preferences
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme</label>
                <div className="flex gap-3">
                  <button onClick={() => setDisplay({...display, theme: 'light'})} className={`flex-1 py-2 px-3 border rounded-lg flex justify-center items-center gap-2 ${display.theme === 'light' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'}`}>
                    <Sun size={16} /> Light
                  </button>
                  <button onClick={() => setDisplay({...display, theme: 'dark'})} className={`flex-1 py-2 px-3 border rounded-lg flex justify-center items-center gap-2 ${display.theme === 'dark' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'}`}>
                    <Moon size={16} /> Dark
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Default Map View</label>
                <select 
                  name="defaultView" value={display.defaultView} onChange={handleDisplayChange}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition"
                >
                  <option value="markers">Markers View</option>
                  <option value="heatmap">Heatmap View</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-5 flex items-center gap-2 text-gray-800 dark:text-white">
              <Bell size={20} className="text-green-500" /> Notification Settings
            </h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Sound Alerts</div>
                  <div className="text-sm text-gray-500">Play a sound on new High Risk alerts</div>
                </div>
                <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input type="checkbox" checked={notifications.soundAlerts} onChange={() => handleNotifChange('soundAlerts')} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                  <label className={`toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer ${notifications.soundAlerts ? 'bg-green-500' : ''}`}></label>
                </div>
              </label>

              <label className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Daily Email Summary</div>
                  <div className="text-sm text-gray-500">Receive a daily digest of crop anomalies</div>
                </div>
                <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input type="checkbox" checked={notifications.emailSummary} onChange={() => handleNotifChange('emailSummary')} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                  <label className={`toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer ${notifications.emailSummary ? 'bg-green-500' : ''}`}></label>
                </div>
              </label>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;
