import React, { useState, useEffect } from 'react';
import { BellRing, ShieldAlert, Send, Trash2, CheckCircle2, AlertTriangle, Info, MapPin, Radio } from 'lucide-react';
import axios from 'axios';

const AlertsBroadcasting = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Alert Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [region, setRegion] = useState('Pune & Western Maharashtra');
  const [severity, setSeverity] = useState('HIGH');
  const [submitting, setSubmitting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/admin/alerts');
      setAlerts(res.data);
    } catch (err) {
      console.error("Failed to load alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/admin/alert', {
        title,
        message,
        region,
        severity
      });
      setTitle('');
      setMessage('');
      setBroadcastSuccess(true);
      setTimeout(() => setBroadcastSuccess(false), 4000);
      await fetchAlerts();
    } catch (err) {
      console.error("Broadcast failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/alerts/${id}`);
      fetchAlerts();
    } catch (err) {
      console.error("Failed to delete alert:", err);
    }
  };

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-4 md:p-8 h-full overflow-y-auto transition-colors duration-200">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-600 text-white rounded-2xl shadow-lg shadow-red-500/20">
            <Radio size={24} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Emergency Alert Broadcasting</h2>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
              Broadcast critical weather advisories, flood warnings, and disease outbreak notices directly to farmers' dashboards in real-time.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Broadcast Form (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 h-fit">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700 mb-6">
            <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
              <BellRing size={20} className="text-red-500" /> New Alert Dispatch
            </h3>
            <span className="text-xs bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Live Broadcast
            </span>
          </div>

          {broadcastSuccess && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-2xl text-green-800 dark:text-green-300 flex items-center gap-3">
              <CheckCircle2 size={20} className="text-green-600 dark:text-green-400 shrink-0" />
              <div className="text-sm font-semibold">Alert successfully broadcasted to all active farmer dashboards!</div>
            </div>
          )}

          <form onSubmit={handleBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-2">
                Alert Severity Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSeverity(lvl)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      severity === lvl
                        ? lvl === 'HIGH'
                          ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-500/30'
                          : lvl === 'MEDIUM'
                            ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/30'
                            : 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/30'
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {lvl === 'HIGH' ? 'Critical (Red)' : lvl === 'MEDIUM' ? 'Warning (Orange)' : 'Notice (Blue)'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1">
                Target District / Region
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-3 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="All Maharashtra">All Maharashtra Districts (Statewide)</option>
                <option value="Pune & Western Maharashtra">Pune & Western Maharashtra</option>
                <option value="Nashik & North Maharashtra">Nashik & North Maharashtra</option>
                <option value="Nagpur & Vidarbha">Nagpur & Vidarbha</option>
                <option value="Marathwada Region">Marathwada Region</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1">
                Alert Headline / Subject
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Severe Hailstorm Warning for Next 24 Hours"
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-3 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1">
                Advisory Message & Agronomist Instructions
              </label>
              <textarea
                rows="4"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. Expected 40mm rainfall with gusty winds. Farmers are advised to postpone fertilizer application and secure fruit trellises immediately."
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-3 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-red-500 resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-red-500/30 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Send size={18} />
              <span>{submitting ? 'Broadcasting to Farmers...' : 'Dispatch Real-Time Alert'}</span>
            </button>
          </form>
        </div>

        {/* Active Broadcasts List (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700 mb-6">
            <div>
              <h3 className="font-bold text-lg text-gray-800 dark:text-white">Active Real-Time Alerts</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Currently live on farmers' portal and mobile notifications</p>
            </div>
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-full">
              {alerts.length} Active
            </span>
          </div>

          <div className="space-y-4">
            {alerts.map((a) => (
              <div 
                key={a.id} 
                className={`p-5 rounded-2xl border transition-all ${
                  a.severity === 'HIGH'
                    ? 'bg-red-50/70 dark:bg-red-950/20 border-red-200 dark:border-red-900/50'
                    : a.severity === 'MEDIUM'
                      ? 'bg-orange-50/70 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/50'
                      : 'bg-blue-50/70 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl shrink-0 ${
                      a.severity === 'HIGH'
                        ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                        : a.severity === 'MEDIUM'
                          ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                          : 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    }`}>
                      {a.severity === 'HIGH' ? <ShieldAlert size={20} /> : a.severity === 'MEDIUM' ? <AlertTriangle size={20} /> : <Info size={20} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                          a.severity === 'HIGH'
                            ? 'bg-red-200 dark:bg-red-900/60 text-red-800 dark:text-red-200'
                            : a.severity === 'MEDIUM'
                              ? 'bg-orange-200 dark:bg-orange-900/60 text-orange-800 dark:text-orange-200'
                              : 'bg-blue-200 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200'
                        }`}>
                          {a.severity}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <MapPin size={12} /> {a.region || 'All Maharashtra'}
                        </span>
                        <span className="text-xs text-gray-400">
                          • {new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-gray-900 dark:text-white mt-1">
                        {a.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1.5 leading-relaxed">
                        {a.message}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition"
                    title="Remove Alert"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            {alerts.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                <BellRing size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No alerts currently broadcasted.</p>
                <p className="text-xs mt-1">Submit an advisory using the form on the left.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AlertsBroadcasting;