import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Search, CloudRain, Bell, MapPin, Loader2, Plus, Trash2, ShieldAlert, ArrowRight, CheckCircle2, ChevronRight, AlertTriangle, X, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LiveWeatherWidget from '../components/widgets/LiveWeatherWidget';
import WeatherTelecastModal from '../components/widgets/WeatherTelecastModal';
import TasksHistoryModal from '../components/widgets/TasksHistoryModal';
import CropGrowthWidget from '../components/widgets/CropGrowthWidget';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [userName, setUserName] = useState('Farmer');
  const [crops, setCrops] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [taskHistory, setTaskHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loadingCrops, setLoadingCrops] = useState(true);
  const [dismissedAlertIds, setDismissedAlertIds] = useState([]);
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedCropId, setSelectedCropId] = useState(null);
  
  // New Crop Form (including mid-cycle adoption inputs)
  const [newCropName, setNewCropName] = useState('');
  const [newCropType, setNewCropType] = useState('Tomato');
  const [newCropArea, setNewCropArea] = useState('1');
  const [daysSpent, setDaysSpent] = useState('0');
  const [expectedYield, setExpectedYield] = useState('120');
  const [cropStage, setCropStage] = useState('stageFlowering');
  const [savingCrop, setSavingCrop] = useState(false);
  
  // Weather State
  const [weather, setWeather] = useState(null);
  const [showWeatherModal, setShowWeatherModal] = useState(false);

  useEffect(() => {
    // Check auth
    const token = localStorage.getItem('farmer_token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Get name from localStorage, fallback to 'Farmer' if not found
    const storedName = localStorage.getItem('farmer_name');
    setUserName(storedName || 'Farmer');
    
    fetchDashboardData();
    
    // Live Polling for Real-Time Alerts & Sync (every 4 seconds)
    const pollInterval = setInterval(() => {
      fetchAlertsOnly();
    }, 4000);

    // Instant re-fetch when farmer returns to window/tab
    const onWindowFocus = () => {
      fetchAlertsOnly();
    };
    window.addEventListener('focus', onWindowFocus);

    // Fetch live weather from Open-Meteo
    import('../services/weatherService').then(module => {
      module.fetchWeatherData().then(data => setWeather(data));
    });

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('focus', onWindowFocus);
    };
  }, [navigate, language]);

  const fetchAlertsOnly = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/farmer/alerts?lang=${language}`);
      setAlerts(res.data || []);
    } catch (err) {
      console.error("Alert polling error:", err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const [cropsRes, tasksRes, alertsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/farmer/crops'),
        axios.get('http://localhost:5000/api/farmer/tasks'),
        axios.get(`http://localhost:5000/api/farmer/alerts?lang=${language}`)
      ]);
      setCrops(cropsRes.data);
      if (cropsRes.data.length > 0 && !selectedCropId) {
        setSelectedCropId(cropsRes.data[0].id);
      } else if (cropsRes.data.length === 0) {
        setShowAddModal(true);
      }
      // Handle both legacy array and new { tasks, history } object structure
      if (tasksRes.data && tasksRes.data.tasks) {
        setTasks(tasksRes.data.tasks);
        setTaskHistory(tasksRes.data.history || []);
      } else if (Array.isArray(tasksRes.data)) {
        setTasks(tasksRes.data);
      }
      setAlerts(alertsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCrops(false);
    }
  };

  const handleAddCrop = async (e) => {
    e.preventDefault();
    setSavingCrop(true);
    try {
      await axios.post('http://localhost:5000/api/farmer/crops', {
        name: newCropName || `${newCropType} Field`,
        type: newCropType,
        daysSpent: parseInt(daysSpent) || 0,
        area: newCropArea,
        expectedYield: expectedYield ? parseFloat(expectedYield) : null,
        stage: t(cropStage) || cropStage
      });
      setShowAddModal(false);
      // Reset form
      setNewCropName('');
      setDaysSpent('0');
      setExpectedYield('120');
      fetchDashboardData(); // Refresh list
    } catch (err) {
      console.error(err);
    } finally {
      setSavingCrop(false);
    }
  };

  const handleHarvestCrop = async (id, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`http://localhost:5000/api/farmer/crops/${id}`);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTaskCompleted = async () => {
    await fetchDashboardData();
  };

  // Filter active HIGH severity alerts not dismissed by user
  const activeCriticalAlerts = alerts.filter(
    a => (a.severity === 'HIGH' || a.type === 'danger') && !dismissedAlertIds.includes(a.id)
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pb-32 transition-colors duration-200">
      
      {/* Real-time High Severity Emergency Banner */}
      <AnimatePresence>
        {activeCriticalAlerts.length > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gradient-to-r from-red-600 via-red-700 to-rose-700 text-white shadow-lg overflow-hidden border-b-2 border-red-800"
          >
            {activeCriticalAlerts.slice(0, 2).map((critAlert) => (
              <div 
                key={critAlert.id}
                className="max-w-7xl mx-auto px-4 py-3 sm:px-6 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl animate-bounce shrink-0">
                    <AlertTriangle className="text-yellow-300" size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-white text-red-700 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
                        {t('urgent_advisory') || 'URGENT ADVISORY'}
                      </span>
                      <span className="text-xs font-semibold text-red-100 flex items-center gap-1">
                        <Radio size={12} className="animate-pulse" /> {critAlert.region || t('regional_notice') || 'Regional Notice'}
                      </span>
                      <span className="text-xs text-red-200 font-mono">
                        • {critAlert.time || t('live_status') || 'Live'}
                      </span>
                    </div>
                    <p className="font-bold text-sm sm:text-base text-white mt-0.5">
                      {critAlert.title}
                    </p>
                    <p className="text-xs sm:text-sm text-red-100 mt-0.5 line-clamp-2">
                      {critAlert.message}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setDismissedAlertIds(prev => [...prev, critAlert.id])}
                  className="p-2 hover:bg-white/20 rounded-xl transition text-red-100 hover:text-white shrink-0 cursor-pointer"
                  title="Acknowledge Alert"
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex justify-between items-start p-6 bg-white dark:bg-gray-800 shadow-sm rounded-b-3xl">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            {t('greeting')}, <br /><span className="text-gray-700 dark:text-gray-300">{userName}</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 flex items-center gap-1">
            <MapPin size={16} /> {t('district')}
          </p>
        </motion.div>
        <div className="flex gap-3 relative">
          <div onClick={() => navigate('/history')} className="bg-white dark:bg-gray-700 p-3 rounded-full shadow-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-100 dark:border-gray-600 flex items-center justify-center" title={t('history')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 dark:text-gray-300"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div onClick={() => setShowNotifications(!showNotifications)} className="bg-white dark:bg-gray-700 p-3 rounded-full shadow-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 relative border border-gray-100 dark:border-gray-600">
            <Bell className="text-gray-600 dark:text-gray-300" size={24} />
            {alerts.length > 0 && (
              <span className={`absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-700 animate-pulse ${
                alerts.some(a => a.severity === 'HIGH' || a.type === 'danger') ? 'bg-red-500' : 'bg-orange-500'
              }`}></span>
            )}
          </div>
          
          {/* Notification Dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-14 right-0 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                  <h3 className="font-bold text-gray-800 dark:text-gray-100">{t('liveAlerts')}</h3>
                  <span className="text-xs font-bold text-red-500 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full">{alerts.length} {t('newAlerts')}</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {alerts.map(a => {
                    const isHigh = a.severity === 'HIGH' || a.type === 'danger';
                    const isMedium = a.severity === 'MEDIUM' || a.type === 'warning';
                    
                    return (
                      <div 
                        key={a.id} 
                        className={`p-4 border-b border-gray-50 dark:border-gray-700 transition ${
                          isHigh 
                            ? 'bg-red-50/50 dark:bg-red-950/20 hover:bg-red-50 dark:hover:bg-red-950/30' 
                            : isMedium 
                              ? 'bg-orange-50/40 dark:bg-orange-950/10 hover:bg-orange-50' 
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-xl shrink-0 ${
                            isHigh 
                              ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300' 
                              : isMedium 
                                ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300' 
                                : 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300'
                          }`}>
                            {isHigh ? <ShieldAlert size={18} /> : isMedium ? <AlertTriangle size={18} /> : <Bell size={18} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                isHigh 
                                  ? 'bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200' 
                                  : isMedium 
                                    ? 'bg-orange-200 dark:bg-orange-900 text-orange-800 dark:text-orange-200' 
                                    : 'bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                              }`}>
                                {a.severity || (isHigh ? 'HIGH' : isMedium ? 'MEDIUM' : 'LOW')}
                              </span>
                              <span className="text-[10px] text-gray-400 dark:text-gray-500">{a.time}</span>
                            </div>
                            <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 mt-1">{a.title}</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">{a.message}</p>
                            {a.region && (
                              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5 flex items-center gap-1">
                                <MapPin size={10} /> {a.region}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {alerts.length === 0 && <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">{t('noAlerts')}</div>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="px-6 mt-6 max-w-7xl mx-auto space-y-6">
        
        {/* Dynamic Fields Carousel */}
        <div className="flex overflow-x-auto pb-4 gap-4 hide-scrollbar snap-x">
          {loadingCrops ? (
            <div className="min-w-[200px] h-24 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-2xl"></div>
          ) : (
            <>
              {crops.map((crop) => {
                const ageDays = Math.max(0, Math.floor((new Date() - new Date(crop.sowingDate))/(1000*60*60*24)));
                const isSelected = selectedCropId === crop.id;
                return (
                  <div 
                    key={crop.id} 
                    onClick={() => setSelectedCropId(crop.id)}
                    className={`snap-start min-w-[220px] bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm relative group cursor-pointer hover:shadow-md transition border-2 ${
                      isSelected ? 'border-green-500 dark:border-green-400 ring-2 ring-green-500/20' : 'border-transparent'
                    }`}
                  >
                    <button onClick={(e) => handleHarvestCrop(crop.id, e)} className="absolute top-2 right-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-full text-gray-400 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 transition">
                      <Trash2 size={16} />
                    </button>
                    <h3 className="font-bold text-green-800 dark:text-green-400 text-lg">{crop.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {t(crop.type) || crop.type} • {ageDays} {t('days')}
                    </p>
                    {crop.expectedYield && (
                      <p className="text-[11px] text-gray-400 mt-1 font-medium">
                        {crop.expectedYield} Qtl • {crop.area} {t('acres')}
                      </p>
                    )}
                  </div>
                );
              })}
              
              <div onClick={() => setShowAddModal(true)} className="snap-start min-w-[160px] bg-green-50 dark:bg-green-900/20 border border-dashed border-green-300 dark:border-green-700 p-4 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/40 transition">
                <div className="w-10 h-10 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center text-green-700 dark:text-green-300 mb-2">
                  <Plus size={20} />
                </div>
                <p className="text-sm font-bold text-green-800 dark:text-green-400">{t('addCrop')}</p>
              </div>
            </>
          )}
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LiveWeatherWidget weather={weather} onClick={() => setShowWeatherModal(true)} t={t} />
          
          {/* Main Action Card */}
          <div onClick={() => navigate('/scanner')} className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-800 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden cursor-pointer hover:shadow-2xl transition-all hover:-translate-y-1 active:translate-y-0">
             <div className="relative z-10">
               <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-wider backdrop-blur-sm border border-white/30">{t('aiDiagnostic')}</span>
               <h2 className="text-3xl font-extrabold mt-4">{t('scanCrop')}</h2>
               <p className="text-green-50 mt-2 font-medium">{t('scanDesc')}</p>
               <div className="mt-6 flex items-center text-sm font-bold opacity-90 group">
                 {t('tapCamera')} <ArrowRight className="ml-2 group-hover:translate-x-1 transition" size={18} />
               </div>
             </div>
             <Camera size={140} className="absolute -bottom-8 -right-8 text-white opacity-10 rotate-12" />
          </div>
          
          {/* Market Intelligence Card */}
          <div onClick={() => navigate('/mandi')} className="bg-gradient-to-br from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-700 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden cursor-pointer hover:shadow-2xl transition-all hover:-translate-y-1 active:translate-y-0">
             <div className="relative z-10">
               <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-wider backdrop-blur-sm border border-white/30">{t('mi_tab_data')} & {t('mi_tab_calc')}</span>
               <h2 className="text-3xl font-extrabold mt-4">{t('mi_title')}</h2>
               <p className="text-amber-50 mt-2 font-medium">{t('mi_subtitle')}</p>
               <div className="mt-6 flex items-center text-sm font-bold opacity-90 group">
                 {t('mi_tab_data')} <ArrowRight className="ml-2 group-hover:translate-x-1 transition" size={18} />
               </div>
             </div>
             <svg className="absolute -bottom-4 -right-4 text-white opacity-10 rotate-12" width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>

          {/* Dynamic Tasks Widget (Clickable to open Tasks & History Modal, filtered by selected crop) */}
          {(() => {
            const activeCrop = crops.find(c => c.id === selectedCropId) || crops[0];
            const activeCropTasks = selectedCropId 
              ? tasks.filter(t => !t.cropId || t.cropId === selectedCropId)
              : tasks;

            return (
              <div 
                onClick={() => setShowTasksModal(true)}
                className="col-span-1 md:col-span-2 lg:col-span-3 bg-white dark:bg-gray-800 rounded-3xl p-5 md:p-6 shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-md transition group"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-gray-50 dark:border-gray-800 pb-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-green-600 dark:group-hover:text-green-400 transition">
                      {t('todaysTasks')}
                    </h3>
                    <div className="flex items-center gap-2">
                      {activeCrop && (
                        <span className="text-[11px] font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full border border-green-200 dark:border-green-800">
                          {activeCrop.name}
                        </span>
                      )}
                      <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-lg">
                        {t('liveAi')}
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Link (Top Right) */}
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400 flex items-center group-hover:translate-x-1 transition">
                    {t('viewAllHistory')} <ArrowRight size={16} className="ml-1" />
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {activeCropTasks.length === 0 && (
                    <div className="py-6 text-center bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                      <p className="text-gray-400 dark:text-gray-500 text-sm italic">{t('allCaughtUp')}</p>
                    </div>
                  )}
                  {activeCropTasks.slice(0, 2).map(tData => {
                    const title = tData.titleKey ? t(tData.titleKey) : tData.title;
                    const desc = tData.descKey ? t(tData.descKey) : tData.desc;
                    return (
                      <div key={tData.id} className={`flex items-start sm:items-center gap-4 p-4 rounded-2xl border ${tData.type === 'urgent' ? 'bg-red-50/50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30' : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700'}`}>
                        <div className={`shrink-0 mt-1 sm:mt-0 ${tData.type === 'urgent' ? 'text-red-500 dark:text-red-400' : 'text-blue-500 dark:text-blue-400'}`}>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tData.type === 'urgent' ? 'bg-red-100 dark:bg-red-900/40' : 'bg-blue-100 dark:bg-blue-900/40'}`}>
                            <div className="w-2.5 h-2.5 rounded-full bg-current"></div>
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className={`font-bold text-sm sm:text-base ${tData.type === 'urgent' ? 'text-red-900 dark:text-red-300' : 'text-gray-900 dark:text-gray-200'}`}>{title}</p>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">{desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>

        {/* CROP GROWTH & AI INSIGHTS COMPARATIVE GRAPH */}
        <div className="w-full">
          <CropGrowthWidget 
            crops={crops} 
            activeCropId={selectedCropId} 
            onSelectCrop={setSelectedCropId} 
            t={t} 
          />
        </div>

      </div>

      {/* Today's Tasks & History Modal */}
      <AnimatePresence>
        {showTasksModal && (
          <TasksHistoryModal
            isOpen={showTasksModal}
            onClose={() => setShowTasksModal(false)}
            tasks={tasks}
            history={taskHistory}
            activeCropId={selectedCropId}
            crops={crops}
            onTaskCompleted={handleTaskCompleted}
            t={t}
          />
        )}
      </AnimatePresence>

      {/* Add Crop Modal (Enhanced for Mid-Season Farmers) */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 dark:text-white">{t('addCrop')}</h2>
              <form onSubmit={handleAddCrop} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('fieldName')}</label>
                  <input 
                    type="text" 
                    value={newCropName} 
                    onChange={e=>setNewCropName(e.target.value)} 
                    required 
                    placeholder={t('fieldNamePlaceholder')} 
                    className="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:border-green-500 dark:focus:border-green-500" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('cropType')}</label>
                    <select 
                      value={newCropType} 
                      onChange={e=>setNewCropType(e.target.value)} 
                      className="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:border-green-500 dark:focus:border-green-500 font-semibold"
                    >
                      <option value="Tomato">{t('Tomato')}</option>
                      <option value="Cotton">{t('Cotton')}</option>
                      <option value="Corn">{t('Corn')}</option>
                      <option value="Wheat">{t('Wheat')}</option>
                      <option value="Soybean">{t('Soybean')}</option>
                      <option value="Sugarcane">{t('Sugarcane')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('areaAcres')}</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={newCropArea} 
                      onChange={e=>setNewCropArea(e.target.value)} 
                      required 
                      className="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:border-green-500 dark:focus:border-green-500 font-semibold" 
                    />
                  </div>
                </div>

                {/* Mid-Season Adoption: Days already spent */}
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl space-y-2">
                  <label className="text-xs font-bold text-amber-900 dark:text-amber-300 block">
                    {t('daysAlreadySpent')}
                  </label>
                  <input 
                    type="number" 
                    min="0"
                    max="300"
                    value={daysSpent} 
                    onChange={e=>setDaysSpent(e.target.value)} 
                    placeholder={t('daysAlreadySpentPlaceholder')} 
                    className="w-full p-2.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl border border-amber-300 dark:border-amber-800 outline-none focus:border-green-500 text-sm font-bold" 
                  />
                  <p className="text-[11px] text-amber-700 dark:text-amber-400">
                    {parseInt(daysSpent) > 0 ? `Calculated planting date: ~${new Date(Date.now() - parseInt(daysSpent)*24*60*60*1000).toLocaleDateString()}` : 'New crop starting from Day 1'}
                  </p>
                </div>

                {/* Expected Production / Yield & Stage */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('expectedYield')}</label>
                    <input 
                      type="number" 
                      step="1"
                      value={expectedYield} 
                      onChange={e=>setExpectedYield(e.target.value)} 
                      placeholder="e.g. 150" 
                      className="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:border-green-500 dark:focus:border-green-500 text-sm" 
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('growthStage')}</label>
                    <select 
                      value={cropStage} 
                      onChange={e=>setCropStage(e.target.value)} 
                      className="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:border-green-500 dark:focus:border-green-500 text-xs font-semibold"
                    >
                      <option value="stageGermination">{t('stageGermination')}</option>
                      <option value="stageVegetative">{t('stageVegetative')}</option>
                      <option value="stageFlowering">{t('stageFlowering')}</option>
                      <option value="stageFruiting">{t('stageFruiting')}</option>
                      <option value="stageMaturity">{t('stageMaturity')}</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button 
                    type="button" 
                    onClick={()=>setShowAddModal(false)} 
                    className="flex-1 p-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                  >
                    {t('close')}
                  </button>
                  <button 
                    type="submit" 
                    disabled={savingCrop}
                    className="flex-1 p-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {savingCrop ? '...' : t('save')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Weather Modal */}
      <AnimatePresence>
        {showWeatherModal && weather && (
          <WeatherTelecastModal weather={weather} onClose={() => setShowWeatherModal(false)} t={t} />
        )}
      </AnimatePresence>

    </div>
  );
};

export default Dashboard;

