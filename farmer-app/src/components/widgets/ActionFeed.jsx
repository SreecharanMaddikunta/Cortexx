import React from 'react';
import { Droplets, Sprout, Bug, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const ActionFeed = ({ activeCrop, weather }) => {
  // Determine if tomorrow has heavy rain based on real API data
  const isRainingTomorrow = weather?.tomorrow?.rain > 5;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 h-full">
      <h3 className="font-bold text-gray-800 text-lg mb-4">Today's Tasks</h3>
      <div className="space-y-4">
        
        {/* Dynamic Weather-driven task */}
        {isRainingTomorrow && (
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-start gap-4 p-3 bg-red-50 rounded-2xl border border-red-100">
            <div className="bg-red-500 p-2 rounded-full text-white"><AlertTriangle size={20} /></div>
            <div>
              <h4 className="font-bold text-red-900 text-sm">Delay Fertilizer</h4>
              <p className="text-red-700 text-xs mt-1">Heavy rain ({weather.tomorrow.rain}mm) expected tomorrow. Applying fertilizer today will wash away.</p>
            </div>
          </motion.div>
        )}

        {activeCrop?.type === 'Tomato' && !isRainingTomorrow && (
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-start gap-4 p-3 bg-blue-50 rounded-2xl border border-blue-100">
            <div className="bg-blue-500 p-2 rounded-full text-white"><Droplets size={20} /></div>
            <div>
              <h4 className="font-bold text-blue-900 text-sm">Irrigation Required</h4>
              <p className="text-blue-700 text-xs mt-1">Soil moisture is low (22%). Apply 40mm water.</p>
            </div>
          </motion.div>
        )}
        
        {activeCrop?.type === 'Corn' && !isRainingTomorrow && (
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-start gap-4 p-3 bg-yellow-50 rounded-2xl border border-yellow-100">
            <div className="bg-yellow-500 p-2 rounded-full text-white"><Sprout size={20} /></div>
            <div>
              <h4 className="font-bold text-yellow-900 text-sm">Fertilizer Window</h4>
              <p className="text-yellow-700 text-xs mt-1">Clear skies today. Apply Urea (Nitrogen) safely.</p>
            </div>
          </motion.div>
        )}

        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="flex items-start gap-4 p-3 bg-green-50 rounded-2xl border border-green-100">
          <div className="bg-green-500 p-2 rounded-full text-white"><Bug size={20} /></div>
          <div>
            <h4 className="font-bold text-green-900 text-sm">Routine Scan</h4>
            <p className="text-green-700 text-xs mt-1">Check leaves for spots.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
export default ActionFeed;
