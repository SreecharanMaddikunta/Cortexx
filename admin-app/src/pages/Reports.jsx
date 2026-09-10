import React, { useState, useEffect } from 'react';
import { Download, CheckCircle2, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import axios from 'axios';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/admin/reports');
      setReports(res.data);
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    const interval = setInterval(fetchReports, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-4 md:p-8 h-full overflow-y-auto transition-colors duration-200">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Scan Reports Database</h2>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">Real-time live logs of all AI crop diagnoses across the state</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchReports} 
            className="flex items-center px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium shadow-sm transition"
          >
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button className="flex items-center px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium shadow-sm transition-all active:scale-95">
            <Download size={18} className="mr-2" /> Export to CSV
          </button>
        </div>
      </div>

      {/* Responsive Table Wrapper */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm tracking-wide uppercase">
                <th className="p-4 md:px-6 font-semibold">Report ID</th>
                <th className="p-4 md:px-6 font-semibold">Farmer Info</th>
                <th className="p-4 md:px-6 font-semibold">Crop</th>
                <th className="p-4 md:px-6 font-semibold">District</th>
                <th className="p-4 md:px-6 font-semibold">AI Diagnosis</th>
                <th className="p-4 md:px-6 font-semibold">AI Confidence</th>
                <th className="p-4 md:px-6 font-semibold">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((row) => (
                <tr key={row.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="p-4 md:px-6 text-gray-500 dark:text-gray-400 font-mono text-sm">#{row.id}</td>
                  <td className="p-4 md:px-6">
                    <div className="font-semibold text-gray-800 dark:text-gray-100">{row.farmer}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{row.phone}</div>
                  </td>
                  <td className="p-4 md:px-6 text-gray-700 dark:text-gray-300 font-medium">
                    <span className="bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-lg text-xs font-semibold text-green-700 dark:text-green-400 border border-gray-200 dark:border-gray-700">
                      {row.crop || 'Crop'}
                    </span>
                  </td>
                  <td className="p-4 md:px-6 text-gray-600 dark:text-gray-300 font-medium">{row.loc}</td>
                  <td className="p-4 md:px-6">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                      row.disease === 'Healthy' 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50' 
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50'
                    }`}>
                      {row.disease === 'Healthy' ? <CheckCircle2 size={12}/> : <AlertCircle size={12}/>} {row.disease}
                    </span>
                  </td>
                  <td className="p-4 md:px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${parseInt(row.conf) > 90 ? 'bg-green-500' : 'bg-yellow-500'}`} 
                          style={{ width: row.conf }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{row.conf}</span>
                    </div>
                  </td>
                  <td className="p-4 md:px-6 text-gray-500 dark:text-gray-400 text-sm">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
};

export default Reports;
