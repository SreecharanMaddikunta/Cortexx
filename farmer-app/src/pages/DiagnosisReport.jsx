import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, Info, CheckCircle, ArrowLeft, ShieldAlert, HeartPulse, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const DiagnosisReport = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const report = location.state?.report;
  const errorData = location.state?.errorData;

  useEffect(() => {
    if (!report && !errorData) navigate('/dashboard');
  }, [report, errorData, navigate]);

  if (!report && !errorData) return null;

  // Handle Validation Errors Early
  if (errorData) {
    const isInvalid = errorData.status === 'INVALID_IMAGE';
    const isUnsupported = errorData.status === 'UNSUPPORTED_CROP';
    const isLowConf = errorData.status === 'LOW_CONFIDENCE';
    const isPoorQuality = errorData.status === 'POOR_IMAGE_QUALITY';

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="min-h-screen bg-gray-100 dark:bg-gray-950 flex flex-col justify-center items-center px-4">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center border border-gray-200 dark:border-gray-800">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={40} />
          </div>
          
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4">
            {isInvalid ? '⚠️ No Crop Detected' : 
             isUnsupported ? '⚠️ Crop Not Supported' : 
             (isLowConf || isPoorQuality) ? '⚠️ Unable to Diagnose Confidently' : 
             'Scan Failed'}
          </h2>

          {isInvalid && (
            <div className="text-gray-600 dark:text-gray-400 space-y-4">
              <p>The uploaded image does not appear to contain a supported crop or plant leaf.</p>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-sm">
                <p className="font-bold mb-2">Please upload a clear photo of:</p>
                <ul className="grid grid-cols-2 gap-2 text-left w-3/4 mx-auto">
                  <li>• Wheat</li>
                  <li>• Cotton</li>
                  <li>• Corn</li>
                  <li>• Tomato</li>
                </ul>
              </div>
            </div>
          )}

          {isUnsupported && (
            <div className="text-gray-600 dark:text-gray-400 space-y-4">
              <p>This crop is currently not supported by the AI system.</p>
              <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-xl font-medium">Supported crops: Wheat • Cotton • Corn • Tomato</p>
            </div>
          )}

          {(isLowConf || isPoorQuality) && (
            <div className="text-gray-600 dark:text-gray-400 space-y-4">
              <p>Please capture a clearer close-up image of the affected crop leaf.</p>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3">
            <button onClick={() => navigate('/scanner')} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-xl transition active:scale-95">
              Scan Another Image
            </button>
            <button onClick={() => navigate('/dashboard')} className="w-full py-4 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold rounded-2xl transition active:scale-95">
              Return to Dashboard
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Use the new detailed structure, or fallback to the legacy structure for old history items
  const details = report.detailedReport || {
    explanation: "No detailed explanation available for this legacy scan.",
    disclaimer: "Please consult a local agronomist.",
    whatToCheck: [],
    immediateSteps: JSON.parse(report.actionSteps || '[]'),
    furtherSteps: [],
    futureInsights: report.futureInsights
  };

  const isHealthy = report.disease.includes("Healthy");

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="min-h-screen bg-gray-100 dark:bg-gray-950 pb-32 transition-colors duration-200">
      {/* Header Image Area */}
      <div className="relative h-64 bg-gray-900 w-full overflow-hidden">
        {report.imageUrl && (
          <img src={report.imageUrl} alt="Scanned Crop" className="w-full h-full object-cover opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-100 dark:from-gray-950 to-transparent"></div>
        
        {/* Top Nav */}
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10">
          <button onClick={() => navigate('/dashboard')} className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition">
            <ArrowLeft size={24} />
          </button>
          <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/30">
            {new Date(report.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* Floating Title Card */}
        <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 translate-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-xl flex items-center justify-between border border-gray-100 dark:border-gray-800">
            <div className="flex-1 pr-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                 <Activity size={14} className="text-blue-500" /> AI Diagnosis Result
              </p>
              <h1 className={`text-xl sm:text-2xl font-extrabold leading-tight ${isHealthy ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {report.disease}
              </h1>
            </div>
            <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-inner ${isHealthy ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
              <span className="text-xl font-black">{details.matchText || `${Math.round(report.confidence * 100)}%`}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider">Match</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-16 space-y-6">
        
        {/* Explanation & Disclaimer Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
          <p className="text-gray-800 dark:text-gray-200 font-medium text-lg leading-relaxed whitespace-pre-line">{details.explanation}</p>
          <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 rounded-2xl flex gap-3 text-orange-800 dark:text-orange-400 text-sm">
             <AlertTriangle size={20} className="shrink-0 mt-0.5" />
             <p>{details.disclaimer}</p>
          </div>
        </div>

        {/* What to check (Differential Diagnosis) */}
        {details.whatToCheck && details.whatToCheck.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">What to check on your plant</h3>
            <div className="grid gap-3">
              {details.whatToCheck.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="text-2xl bg-white dark:bg-gray-700 w-10 h-10 rounded-xl shadow-sm flex items-center justify-center shrink-0">{item.icon}</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.symptom}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5"><ArrowLeft size={12} className="rotate-180" /> {item.cause}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Multi-Phase Action Plan */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-5">
            {isHealthy ? 'Crop Management Protocol' : 'Treatment Protocol'}
          </h3>
          
          {/* Phase 1: Immediate */}
          <div className="mb-6 relative">
             <div className={`flex items-center gap-2 font-bold mb-3 ${isHealthy ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
               {isHealthy ? <CheckCircle size={18} /> : <ShieldAlert size={18} />} Phase 1: Immediate Steps
             </div>
             <ul className="space-y-3 ml-1">
               {details.immediateSteps.map((step, idx) => (
                 <li key={idx} className={`flex gap-3 text-gray-800 dark:text-gray-200 p-3 rounded-xl border ${isHealthy ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100/50 dark:border-emerald-900/20' : 'bg-red-50/50 dark:bg-red-900/10 border-red-100/50 dark:border-red-900/20'}`}>
                   <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${isHealthy ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>{idx + 1}</div>
                   <span className="font-medium text-sm pt-0.5">{step}</span>
                 </li>
               ))}
             </ul>
          </div>

          {/* Important Notice */}
          {details.importantNotice && (
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl flex gap-3 text-amber-900 dark:text-amber-300 text-sm">
              <AlertTriangle size={20} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="font-bold uppercase tracking-wider text-xs text-amber-700 dark:text-amber-400 mb-1">Important</p>
                <p>{details.importantNotice}</p>
              </div>
            </div>
          )}

          {/* Phase 2: Further / Maintenance */}
          {details.furtherSteps && details.furtherSteps.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold mb-3">
                  <HeartPulse size={18} /> Phase 2: Follow-up Actions
                </div>
                <ul className="space-y-3 ml-1">
                  {details.furtherSteps.map((step, idx) => (
                    <li key={idx} className="flex gap-3 text-gray-800 dark:text-gray-200 bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100/50 dark:border-blue-900/20">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">{idx + 1}</div>
                      <span className="font-medium text-sm pt-0.5 whitespace-pre-line">{step}</span>
                    </li>
                  ))}
                </ul>

                {details.fungicideNote && (
                  <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl flex gap-3 text-purple-900 dark:text-purple-300 text-sm">
                    <AlertTriangle size={20} className="shrink-0 mt-0.5 text-purple-600 dark:text-purple-400" />
                    <div>
                      <p className="font-bold uppercase tracking-wider text-xs text-purple-700 dark:text-purple-400 mb-1">Fungicide Note</p>
                      <p>{details.fungicideNote}</p>
                    </div>
                  </div>
                )}
              </div>
          )}
        </div>

        {/* Future Insights */}
        <div className={`rounded-3xl p-6 shadow-sm border relative overflow-hidden ${isHealthy ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/30' : 'bg-gray-900 dark:bg-black border-gray-800 dark:border-gray-900'}`}>
           <div className="flex items-start gap-4 relative z-10">
            <div className={`p-3 rounded-2xl ${isHealthy ? 'bg-green-200 dark:bg-green-900/50 text-green-800 dark:text-green-400' : 'bg-gray-800 text-green-400'}`}>
              <Info size={28} />
            </div>
            <div className="space-y-3">
              <div>
                <h3 className={`text-sm font-bold uppercase tracking-wider mb-1 ${isHealthy ? 'text-green-800 dark:text-green-400' : 'text-gray-400'}`}>Future Agronomy Insight</h3>
                <p className={`font-medium leading-relaxed whitespace-pre-line ${isHealthy ? 'text-green-900 dark:text-green-200' : 'text-gray-200 dark:text-gray-300'}`}>{details.futureInsights}</p>
              </div>

              {(details.keyPreventionRule || details.keyPreventionRules) && (
                <div className="pt-3 border-t border-gray-800 dark:border-gray-800/80">
                  <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <ShieldAlert size={14} /> {Array.isArray(details.keyPreventionRules) ? 'Key Prevention Rules' : 'Key Prevention Rule'}
                  </div>
                  {Array.isArray(details.keyPreventionRules) ? (
                    <ul className="space-y-1.5">
                      {details.keyPreventionRules.map((rule, ridx) => (
                        <li key={ridx} className="text-xs text-gray-200 flex items-start gap-2">
                          <span className="text-red-400 mt-0.5">•</span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm font-semibold text-white/90 whitespace-pre-line">{details.keyPreventionRule}</p>
                  )}
                </div>
              )}

              {details.warningSigns && details.warningSigns.length > 0 && (
                <div className="pt-3 border-t border-gray-800 dark:border-gray-800/80">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <AlertTriangle size={14} /> Watch for these warning signs
                  </div>
                  <ul className="space-y-1.5">
                    {details.warningSigns.map((sign, sidx) => (
                      <li key={sidx} className="text-xs text-gray-300 flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5">•</span>
                        <span>{sign}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {details.importantDistinction && (
                <div className="pt-3 border-t border-gray-800 dark:border-gray-800/80">
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <ShieldAlert size={14} /> Important distinction
                  </div>
                  <div className="text-xs text-gray-300 whitespace-pre-line leading-relaxed">
                    {details.importantDistinction}
                  </div>
                </div>
              )}

              {details.quickFieldCheck && (
                <div className="pt-3 border-t border-gray-800 dark:border-gray-800/80">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <AlertTriangle size={14} /> Quick Field Check
                  </div>
                  <div className="text-xs text-gray-300 whitespace-pre-line leading-relaxed">
                    {details.quickFieldCheck}
                  </div>
                </div>
              )}

              {details.mainPreventionStrategy && (
                <div className="pt-3 border-t border-gray-800 dark:border-gray-800/80">
                  <div className="flex items-center gap-2 text-green-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <ShieldAlert size={14} /> Main Prevention Strategy
                  </div>
                  <div className="text-xs text-gray-300 whitespace-pre-line leading-relaxed">
                    {details.mainPreventionStrategy}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <a
            href="/reports/Wheat_Aphid_Infestation_Diagnosis_Report.pdf"
            download="Wheat_Aphid_Infestation_Diagnosis_Report.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-xl transition active:scale-95 flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download PDF Report
          </a>
          <button onClick={() => navigate('/dashboard')} className="flex-1 py-4 bg-gray-900 dark:bg-gray-800 hover:bg-black dark:hover:bg-gray-700 text-white font-bold rounded-2xl shadow-xl transition active:scale-95 flex items-center justify-center gap-2">
            <CheckCircle size={20} /> Acknowledge Report
          </button>
        </div>

      </div>
    </motion.div>
  );
};

export default DiagnosisReport;
