import React, { useState, useEffect } from 'react';
import { Users, Search, Sprout, Phone, Calendar, ShieldCheck, Activity, RefreshCw } from 'lucide-react';
import axios from 'axios';

const FarmersDirectory = () => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [cropFilter, setCropFilter] = useState('ALL');

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/admin/farmers');
      setFarmers(res.data);
    } catch (err) {
      console.error("Failed to load farmers directory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
    const interval = setInterval(fetchFarmers, 6000);
    return () => clearInterval(interval);
  }, []);

  // Filter logic
  const filteredFarmers = farmers.filter(f => {
    const matchesSearch = 
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.phone && f.phone.includes(searchQuery));
    
    const matchesCrop = 
      cropFilter === 'ALL' || 
      f.crops.some(c => c.type.toLowerCase() === cropFilter.toLowerCase());

    return matchesSearch && matchesCrop;
  });

  const totalAcres = farmers.reduce((sum, f) => sum + (f.totalAcres || 0), 0);
  const totalCrops = farmers.reduce((sum, f) => sum + (f.cropsCount || 0), 0);
  const totalScans = farmers.reduce((sum, f) => sum + (f.reportsCount || 0), 0);

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-4 md:p-8 h-full overflow-y-auto transition-colors duration-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-600 text-white rounded-2xl shadow-lg shadow-green-500/20">
              <Users size={24} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Registered Farmers Directory</h2>
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
                Real-time registry of all active farmers, enrolled acreage, crop profiles, and AI diagnostics
              </p>
            </div>
          </div>
        </div>

        <button 
          onClick={fetchFarmers}
          className="flex items-center px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium shadow-sm transition cursor-pointer"
        >
          <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Enrolled Farmers</p>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{farmers.length}</h3>
          <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">Active platform accounts</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Monitored Farmland</p>
          <h3 className="text-2xl font-black text-green-700 dark:text-green-400 mt-1">{totalAcres.toFixed(1)} <span className="text-sm font-normal text-gray-500">Acres</span></h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total registered plots</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active Field Plots</p>
          <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{totalCrops}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Across Maharashtra districts</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">AI Diagnoses Run</p>
          <h3 className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{totalScans}</h3>
          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1">Crop scans submitted</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search farmer by name or phone..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-green-500 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">Filter Crop:</span>
          {['ALL', 'Tomato', 'Cotton', 'Corn', 'Wheat'].map((c) => (
            <button
              key={c}
              onClick={() => setCropFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                cropFilter === c
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Farmers Cards / Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredFarmers.map((farmer) => (
          <div 
            key={farmer.id}
            className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-green-600/20">
                  {farmer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{farmer.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span className="flex items-center gap-1"><Phone size={12} /> {farmer.phone || 'N/A'}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> Registered: {new Date(farmer.joinedDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <ShieldCheck size={14} /> Verified
              </span>
            </div>

            {/* Stats summary */}
            <div className="grid grid-cols-3 gap-2 py-4 text-center">
              <div className="bg-gray-50 dark:bg-gray-900/50 p-2.5 rounded-xl">
                <p className="text-[11px] text-gray-400 font-semibold uppercase">Total Land</p>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-0.5">{farmer.totalAcres} Acres</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 p-2.5 rounded-xl">
                <p className="text-[11px] text-gray-400 font-semibold uppercase">Crops</p>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-0.5">{farmer.cropsCount} Fields</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 p-2.5 rounded-xl">
                <p className="text-[11px] text-gray-400 font-semibold uppercase">AI Scans</p>
                <p className="text-sm font-bold text-purple-600 dark:text-purple-400 mt-0.5">{farmer.reportsCount} Reports</p>
              </div>
            </div>

            {/* Enrolled Crops Chips */}
            <div className="mt-2">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Sprout size={14} className="text-green-500" /> Active Enrolled Crops:
              </p>
              <div className="space-y-2">
                {farmer.crops.map((crop) => (
                  <div 
                    key={crop.id}
                    className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700/60 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">{crop.name}</span>
                      <span className="text-gray-400">({crop.type})</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                      <span>{crop.area} Acres</span>
                      <span>•</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">{crop.stage || 'Vegetative'}</span>
                      <span>•</span>
                      <span>{crop.ageDays} Days Old</span>
                    </div>
                  </div>
                ))}
                {farmer.crops.length === 0 && (
                  <p className="text-xs text-gray-400 italic">No crops registered yet</p>
                )}
              </div>
            </div>

            {/* Latest AI Diagnosis Note */}
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Activity size={13} className="text-purple-500" /> Latest Health Status:
              </span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {farmer.latestDisease}
              </span>
            </div>

          </div>
        ))}

        {filteredFarmers.length === 0 && !loading && (
          <div className="col-span-2 text-center py-16 text-gray-400 dark:text-gray-500">
            <Users size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-base font-semibold">No farmers match your search</p>
            <p className="text-xs mt-1">Try resetting the filter or typing a different query.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default FarmersDirectory;
