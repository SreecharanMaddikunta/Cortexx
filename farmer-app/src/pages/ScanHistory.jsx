import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Search, Filter, CheckCircle, AlertTriangle, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const ScanHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('farmer_token');
      const res = await axios.get('http://localhost:5000/api/scans/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDeleteClick = (e, id) => {
    e.stopPropagation(); // Prevent navigating to report
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    
    try {
      const token = localStorage.getItem('farmer_token');
      await axios.delete(`http://localhost:5000/api/scans/${deleteConfirmId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setToastMessage({ type: 'success', text: 'Scan deleted successfully' });
      setDeleteConfirmId(null);
      fetchHistory(); // Refresh the list
    } catch (error) {
      console.error("Failed to delete scan", error);
      setToastMessage({ type: 'error', text: 'Failed to delete scan' });
      setDeleteConfirmId(null);
    }
    
    // Hide toast after 3 seconds
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-32 transition-colors duration-200 relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg font-medium text-sm flex items-center gap-2 ${toastMessage.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
          >
            {toastMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            {toastMessage.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog Overlay */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-xl"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Scan</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Are you sure you want to delete this scan? This action cannot be undone.</p>
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded-xl transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 shadow-sm sticky top-0 z-20 flex items-center justify-between transition-colors duration-200">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition">
            <ArrowLeft size={20} className="text-gray-700 dark:text-gray-200" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Scan History</h1>
        </div>
        <div className="flex gap-2">
           <button className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"><Search size={20}/></button>
           <button className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"><Filter size={20}/></button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-6">
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-2xl"></div>)}
          </div>
        ) : history.length === 0 ? (
          <div className="text-center mt-20">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock size={40} className="text-gray-400 dark:text-gray-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">No Scans Yet</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Your field diagnosis history will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((scan, index) => {
               const isHealthy = scan.disease.includes('Healthy');
               return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={scan.id} 
                  onClick={() => navigate('/diagnosis', { state: { report: scan } })}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex gap-4 cursor-pointer hover:shadow-md transition active:scale-[0.98] group relative"
                >
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 shrink-0 border border-gray-200 dark:border-gray-700">
                    {scan.imageUrl ? (
                      <img src={scan.imageUrl} alt="Scan" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                        <Clock size={24} />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 py-1 pr-8">
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${isHealthy ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                        {isHealthy ? 'Healthy' : 'Infected'}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                        {new Date(scan.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg truncate">{scan.disease}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">Crop: {scan.cropType || 'Unknown'}</p>
                    
                    <div className="flex items-center gap-1 mt-2 text-xs font-bold">
                       {isHealthy ? <CheckCircle size={14} className="text-green-500" /> : <AlertTriangle size={14} className="text-orange-500" />}
                       <span className={isHealthy ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}>
                         {Math.round(scan.confidence * 100)}% AI Confidence
                       </span>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button 
                    onClick={(e) => handleDeleteClick(e, scan.id)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-500 dark:text-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Scan"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
               );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanHistory;
