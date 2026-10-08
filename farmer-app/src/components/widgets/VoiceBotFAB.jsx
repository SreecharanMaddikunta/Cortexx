import React, { useState, useEffect, useRef } from 'react';
import { useVoice } from '../../context/VoiceContext';
import { Mic, MicOff, Volume2, X, MessageSquare, Globe, Camera, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceBotFAB = () => {
  const { 
    isListening, 
    isSpeaking, 
    currentTranscript, 
    chatHistory,
    selectedLanguage,
    changeLanguage,
    startListening, 
    stopListening,
    stopSpeaking 
  } = useVoice();
  
  const [isOpen, setIsOpen] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, currentTranscript, isOpen]);

  // Open chat automatically if speaking or listening
  useEffect(() => {
    if (isListening || isSpeaking || currentTranscript) {
      setIsOpen(true);
    }
  }, [isListening, isSpeaking, currentTranscript]);

  const toggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.9, y: 20 }} 
            className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl mb-4 w-[90vw] sm:w-96 flex flex-col overflow-hidden border border-gray-100 dark:border-gray-800 origin-bottom-right"
            style={{ maxHeight: '60vh' }}
          >
            {/* Header */}
            <div className="bg-green-600 dark:bg-green-700 text-white p-4 flex justify-between items-center shadow-md z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Kisan Mitra AI</h3>
                  <p className="text-xs text-green-200">Voice Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Language Selector */}
                <div className="relative group">
                  <button className="flex items-center gap-1 text-xs bg-black/20 px-2 py-1 rounded hover:bg-black/30 transition">
                    <Globe size={14} />
                    {selectedLanguage.split('-')[0].toUpperCase()}
                  </button>
                  <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded shadow-lg hidden group-hover:flex flex-col overflow-hidden text-sm">
                    <button onClick={() => changeLanguage('te-IN')} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-left whitespace-nowrap">Telugu</button>
                    <button onClick={() => changeLanguage('hi-IN')} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-left whitespace-nowrap">Hindi</button>
                    <button onClick={() => changeLanguage('mr-IN')} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-left whitespace-nowrap">Marathi</button>
                    <button onClick={() => changeLanguage('en-IN')} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-left whitespace-nowrap">English</button>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 flex flex-col gap-3 min-h-[250px]">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-green-500 text-white rounded-tr-sm' 
                      : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-sm'
                  }`}>
                    <div>{msg.text}</div>
                    
                    {msg.status && !msg.text && (
                       <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 italic text-sm mt-1">
                          <Loader className="w-3 h-3 animate-spin" />
                          <span>{msg.status}</span>
                       </div>
                    )}
                    
                    {msg.isStreaming && msg.text && (
                       <span className="inline-block w-1.5 h-3 ml-1 bg-green-500 animate-pulse"></span>
                    )}
                    
                    {/* Visual UI Summary Card */}
                    {msg.uiData && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 text-xs">
                        <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">{msg.uiData.title || 'Crop Summary'}</h4>
                        <div className={`inline-block px-2 py-0.5 rounded-full mb-2 font-semibold ${
                          ['EXCELLENT', 'HEALTHY', 'GOOD'].includes(msg.uiData.overall_status) ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          ['NEEDS_ATTENTION', 'MODERATE'].includes(msg.uiData.overall_status) ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {msg.uiData.overall_status?.replace(/_/g, ' ')}
                        </div>
                        <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                          {msg.uiData.details?.map((detail, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span className="text-gray-400 mt-0.5">•</span>
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {(msg.action === 'PROMPT_SCAN' || msg.delayedScan) && (
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          window.location.href = '/scanner';
                        }}
                        className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-xl shadow-sm transition"
                      >
                        <Camera size={14} />
                        <span>Scan {msg.cropType || 'Crop'} Now</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Live Transcript Bubble */}
              {currentTranscript && (
                <div className="flex justify-end">
                  <div className="max-w-[80%] bg-green-100 dark:bg-green-900/40 text-green-900 dark:text-green-300 border border-green-200 dark:border-green-800 rounded-2xl rounded-tr-sm px-4 py-2 text-sm shadow-sm opacity-80 italic flex flex-col items-end">
                    <span>{currentTranscript}</span>
                    <span className="flex gap-1 mt-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                    </span>
                  </div>
                </div>
              )}
              
              {/* AI Speaking Indicator & Stop Button */}
              {isSpeaking && (
                <div className="flex justify-start flex-col gap-2">
                   <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-sm px-4 py-2 shadow-sm flex items-center gap-2 max-w-[85%]">
                      <Volume2 size={16} className="text-blue-500 dark:text-blue-400 animate-pulse" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">Cortex is speaking...</span>
                   </div>
                   <button 
                     onClick={stopSpeaking}
                     className="self-start ml-2 flex items-center gap-1.5 text-xs font-bold bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 px-3 py-1.5 rounded-xl shadow-sm transition border border-red-200 dark:border-red-800/50"
                   >
                     <X size={14} /> Stop Speaking
                   </button>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>
            
            {/* Input Hint */}
            <div className="p-3 bg-white dark:bg-gray-800 text-center text-xs text-gray-400 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <span>{isListening ? "Listening... Speak now." : "Tap the microphone to speak"}</span>
              {isSpeaking && (
                <button onClick={stopSpeaking} className="text-red-500 hover:text-red-600 font-bold bg-red-50 px-2 py-1 rounded">Stop ⏹</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button 
        whileHover={{ scale: 1.05 }} 
        whileTap={{ scale: 0.95 }} 
        onClick={isOpen ? toggleMic : () => setIsOpen(true)} 
        className={`p-4 rounded-full shadow-2xl text-white flex items-center justify-center transition-colors ${
          isListening 
            ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse' 
            : isSpeaking 
              ? 'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)]' 
              : 'bg-green-600 dark:bg-green-700 hover:bg-green-500 dark:hover:bg-green-600'
        }`}
      >
        {isListening ? <MicOff size={28} /> : isSpeaking ? <Volume2 size={28} className="animate-pulse" /> : <Mic size={28} />}
      </motion.button>
    </div>
  );
};

export default VoiceBotFAB;
