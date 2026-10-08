import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/analytics/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleExportCSV = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/analytics/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'disease_report.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  if (loading) return <div className="p-8 flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>;
  if (!stats) return <div className="p-8 text-red-500">Failed to load analytics data.</div>;

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

  const shortenDiseaseName = (name) => {
    if (!name) return 'Unknown';
    let short = name.replace(/\s*\([^)]*\)/g, '');
    const dashIndex = short.search(/\s+[—–-]\s+/);
    if (dashIndex !== -1) short = short.substring(0, dashIndex);
    const slashIndex = short.search(/\s+\//);
    if (slashIndex !== -1) short = short.substring(0, slashIndex);
    return short.trim();
  };

  const diseaseBreakdown = stats.diseaseBreakdown || [];
  const hasDiseases = diseaseBreakdown.length > 0;
  
  const sortedDiseases = [...diseaseBreakdown]
    .map(d => ({ ...d, shortName: shortenDiseaseName(d.name) }))
    .sort((a, b) => b.value - a.value);

  const totalDetections = sortedDiseases.reduce((sum, item) => sum + item.value, 0);

  const renderCustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percent = totalDetections ? ((data.value / totalDetections) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-gray-700 max-w-xs z-50 relative">
          <h4 className="font-bold text-gray-800 dark:text-white mb-3 text-sm">{data.shortName}</h4>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500 dark:text-gray-400 mr-4">Detections:</span>
            <span className="font-medium text-gray-900 dark:text-white">{data.value.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm mb-4">
            <span className="text-gray-500 dark:text-gray-400 mr-4">Share:</span>
            <span className="font-medium text-gray-900 dark:text-white">{percent}%</span>
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-700 pt-3 leading-relaxed">
            <span className="font-semibold block mb-1">Full name:</span>
            <span className="italic">{data.name}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-100 overflow-y-auto transition-colors duration-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Regional Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400">State-wide crop disease statistics and reporting</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Download size={18} /> Export CSV Dossier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
          <div className="p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl"><TrendingUp size={28} /></div>
          <div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Scans</p>
            <h3 className="text-3xl font-black">{stats.totalScans}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
          <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl"><AlertTriangle size={28} /></div>
          <div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">High Risk Cases</p>
            <h3 className="text-3xl font-black">{stats.highRiskCount}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
          <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-2xl"><CheckCircle size={28} /></div>
          <div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Healthy Crops</p>
            <h3 className="text-3xl font-black">{stats.healthyCount}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Diseases Donut Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Top Diseases Detected</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Most frequently detected diseases</p>
          </div>
          
          {!hasDiseases ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
               <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                 <AlertTriangle className="text-gray-400" size={28} />
               </div>
               <h4 className="text-gray-900 dark:text-gray-200 font-semibold mb-2">No disease detections yet</h4>
               <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[250px]">Disease analytics will appear here once crop scans are available.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col md:flex-row items-center gap-8 min-h-[300px]">
              {/* Left: Donut Chart */}
              <div className="relative w-full md:w-1/2 aspect-square max-h-[280px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={sortedDiseases} 
                      dataKey="value" 
                      nameKey="shortName" 
                      cx="50%" 
                      cy="50%" 
                      innerRadius="65%"
                      outerRadius="85%" 
                      paddingAngle={4}
                      stroke="none"
                      isAnimationActive={true}
                      animationDuration={1200}
                      animationEasing="ease-out"
                    >
                      {sortedDiseases.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={6} />
                      ))}
                    </Pie>
                    <Tooltip content={renderCustomTooltip} cursor={{ fill: 'transparent' }} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Summary */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-1">
                  <span className="text-3xl font-black text-gray-800 dark:text-gray-100 tracking-tight">{totalDetections.toLocaleString()}</span>
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1 text-center leading-tight">Total<br/>Detections</span>
                </div>
              </div>

              {/* Right: Custom Legend */}
              <div className="w-full md:w-1/2 flex flex-col gap-2.5 justify-center pr-2">
                {sortedDiseases.map((disease, idx) => {
                  const pct = totalDetections ? ((disease.value / totalDetections) * 100).toFixed(1) : 0;
                  return (
                    <div key={idx} className="flex items-center justify-between group p-2 hover:bg-gray-50 dark:hover:bg-gray-700/40 rounded-xl transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate" title={disease.name}>
                          {disease.shortName}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0 pl-3">
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100 w-10 text-right">{pct}%</span>
                        <span className="text-xs font-medium text-gray-400 dark:text-gray-500 w-8 text-right hidden sm:inline-block">{disease.value.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Crops Bar Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
          <h3 className="text-lg font-bold mb-6 text-gray-800 dark:text-gray-200">Vulnerability by Crop</h3>
          <div className="flex-1 min-h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.cropBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default Analytics;