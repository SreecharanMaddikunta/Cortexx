import React from 'react';
import { motion } from 'framer-motion';
import { X, CloudRain, Sun, Cloud, Thermometer, Droplets, MapPin } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const WeatherTelecastModal = ({ weather, onClose, t }) => {
  if (!weather) return null;

  const { current, yesterday, tomorrow, hourly } = weather;

  // Process Hourly Data for Graph (Next 24 hours starting from current hour)
  const currentHour = new Date().getHours();
  const graphData = [];
  
  // Open-Meteo returns hourly data for multiple days as a flat array.
  // We grab 24 data points starting from the current hour of today (index 24 is start of today).
  // Time array: [ "2026-09-08T00:00", ... "2026-09-09T00:00", ... ]
  // The first 24 are yesterday, next 24 are today, next 24 tomorrow.
  const startIndex = 24 + currentHour; 
  
  if (hourly && hourly.time) {
    for (let i = 0; i < 12; i++) {
      const idx = startIndex + (i * 2); // Every 2 hours
      if (idx < hourly.time.length) {
        const timeStr = new Date(hourly.time[idx]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        graphData.push({
          time: timeStr,
          temp: hourly.temperature_2m[idx],
          rainProb: hourly.precipitation_probability[idx]
        });
      }
    }
  }

  const renderDayCard = (title, dayData, isToday = false) => {
    return (
      <div className={`p-4 rounded-3xl border ${isToday ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/50' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'}`}>
        <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>{title}</p>
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isToday ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400'}`}>
            {dayData.state.icon === 'Sun' ? <Sun size={24} /> : 
             dayData.state.icon === 'CloudRain' ? <CloudRain size={24} /> : <Cloud size={24} />}
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white">{t && dayData.state.key ? t(dayData.state.key) : dayData.state.label}</p>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-0.5">{dayData.rain}mm {t ? t('rainToday') : 'Rain'}</p>
          </div>
        </div>
        <div className="flex justify-between items-center bg-white/50 dark:bg-gray-900/50 p-2 rounded-xl">
          <div className="flex items-center gap-1 text-red-500 font-bold text-sm"><Thermometer size={16} /> H: {dayData.maxTemp}°</div>
          <div className="flex items-center gap-1 text-blue-500 font-bold text-sm"><Thermometer size={16} /> L: {dayData.minTemp}°</div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-end sm:items-center bg-black/60 backdrop-blur-sm p-4 sm:p-0">
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-[40px] shadow-2xl overflow-hidden relative"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-950 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{t ? t('weatherForecast') : 'Weather Forecast'}</h2>
            <p className="text-blue-100 text-sm flex items-center gap-1 mt-1"><MapPin size={14} /> {t ? t('district') : 'Pune District'}</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition backdrop-blur-md text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {/* Graph Section */}
          {graphData.length > 0 && (
            <div className="mb-8">
              <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Thermometer className="text-red-500" size={20} />
                {t ? t('temperatureTrend') : '24-Hour Temperature Trend'}
              </h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={graphData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: '1px solid #374151', backgroundColor: '#1f2937', color: '#fff', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#9ca3af' }}
                    />
                    <Area type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* 3 Day Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {renderDayCard(t ? t('yesterday') : 'Yesterday', yesterday)}
            {renderDayCard(t ? t('today') : 'Today', current, true)}
            {renderDayCard(t ? t('tomorrow') : 'Tomorrow', tomorrow)}
          </div>

          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/30 rounded-2xl flex gap-3 text-yellow-800 dark:text-yellow-400 text-sm">
             <Droplets className="shrink-0 mt-0.5 text-yellow-600 dark:text-yellow-500" size={20} />
             <p className="font-medium">Irrigation Tip: Soil moisture is optimal today. Hold off on heavy watering until the weekend to prevent root rot.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WeatherTelecastModal;
