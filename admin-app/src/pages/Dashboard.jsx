import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { ShieldAlert, RefreshCw, Layers, MapPin } from 'lucide-react';
import HeatmapLayer from '../components/HeatmapLayer';

const Dashboard = () => {
  const [allReports, setAllReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('markers'); // 'markers' or 'heatmap'
  const [filterCrop, setFilterCrop] = useState('All');

  // Center map on Maharashtra
  const center = [18.5204, 73.8567]; 

  const fetchMapData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/admin/map`);
      
      // Inject beautifully scattered mock data around Pune (18.5204, 73.8567)
      const mockData = [
        { id: 'mock-corn-1', lat: 18.5400, lng: 73.8200, disease: 'Northern Leaf Blight', cropName: 'Sweet Corn', farmerName: 'Amit Patel', farmerPhone: '9876543210', confidence: '92%', severity: 'Medium', createdAt: new Date().toISOString() },
        { id: 'mock-corn-2', lat: 18.4900, lng: 73.8800, disease: 'Corn Smut', cropName: 'Field Corn', farmerName: 'Rahul Singh', farmerPhone: '9876543211', confidence: '88%', severity: 'Low', createdAt: new Date().toISOString() },
        { id: 'mock-wheat-1', lat: 18.5600, lng: 73.8900, disease: 'Wheat Rust', cropName: 'Winter Wheat', farmerName: 'Sneha Desai', farmerPhone: '9876543212', confidence: '95%', severity: 'High', createdAt: new Date().toISOString() },
        { id: 'mock-wheat-2', lat: 18.4800, lng: 73.8100, disease: 'Powdery Mildew', cropName: 'Spring Wheat', farmerName: 'Vikram Joshi', farmerPhone: '9876543213', confidence: '81%', severity: 'Medium', createdAt: new Date().toISOString() },
        { id: 'mock-cotton-1', lat: 18.5100, lng: 73.9200, disease: 'Cotton Boll Rot', cropName: 'Cotton', farmerName: 'Priya Sharma', farmerPhone: '9876543214', confidence: '89%', severity: 'High', createdAt: new Date().toISOString() },
        { id: 'mock-cotton-2', lat: 18.5300, lng: 73.7800, disease: 'Leaf Curl Virus', cropName: 'Cotton', farmerName: 'Rajesh Kumar', farmerPhone: '9876543215', confidence: '94%', severity: 'High', createdAt: new Date().toISOString() },
        { id: 'mock-tomato-1', lat: 18.5500, lng: 73.8500, disease: 'Early Blight', cropName: 'Tomato', farmerName: 'Anjali Verma', farmerPhone: '9876543216', confidence: '85%', severity: 'Medium', createdAt: new Date().toISOString() },
      ];

      setAllReports([...res.data, ...mockData]);
    } catch (err) {
      console.error("Failed to load map data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();
    const interval = setInterval(fetchMapData, 6000);
    return () => clearInterval(interval);
  }, []); // Run once on mount, no longer dependent on filterCrop

  // Define strict categories
  const CATEGORIES = ['Tomato', 'Corn', 'Wheat', 'Cotton'];

  // Helper to classify crop names
  const classifyCrop = (name) => {
      if (!name) return 'Other';
      const lower = name.toLowerCase();
      if (lower.includes('tomat')) return 'Tomato';
      if (lower.includes('corn')) return 'Corn';
      if (lower.includes('wheat')) return 'Wheat';
      if (lower.includes('cotton')) return 'Cotton';
      return 'Other';
  };

  // 1. STRICT FILTERING: Hide anything that is not one of the 4 core crops
  const cleanData = allReports.filter(r => classifyCrop(r.cropName) !== 'Other');

  // 2. Calculate which reports to show on map based on dropdown
  const mapReports = filterCrop === 'All' 
    ? cleanData 
    : cleanData.filter(r => classifyCrop(r.cropName) === filterCrop);

  const highRiskCount = mapReports.filter(r => r.severity === 'High').length;
  
  // Hardcode the unique crops to only show our strict categories (plus 'All')
  const uniqueCrops = ['All', ...CATEGORIES];

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 flex flex-col h-screen overflow-hidden transition-colors duration-200">
      
      {/* Top Header */}
      <header className="bg-white dark:bg-gray-800 px-8 py-5 shadow-sm border-b border-gray-200 dark:border-gray-700 z-10 flex justify-between items-center transition-colors duration-200">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">GIS Live Crop Disease Map</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Real-time state-wide monitoring & diagnostic geo-clusters</p>
        </div>
        <div className="flex items-center gap-4">
          
          {/* Crop Filter */}
          <select 
            value={filterCrop}
            onChange={(e) => setFilterCrop(e.target.value)}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {uniqueCrops.map(crop => (
              <option key={crop} value={crop}>{crop === 'All' ? 'All Crops' : crop}</option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('markers')}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition-colors ${viewMode === 'markers' ? 'bg-white dark:bg-gray-600 text-green-600 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            >
              <MapPin size={16} /> Markers
            </button>
            <button
              onClick={() => setViewMode('heatmap')}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition-colors ${viewMode === 'heatmap' ? 'bg-white dark:bg-gray-600 text-red-500 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            >
              <Layers size={16} /> Heatmap
            </button>
          </div>

          <button 
            onClick={fetchMapData} 
            className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded-lg text-gray-600 dark:text-gray-300 transition"
            title="Refresh Map"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg font-medium border border-red-200 dark:border-red-900/50 flex items-center gap-2">
            <ShieldAlert size={18} />
            <span>{highRiskCount} High Risk</span>
          </div>
        </div>
      </header>

      {/* Map Container */}
      <div className="flex-1 relative z-0">
        <MapContainer center={center} zoom={8} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          
          {viewMode === 'markers' && mapReports.map(report => (
            <Marker key={report.id} position={[report.lat, report.lng]}>
              <Popup>
                <div className="text-sm font-sans p-1">
                  <strong className="text-base text-gray-900">{report.disease}</strong><br/>
                  <div className="mt-1 text-xs text-gray-600">
                    <div>Crop: <span className="font-semibold text-green-700">{report.cropName}</span></div>
                    <div>Farmer: <span className="font-medium">{report.farmerName}</span> ({report.farmerPhone})</div>
                    <div>Confidence: <span className="font-semibold">{report.confidence}</span></div>
                    <div>Severity: <span className={`font-bold ${report.severity === 'High' ? 'text-red-600' : 'text-green-600'}`}>{report.severity}</span></div>
                    <div className="text-[10px] text-gray-400 mt-1">{new Date(report.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {viewMode === 'heatmap' && (
            <HeatmapLayer 
              points={mapReports.map(r => ({
                lat: r.lat, 
                lng: r.lng, 
                intensity: r.severity === 'High' ? 1.0 : (r.severity === 'Medium' ? 0.6 : 0.3) 
              }))} 
              options={{ radius: 25, blur: 15, maxZoom: 10 }}
            />
          )}

          {/* Render Outbreak Risk Zone around high cluster (Example static cluster) */}
          <Circle center={[18.525, 73.858]} pathOptions={{ fillColor: 'red', color: 'red' }} radius={5000}>
             <Popup>
               <div className="p-1">
                 <strong className="text-red-600">High Risk Outbreak Zone (Pune Core)</strong>
                 <p className="text-xs text-gray-600 mt-1">5km radius surveillance zone</p>
               </div>
             </Popup>
          </Circle>
        </MapContainer>
      </div>

    </div>
  );
};

export default Dashboard;
