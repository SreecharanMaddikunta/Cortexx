import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle2, Clock, Calendar, AlertCircle, Droplets, Bug, Sprout, Check, ChevronRight } from 'lucide-react';
import axios from 'axios';

const TasksHistoryModal = ({ isOpen, onClose, tasks = [], history = [], activeCropId, crops = [], onTaskCompleted, t }) => {
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'history'
  const [cropScope, setCropScope] = useState('active'); // 'active' | 'all'
  const [completingId, setCompletingId] = useState(null);

  if (!isOpen) return null;

  const activeCrop = crops.find(c => c.id === activeCropId) || crops[0];

  // Filter tasks based on cropScope
  const filteredTasks = cropScope === 'active' && activeCropId
    ? tasks.filter(t => !t.cropId || t.cropId === activeCropId)
    : tasks;

  const filteredHistory = cropScope === 'active' && activeCropId
    ? history.filter(h => !h.cropId || h.cropId === activeCropId)
    : history;

  const handleMarkComplete = async (taskId) => {
    try {
      setCompletingId(taskId);
      await axios.post(`http://localhost:5000/api/farmer/tasks/${taskId}/complete`);
      if (onTaskCompleted) {
        await onTaskCompleted(taskId);
      }
    } catch (err) {
      console.error("Failed to complete task:", err);
    } finally {
      setCompletingId(null);
    }
  };

  const getTaskIcon = (type, iconName) => {
    if (type === 'urgent' || iconName === 'bug') return <Bug size={20} className="text-red-500" />;
    if (type === 'water' || iconName === 'droplet') return <Droplets size={20} className="text-blue-500" />;
    if (type === 'fertilizer' || iconName === 'fertilizer') return <Sprout size={20} className="text-emerald-500" />;
    return <CheckCircle2 size={20} className="text-green-500" />;
  };

  const getPriorityBadge = (type) => {
    if (type === 'urgent') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
          {t('urgentPriority')}
        </span>
      );
    }
    if (type === 'water') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
          {t('waterPriority')}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
        {t('routinePriority')}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-green-600 to-emerald-700 dark:from-green-700 dark:to-emerald-900 text-white flex justify-between items-center relative">
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">{t('taskHistoryTitle')}</h2>
            <p className="text-xs sm:text-sm text-green-100 mt-1 flex items-center gap-1.5 opacity-90">
              <Calendar size={14} /> {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
              {activeCrop && (
                <span className="ml-2 px-2.5 py-0.5 rounded-full bg-white/20 text-white font-bold text-xs backdrop-blur-sm">
                  {activeCrop.name}
                </span>
              )}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition backdrop-blur-sm"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scope Filter (Selected Field vs All Fields) */}
        {crops.length > 1 && (
          <div className="px-6 pt-3 pb-1 bg-white dark:bg-gray-800 flex items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-700/60">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
              {t('tasksFor')}:
            </span>
            <div className="flex bg-gray-100 dark:bg-gray-700/60 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setCropScope('active')}
                className={`px-3 py-1 rounded-lg transition ${
                  cropScope === 'active'
                    ? 'bg-white dark:bg-gray-800 text-green-700 dark:text-green-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
                }`}
              >
                {activeCrop?.name || t('filterActiveCrop')}
              </button>
              <button
                onClick={() => setCropScope('all')}
                className={`px-3 py-1 rounded-lg transition ${
                  cropScope === 'all'
                    ? 'bg-white dark:bg-gray-800 text-green-700 dark:text-green-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
                }`}
              >
                {t('filterAllCrops')}
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 p-2 gap-2">
          <button
            onClick={() => setActiveTab('today')}
            className={`flex-1 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition ${
              activeTab === 'today'
                ? 'bg-white dark:bg-gray-800 text-green-700 dark:text-green-400 shadow-sm border border-gray-200/60 dark:border-gray-700'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Clock size={16} />
            {t('todaysTasksTab')}
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'today' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}>
              {filteredTasks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition ${
              activeTab === 'history'
                ? 'bg-white dark:bg-gray-800 text-green-700 dark:text-green-400 shadow-sm border border-gray-200/60 dark:border-gray-700'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <CheckCircle2 size={16} />
            {t('historyTab')}
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'history' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}>
              {filteredHistory.length}
            </span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'today' ? (
            filteredTasks.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('allCaughtUp')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                  {t('noTasksToday')}
                </p>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const titleText = task.titleKey ? t(task.titleKey) : task.title;
                const descText = task.descKey ? t(task.descKey) : task.desc;
                const isCompleting = completingId === task.id;

                return (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      task.type === 'urgent'
                        ? 'bg-red-50/60 dark:bg-red-950/20 border-red-100 dark:border-red-900/30'
                        : 'bg-gray-50 dark:bg-gray-900/70 border-gray-100 dark:border-gray-700/60'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                        task.type === 'urgent'
                          ? 'bg-red-100 dark:bg-red-900/40'
                          : 'bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700'
                      }`}>
                        {getTaskIcon(task.type, task.icon)}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                            {titleText}
                          </h4>
                          {getPriorityBadge(task.type)}
                          {task.crop && (
                            <span className="text-[11px] font-medium bg-gray-200/70 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-md">
                              {task.crop.name}
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                          {descText}
                        </p>
                      </div>
                    </div>

                    <button
                      disabled={isCompleting}
                      onClick={() => handleMarkComplete(task.id)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 active:scale-95 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-green-600/20 transition disabled:opacity-50 shrink-0 self-end sm:self-center"
                    >
                      <Check size={16} />
                      {isCompleting ? '...' : t('markDone')}
                    </button>
                  </motion.div>
                );
              })
            )
          ) : (
            filteredHistory.length === 0 ? (
              <div className="text-center py-12 px-4">
                <p className="text-gray-400 dark:text-gray-500 text-sm">
                  {t('noCompletedHistory')}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredHistory.map((item) => {
                  const titleText = item.titleKey ? t(item.titleKey) : item.title;
                  const descText = item.descKey ? t(item.descKey) : item.desc;
                  const dateStr = item.completedAt
                    ? new Date(item.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : new Date(item.createdAt).toLocaleDateString();

                  return (
                    <div 
                      key={item.id}
                      className="p-4 bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/80 flex items-start justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                          <CheckCircle2 size={18} />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 line-through opacity-75">
                              {titleText}
                            </h4>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                              {t('completedBadge')}
                            </span>
                            {item.crop && (
                              <span className="text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-md">
                                {item.crop.name}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {descText}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium shrink-0">
                        {dateStr}
                      </span>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold rounded-xl text-sm transition"
          >
            {t('close')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default TasksHistoryModal;
