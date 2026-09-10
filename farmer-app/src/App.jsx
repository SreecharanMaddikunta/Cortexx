import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { VoiceProvider } from './context/VoiceContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import VoiceBotFAB from './components/widgets/VoiceBotFAB';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import Login from './pages/Login';
import DiagnosisReport from './pages/DiagnosisReport';
import ScanHistory from './pages/ScanHistory';
import { Sun, Moon } from 'lucide-react';

// Language Switcher Component for Navbar
const LanguageSwitcher = () => {
  const { language, changeLanguage } = useLanguage();
  return (
    <select 
      value={language} 
      onChange={(e) => changeLanguage(e.target.value)}
      className="bg-green-800 text-white border border-green-600 rounded-lg px-2 py-1 text-sm outline-none cursor-pointer"
    >
      <option value="en-IN">English</option>
      <option value="hi-IN">हिंदी</option>
      <option value="mr-IN">मराठी</option>
      <option value="te-IN">తెలుగు</option>
    </select>
  );
};

// Theme Switcher Component
const ThemeSwitcher = () => {
  const { isDark, toggleTheme } = useTheme();
  return (
    <button 
      onClick={toggleTheme} 
      className="p-2 rounded-full hover:bg-green-800 transition text-white"
      title="Toggle Theme"
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

// Protected Layout that only shows VoiceBot and Nav if logged in
const ProtectedLayout = () => {
  const token = localStorage.getItem('farmer_token');
  const { t } = useLanguage();
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans relative transition-colors duration-200">
      <div className="hidden md:flex bg-green-700 dark:bg-green-900 text-white p-4 justify-between items-center shadow-md">
        <h1 className="text-xl font-bold tracking-wide">{t('portalTitle')}</h1>
        <div className="flex gap-4 items-center">
          <ThemeSwitcher />
          <LanguageSwitcher />
          <span className="text-sm font-medium bg-green-800 dark:bg-green-950 px-3 py-1 rounded-full border border-green-600 dark:border-green-800">
            {t('farmerPortal')}
          </span>
          <button onClick={() => {
            localStorage.removeItem('farmer_token');
            window.location.href = '/login';
          }} className="text-sm hover:underline">{t('logout')}</button>
        </div>
      </div>
      <main className="max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
      <VoiceBotFAB />
    </div>
  );
};

// Route wrapper for Login to redirect if already logged in
const AuthRoute = () => {
  const token = localStorage.getItem('farmer_token');
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Login />;
};

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <VoiceProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/login" element={<AuthRoute />} />
              
              <Route element={<ProtectedLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/scanner" element={<Scanner />} />
                <Route path="/diagnosis" element={<DiagnosisReport />} />
                <Route path="/history" element={<ScanHistory />} />
              </Route>
            </Routes>
          </Router>
        </VoiceProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
