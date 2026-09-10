import React from 'react';
import { CloudRain, Sun, Cloud, CloudLightning } from 'lucide-react';
import { motion } from 'framer-motion';

const LiveWeatherWidget = ({ weather, onClick, t }) => {
  if (!weather) {
    // Loading skeleton
    return (
      <div className="bg-gray-200 animate-pulse rounded-3xl p-6 h-full min-h-[200px]"></div>
    );
  }

  const { current } = weather;
  const { color, icon, label } = current.state;

  // Determine gradients based on weather state color
  let gradientClasses = 'from-blue-500 to-blue-700';
  if (color === 'gray') gradientClasses = 'from-gray-500 to-gray-700';
  if (color === 'purple') gradientClasses = 'from-purple-600 to-purple-800';

  const renderIcon = (iconName) => {
    switch (iconName) {
      case 'Sun': return <Sun size={120} />;
      case 'CloudRain': return <CloudRain size={120} />;
      case 'CloudLightning': return <CloudLightning size={120} />;
      default: return <Cloud size={120} />;
    }
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`bg-gradient-to-br ${gradientClasses} rounded-3xl p-6 text-white shadow-xl h-full flex flex-col justify-between relative overflow-hidden cursor-pointer`}
    >
      <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
        {renderIcon(icon)}
      </div>
      
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-sm md:text-base opacity-80 font-medium tracking-wide uppercase">{t ? t('liveWeather') : 'Live Weather'}</p>
          <h2 className="text-5xl md:text-6xl font-bold mt-2">{current.currentTemp}°</h2>
          <p className="text-lg font-medium mt-1 opacity-90">{t && current.state.key ? t(current.state.key) : label}</p>
        </div>
      </div>
      
      <div className="relative z-10 mt-6 bg-white/20 rounded-xl p-4 backdrop-blur-md border border-white/30 flex justify-between items-center">
        <div>
          <p className="text-xs opacity-80 uppercase tracking-wider font-bold">{t ? t('humidity') : 'Humidity'}</p>
          <p className="font-bold text-lg">{current.humidity}%</p>
        </div>
        <div className="h-8 w-px bg-white/30"></div>
        <div>
          <p className="text-xs opacity-80 uppercase tracking-wider font-bold">{t ? t('rainToday') : 'Rain Today'}</p>
          <p className="font-bold text-lg">{current.rain}mm</p>
        </div>
        <div className="h-8 w-px bg-white/30"></div>
        <div className="text-right">
          <p className="text-xs font-bold text-white/90 underline decoration-white/50">{t ? t('tapForTelecast') : 'Tap for 3-Day Telecast →'}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default LiveWeatherWidget;
