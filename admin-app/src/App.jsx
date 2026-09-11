import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import FarmersDirectory from './pages/FarmersDirectory';
import AlertsBroadcasting from './pages/AlertsBroadcasting';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ThemeProvider>
      <Router>
        <div className="flex h-screen bg-gray-100 dark:bg-gray-950 font-sans overflow-hidden transition-colors duration-200">
          
          {/* Mobile Header (Hamburger Menu) */}
          <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-gray-900 text-white z-50 flex items-center justify-between px-4 shadow-md">
            <h1 className="text-xl font-bold text-green-400">Cortexx Admin</h1>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-gray-800 rounded-lg">
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Sidebar Overlay for Mobile */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <Sidebar closeSidebar={() => setIsSidebarOpen(false)} />
          </div>

          {/* Main Content Area */}
          <main className="flex-1 w-full h-full pt-16 md:pt-0 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/farmers" element={<FarmersDirectory />} />
              <Route path="/alerts" element={<AlertsBroadcasting />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
