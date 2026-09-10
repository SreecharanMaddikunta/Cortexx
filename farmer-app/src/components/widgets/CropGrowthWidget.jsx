import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Sparkles, Sprout, Award, Calendar, CheckCircle, ChevronDown } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const CropGrowthWidget = ({ crops = [], activeCropId, onSelectCrop, t }) => {
  // If no crop is selected yet, choose the first crop or fallback to default
  const selectedCrop = crops.find(c => c.id === activeCropId) || crops[0] || {
    id: 1,
    name: "Tomato Field A",
    type: "Tomato",
    sowingDate: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(),
    expectedYield: 140,
    stage: "Flowering"
  };

  const cropAgeDays = Math.max(
    1,
    Math.floor((new Date() - new Date(selectedCrop.sowingDate)) / (1000 * 60 * 60 * 24))
  );

  const isTomato = (selectedCrop.type || '').toLowerCase() === 'tomato';

  // Growth trajectory generator based on crop type
  const generateGrowthData = (type, currentDays) => {
    const totalDays = type.toLowerCase() === 'cotton' ? 150 : (type.toLowerCase() === 'wheat' ? 120 : 90);
    const step = Math.ceil(totalDays / 6);
    
    // Inject the exact current day into the intervals and sort
    const intervalsSet = new Set([0, step, step * 2, step * 3, step * 4, step * 5, totalDays, currentDays]);
    const intervals = Array.from(intervalsSet).sort((a, b) => a - b);

    return intervals.map((day) => {
      // Sigmoid-like theoretical curve
      const aiIdeal = Math.min(100, Math.round(100 / (1 + Math.exp(-0.06 * (day - totalDays / 2)))));
      
      // Farmer actual curve up to currentDays ONLY
      let actual = null;
      if (day <= currentDays) {
        // slight realistic variance around ideal
        const factor = isTomato ? 0.94 : 0.91;
        actual = Math.min(100, Math.round(aiIdeal * factor));
      }

      return {
        day: `Day ${day}`,
        dayNum: day,
        aiBenchmark: aiIdeal,
        actualGrowth: actual
      };
    });
  };

  const growthData = generateGrowthData(selectedCrop.type || 'Tomato', cropAgeDays);

  const getEstimatedHarvestDays = (type, currentAge) => {
    const totalCycle = type.toLowerCase() === 'cotton' ? 150 : (type.toLowerCase() === 'wheat' ? 120 : 90);
    return Math.max(0, totalCycle - currentAge);
  };

  const harvestInDays = getEstimatedHarvestDays(selectedCrop.type || 'Tomato', cropAgeDays);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-md border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
      {/* Widget Header & Crop Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-700">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
              <Sprout size={20} />
            </span>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">
                {t('cropGrowthAnalytics')}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('growthComparisonSubtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Crop Selector */}
        {crops.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400">{t('selectField')}</label>
            <select
              value={selectedCrop.id}
              onChange={(e) => onSelectCrop && onSelectCrop(parseInt(e.target.value))}
              className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 text-xs font-bold outline-none cursor-pointer focus:border-green-500"
            >
              {crops.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({t(c.type) || c.type})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{t('currentDay')}</p>
          <p className="text-lg font-extrabold text-gray-900 dark:text-white mt-0.5">
            {cropAgeDays} <span className="text-xs font-semibold text-gray-500">{t('days')}</span>
          </p>
        </div>

        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
          <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">{t('overallHealth')}</p>
          <p className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300 mt-0.5 flex items-center gap-1">
            {isTomato ? '94%' : '91%'}
            <span className="text-[10px] bg-emerald-200 dark:bg-emerald-900 px-1.5 py-0.5 rounded font-bold text-emerald-800 dark:text-emerald-200">Optimal</span>
          </p>
        </div>

        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/30">
          <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{t('targetYieldProgress')}</p>
          <p className="text-lg font-extrabold text-blue-700 dark:text-blue-300 mt-0.5">
            {selectedCrop.expectedYield ? `${selectedCrop.expectedYield} Qtl` : '120 Qtl'}
          </p>
        </div>

        <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-2xl border border-purple-100 dark:border-purple-900/30">
          <p className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">{t('harvestForecast')}</p>
          <p className="text-lg font-extrabold text-purple-700 dark:text-purple-300 mt-0.5">
            {harvestInDays} <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">{t('daysCount')}</span>
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="h-56 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
              </linearGradient>
              <linearGradient id="aiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:opacity-20" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} domain={[0, 100]} tickLine={false} unit="%" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                borderRadius: '16px', 
                border: 'none', 
                color: '#fff', 
                fontSize: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)' 
              }}
              formatter={(value, name) => [
                `${value}%`,
                name === 'actualGrowth' ? t('actualGrowthLegend') : t('aiBenchmarkLegend')
              ]}
            />
            {/* AI Benchmark Trajectory */}
            <Area 
              type="monotone" 
              dataKey="aiBenchmark" 
              stroke="#3b82f6" 
              strokeWidth={2} 
              strokeDasharray="4 4"
              fillOpacity={1} 
              fill="url(#aiGradient)" 
              name="aiBenchmark"
            />
            {/* Farmer Actual Growth */}
            <Area 
              type="monotone" 
              dataKey="actualGrowth" 
              stroke="#10b981" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#actualGradient)" 
              name="actualGrowth"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Legend & AI Insight Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
              <span className="font-bold text-gray-700 dark:text-gray-300">{t('actualGrowthLegend')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border-2 border-blue-500 border-dashed inline-block"></span>
              <span className="font-bold text-gray-500 dark:text-gray-400">{t('aiBenchmarkLegend')}</span>
            </div>
          </div>

          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full flex items-center gap-1">
            <Sparkles size={12} /> {selectedCrop.stage || t('stageFlowering')}
          </span>
        </div>

        {/* Live Agronomist AI note */}
        <div className="mt-3 p-3 bg-green-50/70 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 rounded-2xl flex items-start gap-2.5">
          <Sparkles size={18} className="text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-green-900 dark:text-green-300">
              {t('aiGrowthInsight')} ({t(selectedCrop.type) || selectedCrop.type})
            </p>
            <p className="text-xs text-green-800 dark:text-green-400 mt-0.5 leading-relaxed">
              {isTomato ? t('growthTomatoInsight') : t('growthGeneralInsight')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropGrowthWidget;
