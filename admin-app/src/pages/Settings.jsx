import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Key, User, Bell, Map, Shield } from 'lucide-react';

const Settings = () => {
  const [profile, setProfile] = useState({ name: 'Admin', email: 'admin@cortexx.gov' });
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
  const [notification, setNotification] = useState(true);
  const [saveMessage, setSaveMessage] = useState('');

  const handleProfileSave = () => {
    setSaveMessage('Profile saved successfully.');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handlePasswordGen = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let generated = "";
    for (let i = 0; i < 16; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword({ ...password, new: generated, confirm: generated });
  };

  const handlePasswordSave = () => {
    if (password.new !== password.confirm) {
      setSaveMessage('Passwords do not match.');
      return;
    }
    setSaveMessage('Password updated successfully.');
    setTimeout(() => setSaveMessage(''), 3000);
    setPassword({ current: '', new: '', confirm: '' });
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-100 overflow-y-auto transition-colors duration-200">
      
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gray-800 text-white rounded-xl shadow-sm">
          <SettingsIcon size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Admin Settings</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage system preferences and security</p>
        </div>
      </div>

      {saveMessage && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-xl border border-green-200 font-medium">
          {saveMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Profile Settings */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-6 text-gray-900 dark:text-gray-100">
            <User size={20} className="text-blue-500" />
            <h2 className="text-xl font-bold">Profile Information</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admin Name</label>
              <input 
                type="text" 
                value={profile.name} 
                onChange={e => setProfile({...profile, name: e.target.value})} 
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admin Email</label>
              <input 
                type="email" 
                value={profile.email} 
                onChange={e => setProfile({...profile, email: e.target.value})} 
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <button onClick={handleProfileSave} className="mt-2 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition">
              <Save size={18} /> Save Profile
            </button>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-6 text-gray-900 dark:text-gray-100">
            <Shield size={20} className="text-red-500" />
            <h2 className="text-xl font-bold">Security & Password</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
              <input 
                type="password" 
                value={password.current} 
                onChange={e => setPassword({...password, current: e.target.value})} 
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-red-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={password.new} 
                  onChange={e => setPassword({...password, new: e.target.value})} 
                  className="flex-1 p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-red-500" 
                />
                <button onClick={handlePasswordGen} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center gap-2">
                  <Key size={16} /> Generate
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
              <input 
                type="text" 
                value={password.confirm} 
                onChange={e => setPassword({...password, confirm: e.target.value})} 
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-red-500" 
              />
            </div>
            <button onClick={handlePasswordSave} className="mt-2 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition">
              <Save size={18} /> Update Password
            </button>
          </div>
        </div>

        {/* System Preferences */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 lg:col-span-2">
          <div className="flex items-center gap-2 mb-6 text-gray-900 dark:text-gray-100">
            <SettingsIcon size={20} className="text-gray-500" />
            <h2 className="text-xl font-bold">System Preferences</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 p-4 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-900/50">
              <Bell size={24} className="text-yellow-500 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">Push Notifications</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-3">Receive real-time alerts for high-risk outbreaks.</p>
                <button 
                  onClick={() => setNotification(!notification)} 
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notification ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notification ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-900/50">
              <Map size={24} className="text-purple-500 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">Default Map Region</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-3">Set the default focus area for the GIS dashboard.</p>
                <select className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm">
                  <option>Maharashtra (All)</option>
                  <option>Pune District</option>
                  <option>Nashik District</option>
                  <option>Nagpur District</option>
                </select>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
