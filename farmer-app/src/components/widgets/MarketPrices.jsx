import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MarketPrices = ({ cropType }) => {
  const prices = {
    Tomato: [{ market: 'Pune APMC', price: '₹45/kg', trend: 'up' }, { market: 'Nashik', price: '₹42/kg', trend: 'down' }],
    Corn: [{ market: 'Pune APMC', price: '₹22/kg', trend: 'up' }],
    Wheat: [{ market: 'Pune APMC', price: '₹30/kg', trend: 'down' }]
  };
  const currentPrices = prices[cropType] || prices['Tomato'];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
      <h3 className="font-bold text-gray-800 text-lg mb-4">Live Market Prices ({cropType})</h3>
      <div className="space-y-3">
        {currentPrices.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center p-3 rounded-xl hover:bg-gray-50 transition">
            <span className="font-medium text-gray-700">{item.market}</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900">{item.price}</span>
              {item.trend === 'up' ? <TrendingUp size={16} className="text-green-500" /> : <TrendingDown size={16} className="text-red-500" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default MarketPrices;
