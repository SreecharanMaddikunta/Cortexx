import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { calculateNetProceeds } from '../utils/calculator';
import {
  ArrowLeft, Search, RefreshCw, Calculator, LineChart, MapPin, 
  TrendingUp, TrendingDown, Info, Save, CheckCircle2, Trash2, Activity, Loader2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function MarketIntelligence() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('market'); 
  const [demoMode, setDemoMode] = useState(false);

  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({ commodity: 'Tomato', state: '', district: '' });

  const [calcInputs, setCalcInputs] = useState({
    commodity: 'Tomato', quantity: 10, unit: 'quintal', marketName: '',
    pricePerQuintal: 2500, transportCost: 500, loadingCost: 100, labourCost: 200,
    packagingCost: 0, otherCosts: 0, percentageCharges: 0, productionCost: 0
  });
  const [calcResult, setCalcResult] = useState(null);
  const [savedEstimates, setSavedEstimates] = useState([]);
  const [savingEstimate, setSavingEstimate] = useState(false);
  
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
    
  useEffect(() => {
    fetchMarketData();
    fetchSavedEstimates();
  }, [demoMode]);

  const abortControllerRef = useRef(null);

  const fetchMarketData = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Clear previous error to show loading state visibly
    setError(null);
    setLoading(true); 
    
    try {
      const token = localStorage.getItem('farmer_token');
      
      const res = await axios.get('http://localhost:5000/api/mandi/prices', {
        headers: { Authorization: `Bearer ${token}` },
        params: { commodity: filters.commodity, state: filters.state, district: filters.district, demo: demoMode ? 'true' : 'false' },
        signal: abortControllerRef.current.signal
      });
      
      setMarketData(res.data.records || []);
      setError(null);

    } catch (err) {
      if (axios.isCancel(err)) {
        console.log('Request canceled');
        return;
      }
      
      setMarketData([]);
      
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        // If the backend is unreachable or throws a generic error
        setError('Connection blocked by local firewall. Please click "Enable Demo Mode" above to simulate data for your presentation.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedEstimates = async () => {
    try {
      const token = localStorage.getItem('farmer_token');
      const res = await axios.get('http://localhost:5000/api/mandi/estimates', { headers: { Authorization: `Bearer ${token}` } });
      setSavedEstimates(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const res = calculateNetProceeds({ ...calcInputs, percentageCharges: calcInputs.percentageCharges / 100 });
    setCalcResult(res);
    setAnalysisResult(null); // Clear analysis when inputs change
    setAnalysisError(null);
  }, [calcInputs]);

  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!calcInputs.pricePerQuintal) return;
    setAnalyzing(true);
    try {
      const token = localStorage.getItem('farmer_token');
      const res = await axios.post(`http://localhost:5000/api/mandi/optimize?lang=${language}`, {
        commodity: calcInputs.commodity,
        quantity: Number(calcInputs.quantity) || 0,
        unit: calcInputs.unit,
        marketName: calcInputs.marketName || 'Manual Entry',
        pricePerQuintal: Number(calcInputs.pricePerQuintal) || 0,
        transportCost: Number(calcInputs.transportCost) || 0,
        loadingCost: Number(calcInputs.loadingCost) || 0,
        labourCost: Number(calcInputs.labourCost) || 0,
        packagingCost: Number(calcInputs.packagingCost) || 0,
        otherCosts: Number(calcInputs.otherCosts) || 0,
        percentageCharges: Number(calcInputs.percentageCharges) || 0,
        productionCost: Number(calcInputs.productionCost) || 0,
        marketData: marketData
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const apiResult = res.data;
      
      // Translate classification using dictionary
      let tCat = apiResult.category;
      let tReason = apiResult.reason;
      const margin = apiResult.margin;
      
      if (apiResult.category.includes('Good')) {
        tCat = t('adv_cat_good') || tCat;
        tReason = t('adv_reason_good') ? t('adv_reason_good').replace('{margin}', margin?.toFixed(1) || '') : tReason;
      } else if (apiResult.category.includes('Moderate')) {
        tCat = t('adv_cat_moderate') || tCat;
        tReason = t('adv_reason_moderate') ? t('adv_reason_moderate').replace('{margin}', margin?.toFixed(1) || '') : tReason;
      } else if (apiResult.category.includes('Low')) {
        tCat = t('adv_cat_low') || tCat;
        tReason = t('adv_reason_low') ? t('adv_reason_low').replace('{margin}', margin?.toFixed(1) || '') : tReason;
      } else if (apiResult.category.includes('Loss')) {
        tCat = t('adv_cat_loss') || tCat;
        tReason = t('adv_reason_loss') || tReason;
      } else {
        tCat = t('adv_cat_insufficient') || tCat;
        tReason = apiResult.missingCosts ? (t('adv_reason_no_cultivation') || tReason) : (t('adv_reason_no_revenue') || tReason);
      }

      // Translate recommendations
      const tRecs = apiResult.recommendations.map(r => {
        let title = r.title;
        let explanation = r.explanation;
        let limitation = r.limitation;
        
        if (r.id === 'potential_loss') {
          title = t('adv_rec_loss_title') || title;
          explanation = t('adv_rec_loss_desc') || explanation;
          if (apiResult.breakEvenTotal > 0 && apiResult.breakEvenTotal !== Infinity) {
             explanation += " " + (t('adv_rec_loss_breakeven') ? t('adv_rec_loss_breakeven').replace('{price}', apiResult.breakEvenTotal.toFixed(2)) : `You would need a selling price of ₹${apiResult.breakEvenTotal.toFixed(2)} per quintal to break even.`);
          }
        } else if (r.id === 'missing_cost') {
          title = t('adv_rec_missing_cost_title') || title;
          explanation = t('adv_rec_missing_cost_desc') || explanation;
        } else if (r.id === 'better_mandi') {
          title = t('adv_rec_better_mandi_title') || title;
          const altMandi = apiResult.comparisons?.[0];
          explanation = (t('adv_rec_better_mandi_desc') ? t('adv_rec_better_mandi_desc').replace('{market}', altMandi?.marketName || '') : `Selling there might yield higher returns.`) + ` Price is ₹${altMandi?.modalPrice}/qtl.`;
          limitation = t('adv_rec_mandi_incomplete') || limitation;
        } else if (r.id === 'similar_mandi') {
          title = t('adv_rec_similar_mandi_title') || title;
          explanation = t('adv_rec_similar_mandi_desc') || explanation;
        } else if (r.id === 'high_expenses') {
          title = t('adv_rec_high_exp_title') || title;
          explanation = t('adv_rec_high_exp_desc') || explanation;
        } else if (r.id === 'low_margin') {
          title = t('adv_rec_low_margin_title') || title;
          explanation = t('adv_rec_low_margin_desc') || explanation;
        } else if (r.id === 'stale_price') {
          title = t('adv_rec_stale_title') || title;
          explanation = (t('adv_rec_stale_desc') || 'The market price data used for this estimate is older than a week.');
        }

        return { ...r, title, explanation, limitation };
      });

      setAnalysisResult({
        classification: {
          category: tCat,
          margin: apiResult.margin,
          reason: tReason,
          missingCosts: apiResult.missingCosts
        },
        recommendations: tRecs,
        comparisons: apiResult.comparisons
      });
    } catch (err) {
      console.error("Failed to analyze selling opportunity:", err);
      setAnalysisError("Failed to connect to the Smart Harvest & Profit Optimizer service.");
      setAnalysisResult(null);
    } finally {
      setAnalyzing(false);
    }
  };

  const selectMarketForCalc = (marketObj) => {
    setCalcInputs({
      ...calcInputs, commodity: marketObj.commodity, marketName: `${marketObj.market}, ${marketObj.district}`, pricePerQuintal: marketObj.modalPrice
    });
    setActiveTab('calculator');
  };

  const handleSaveEstimate = async () => {
    setSavingEstimate(true);
    try {
      const token = localStorage.getItem('farmer_token');
      await axios.post('http://localhost:5000/api/mandi/estimates', {
        commodity: calcInputs.commodity,
        quantityQuintals: calcInputs.unit === 'tonne' ? calcInputs.quantity * 10 : calcInputs.unit === 'kilogram' ? calcInputs.quantity / 100 : calcInputs.quantity,
        marketName: calcInputs.marketName || 'Manual Entry', reportedPricePerQuintal: calcInputs.pricePerQuintal,
        priceDate: new Date().toISOString(), transportCost: calcInputs.transportCost,
        otherSellingCosts: Number(calcInputs.loadingCost) + Number(calcInputs.labourCost) + Number(calcInputs.packagingCost) + Number(calcInputs.otherCosts),
        percentageCharges: calcInputs.percentageCharges / 100, productionCost: calcInputs.productionCost,
        netProceeds: calcResult.netProceeds, estimatedProfit: calcResult.profit
      }, { headers: { Authorization: `Bearer ${token}` } });
      fetchSavedEstimates();
    } catch (err) { alert('Failed to save estimate'); } finally { setSavingEstimate(false); }
  };

  const handleDeleteEstimate = async (id) => {
    try {
      const token = localStorage.getItem('farmer_token');
      await axios.delete(`http://localhost:5000/api/mandi/estimates/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchSavedEstimates();
    } catch (err) { alert('Failed to delete estimate'); }
  };


  const validPrices = marketData.filter(d => d.modalPrice > 0);
  const highestPrice = validPrices.length ? Math.max(...validPrices.map(d => d.modalPrice)) : 0;
  const lowestPrice = validPrices.length ? Math.min(...validPrices.map(d => d.modalPrice)) : 0;
  
  const chartData = validPrices.slice(0, 5).map(d => ({ name: d.market, Modal: d.modalPrice, Min: d.minPrice, Max: d.maxPrice }));

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pb-32 transition-colors duration-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-white dark:bg-gray-800 shadow-sm rounded-b-3xl gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200"><ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" /></button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{t('mi_title')}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('mi_subtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 p-1.5 rounded-xl">
          <button onClick={() => setActiveTab('market')} className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${activeTab === 'market' ? 'bg-white dark:bg-gray-800 text-green-700 dark:text-green-400 shadow-sm' : 'text-gray-600 dark:text-gray-300'}`}><LineChart size={16} /> {t('mi_tab_data')}</button>
          <button onClick={() => setActiveTab('calculator')} className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${activeTab === 'calculator' ? 'bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-gray-600 dark:text-gray-300'}`}><Calculator size={16} /> {t('mi_tab_calc')}</button>
        </div>
      </div>

      <div className="px-6 mt-6 max-w-7xl mx-auto space-y-6">
        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 p-4 rounded-2xl flex justify-between items-center">
          <div className="flex items-center gap-3 text-amber-800 dark:text-amber-200">
            <Info size={20} />
            <div>
              <p className="text-sm font-bold">{t('mi_demo_missing')}</p>
              <p className="text-xs opacity-90">{t('mi_demo_desc')}</p>
            </div>
          </div>
          <button onClick={() => setDemoMode(!demoMode)} className={`px-4 py-2 rounded-lg font-bold text-sm transition ${demoMode ? 'bg-amber-500 text-white shadow-md' : 'bg-amber-200 dark:bg-amber-800 text-amber-900 hover:bg-amber-300'}`}>
            {demoMode ? t('mi_demo_active') : t('mi_demo_enable')}
          </button>
        </div>

        {activeTab === 'market' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <form onSubmit={e => {e.preventDefault(); fetchMarketData();}} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">{t('calc_commodity')}</label>
                  <input type="text" placeholder="e.g., Tomato" value={filters.commodity} onChange={e=>setFilters({...filters, commodity: e.target.value})} className="w-full mt-1 p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">State</label>
                  <input type="text" placeholder="e.g., Punjab" value={filters.state} onChange={e=>setFilters({...filters, state: e.target.value})} className="w-full mt-1 p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">District</label>
                  <input type="text" placeholder="e.g., Amritsar" value={filters.district} onChange={e=>setFilters({...filters, district: e.target.value})} className="w-full mt-1 p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div className="flex gap-2 col-span-1">
                  <button type="submit" className="flex-1 p-2.5 bg-green-600 text-white font-bold rounded-xl flex justify-center items-center gap-2 hover:bg-green-700 transition-colors"><Search size={16} /></button>
                </div>
              </form>
            </div>

            {error && <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-xl text-red-600 dark:text-red-400 text-sm font-semibold border border-red-200">{error}</div>}

            {!error && !loading && marketData.length > 0 && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 uppercase font-bold">Records</p>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{marketData.length}</h3>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 uppercase font-bold flex items-center gap-1"><TrendingUp size={14} className="text-green-500"/> High</p>
                    <h3 className="text-2xl font-black text-green-600 mt-1">₹{highestPrice}</h3>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 uppercase font-bold flex items-center gap-1"><TrendingDown size={14} className="text-red-500"/> Low</p>
                    <h3 className="text-2xl font-black text-red-500 mt-1">₹{lowestPrice}</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis dataKey="name" stroke="#888" fontSize={12} />
                          <YAxis stroke="#888" fontSize={12} />
                          <RechartsTooltip cursor={{fill: 'transparent'}} />
                          <Bar dataKey="Modal" fill="#16a34a" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold">
                        <tr><th className="p-4">{t('calc_commodity')}</th><th className="p-4">Market</th><th className="p-4">Modal (₹)</th><th className="p-4 text-center">Action</th></tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {marketData.map((row, i) => (
                          <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="p-4">{row.commodity}</td><td className="p-4">{row.market}</td>
                            <td className="p-4 font-bold text-green-600">{row.modalPrice}</td>
                            <td className="p-4 text-center">
                              <button onClick={() => selectMarketForCalc(row)} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-bold hover:bg-orange-200">{t('mi_tab_calc')}</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-gray-500 uppercase">{t('calc_commodity')}</label><input type="text" value={calcInputs.commodity} onChange={e=>setCalcInputs({...calcInputs, commodity: e.target.value})} className="w-full mt-1 p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl" /></div>
                <div><label className="text-xs font-bold text-gray-500 uppercase">{t('calc_quantity')}</label><div className="flex gap-2 mt-1"><input type="number" value={calcInputs.quantity} onChange={e=>setCalcInputs({...calcInputs, quantity: e.target.value})} className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 rounded-xl" /><select value={calcInputs.unit} onChange={e=>setCalcInputs({...calcInputs, unit: e.target.value})} className="w-24 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"><option value="quintal">Qtl</option><option value="kilogram">Kg</option><option value="tonne">Ton</option></select></div></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-gray-500 uppercase">{t('calc_market')}</label><input type="text" value={calcInputs.marketName} onChange={e=>setCalcInputs({...calcInputs, marketName: e.target.value})} className="w-full mt-1 p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 rounded-xl" /></div>
                <div><label className="text-xs font-bold text-gray-500 uppercase">{t('calc_price')}</label><input type="number" value={calcInputs.pricePerQuintal} onChange={e=>setCalcInputs({...calcInputs, pricePerQuintal: e.target.value})} className="w-full mt-1 p-2.5 bg-green-50 border border-green-300 rounded-xl font-bold" /></div>
              </div>
              <div className="pt-4 border-t border-gray-100"><h4 className="text-sm font-bold text-gray-700 mb-3">{t('calc_expenses')}</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div><label className="text-xs text-gray-500">{t('calc_transport')}</label><input type="number" value={calcInputs.transportCost} onChange={e=>setCalcInputs({...calcInputs, transportCost: e.target.value})} className="w-full mt-1 p-2 border rounded-lg text-sm" /></div>
                  <div><label className="text-xs text-gray-500">{t('calc_loading')}</label><input type="number" value={calcInputs.loadingCost} onChange={e=>setCalcInputs({...calcInputs, loadingCost: e.target.value})} className="w-full mt-1 p-2 border rounded-lg text-sm" /></div>
                  <div><label className="text-xs text-gray-500">{t('calc_labour')}</label><input type="number" value={calcInputs.labourCost} onChange={e=>setCalcInputs({...calcInputs, labourCost: e.target.value})} className="w-full mt-1 p-2 border rounded-lg text-sm" /></div>
                  <div><label className="text-xs text-gray-500">{t('calc_commission')}</label><input type="number" value={calcInputs.percentageCharges} onChange={e=>setCalcInputs({...calcInputs, percentageCharges: e.target.value})} className="w-full mt-1 p-2 border rounded-lg text-sm" /></div>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <div><label className="text-xs text-gray-500">{t('calc_production_cost')}</label><input type="number" value={calcInputs.productionCost} onChange={e=>setCalcInputs({...calcInputs, productionCost: e.target.value})} className="w-full mt-1 p-2 border rounded-lg text-sm" /></div>
              </div>
            </div>

            <div className="space-y-6">
              {calcResult && (
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 shadow-xl text-white">
                  <h3 className="text-lg font-bold text-gray-300 mb-6">{t('calc_results')}</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-gray-700 pb-2"><span className="text-sm text-gray-400">{t('calc_gross')}</span><span className="text-xl font-medium">₹{calcResult.grossValue.toLocaleString()}</span></div>
                    <div className="flex justify-between border-b border-gray-700 pb-2"><span className="text-sm text-red-400">{t('calc_total_exp')}</span><span className="text-lg font-medium text-red-400">- ₹{calcResult.totalSellingExpenses.toLocaleString()}</span></div>
                    <div className="flex justify-between pt-2"><span className="text-base font-bold text-green-400">{t('calc_net')}</span><span className="text-3xl font-black text-green-400">₹{calcResult.netProceeds.toLocaleString()}</span></div>
                    {calcResult.profit !== null && (
                      <div className="flex justify-between pt-4 border-t border-gray-700 mt-4"><span className="text-sm font-bold text-blue-300">{t('calc_profit')}</span><span className="text-2xl font-black text-blue-400">₹{calcResult.profit.toLocaleString()}</span></div>
                    )}
                  </div>
                  
                  <button onClick={handleAnalyze} disabled={analyzing} className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold flex justify-center items-center gap-2 text-sm transition disabled:opacity-70">
                    {analyzing ? <Loader2 size={16} className="animate-spin" /> : <Activity size={16} />}
                    {analyzing ? (t('analyzing') || 'Analyzing...') : (t('adv_analyze_btn') || 'Analyze My Selling Opportunity')}
                  </button>
                  <button onClick={handleSaveEstimate} className="w-full mt-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold flex justify-center items-center gap-2 text-sm transition">
                    <Save size={16} /> {t('calc_save')}
                  </button>
                </div>
              )}

              {analysisError && (
                <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-xl text-red-600 dark:text-red-400 text-sm font-semibold border border-red-200">
                  {analysisError}
                </div>
              )}

              {analysisResult && (
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Activity className="text-indigo-600" /> {t('adv_title') || 'Smart Profit Advisor'}
                  </h3>

                  <div className={`p-4 rounded-xl border ${
                    analysisResult.classification.category.includes('Good') ? 'bg-green-50 border-green-200 text-green-900 dark:bg-green-900/30 dark:border-green-800 dark:text-green-100' :
                    analysisResult.classification.category.includes('Moderate') ? 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-100' :
                    analysisResult.classification.category.includes('Loss') ? 'bg-red-50 border-red-200 text-red-900 dark:bg-red-900/30 dark:border-red-800 dark:text-red-100' :
                    'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-100'
                  }`}>
                    <h4 className="font-bold text-lg">{analysisResult.classification.category}</h4>
                    <p className="text-sm mt-1">{analysisResult.classification.reason}</p>
                    {calcResult.breakEvenTotal > 0 && calcResult.breakEvenTotal !== Infinity && (
                      <p className="text-sm mt-2 opacity-80 border-t border-current pt-2">
                        {t('adv_breakeven_label') || 'Break-even price:'} ₹{calcResult.breakEvenTotal.toFixed(2)}/qtl
                      </p>
                    )}
                  </div>

                  {analysisResult.recommendations.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-gray-700 dark:text-gray-300 text-sm uppercase">{t('adv_recs_title') || 'Recommendations'}</h4>
                      {analysisResult.recommendations.map(rec => (
                        <div key={rec.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                          <h5 className="font-bold text-sm text-gray-900 dark:text-white">{rec.title}</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{rec.explanation}</p>
                          {rec.limitation && <p className="text-xs text-amber-600 mt-2 flex items-center gap-1"><Info size={12}/> {rec.limitation}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
