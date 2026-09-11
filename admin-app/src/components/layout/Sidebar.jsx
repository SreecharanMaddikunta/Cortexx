import React from 'react';
import { NavLink } from 'react-router-dom';
import { Map, FileText, BellRing, Users, Settings, LogOut, Sun, Moon, PieChart } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Sidebar = ({ closeSidebar }) => {
  const { isDark, toggleTheme } = useTheme();

  const navItems = [
    { name: 'GIS Dashboard', path: '/', icon: <Map size={20} /> },
    { name: 'Analytics', path: '/analytics', icon: <PieChart size={20} /> },
    { name: 'Scan Reports', path: '/reports', icon: <FileText size={20} /> },
    { name: 'Farmers Directory', path: '/farmers', icon: <Users size={20} /> },
    { name: 'Alert Broadcasting', path: '/alerts', icon: <BellRing size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="w-64 bg-gray-900 dark:bg-black text-white h-full flex flex-col shadow-2xl transition-colors duration-200 border-r border-gray-800">
      <div className="p-6 hidden md:block">
        <h1 className="text-2xl font-bold text-green-400 tracking-tight">Cortexx Admin</h1>
        <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-semibold">Govt. of Maharashtra</p>
      </div>
      
      {/* Spacer for mobile header */}
      <div className="h-16 md:hidden"></div>

      <nav className="flex-1 mt-6">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={closeSidebar}
            className={({ isActive }) =>
              `flex items-center px-6 py-4 transition-all duration-200 border-l-4 ${
                isActive ? 'bg-gray-800 dark:bg-gray-900 border-green-500 text-white font-medium' : 'border-transparent text-gray-400 hover:bg-gray-800 dark:hover:bg-gray-900 hover:text-white'
              }`
            }
          >
            <span className="mr-4">{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-gray-800 flex flex-col gap-4">
        <button onClick={toggleTheme} className="flex items-center text-gray-400 hover:text-white w-full transition-colors">
          {isDark ? <Sun size={20} className="mr-3" /> : <Moon size={20} className="mr-3" />}
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button className="flex items-center text-gray-400 hover:text-white w-full transition-colors">
          <LogOut size={20} className="mr-3" />
          Secure Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
