import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

const MyFieldsCarousel = ({ activeCrop, setActiveCrop }) => {
  const crops = [
    { id: 1, name: 'Tomato Field A', type: 'Tomato', age: '45 Days' },
    { id: 2, name: 'Corn Field B', type: 'Corn', age: '12 Days' },
    { id: 3, name: 'Wheat Farm', type: 'Wheat', age: '80 Days' },
  ];

  return (
    <div className="w-full mb-8 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">My Fields</h2>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x" style={{ scrollbarWidth: 'none' }}>
        {crops.map((crop) => (
          <motion.div
            key={crop.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveCrop(crop)}
            className={`min-w-[160px] md:min-w-[200px] p-4 rounded-2xl snap-start cursor-pointer border-2 transition-all ${
              activeCrop?.id === crop.id 
              ? 'border-green-500 bg-green-50 shadow-md' 
              : 'border-transparent bg-white shadow-sm hover:border-gray-200'
            }`}
          >
            <h3 className={`font-bold ${activeCrop?.id === crop.id ? 'text-green-800' : 'text-gray-800'}`}>
              {crop.name}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{crop.type} • {crop.age}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MyFieldsCarousel;
