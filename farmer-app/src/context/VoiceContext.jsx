import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { useLanguage } from './LanguageContext';

const VoiceContext = createContext();
export const useVoice = () => useContext(VoiceContext);

export const VoiceProvider = ({ children }) => {
  const { language: appLanguage, changeLanguage: changeAppLanguage } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: 'Hello! Ask me about your crops, scan status, or analytics.', lang: 'en-IN' }
  ]);
  const [selectedLanguage, setSelectedLanguage] = useState(appLanguage || localStorage.getItem('farmer_lang') || 'en-IN'); 

  // Keep VoiceContext and LanguageContext in sync
  useEffect(() => {
    if (appLanguage && appLanguage !== selectedLanguage) {
      setSelectedLanguage(appLanguage);
    }
  }, [appLanguage]); 

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please use Google Chrome.");
      return;
    }

    // Stop any existing instance
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = selectedLanguage;

    recognition.onstart = () => {
      setIsListening(true);
      setCurrentTranscript('');
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      setCurrentTranscript(finalTranscript || interimTranscript);
      
      // If we got a final transcript, automatically process it after a short pause
      if (finalTranscript) {
        recognition.stop();
        handleUserMessage(finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      
      // If there was something recorded but not processed as final, process it
      if (currentTranscript) {
        handleUserMessage(currentTranscript);
      }
    }
  };

  // Store conversation context for multi-turn routing
  const conversationContext = useRef({});
  const audioQueue = useRef([]);
  const isPlayingQueue = useRef(false);
  const audioRef = useRef(null);

  const handleUserMessage = async (text) => {
    setCurrentTranscript('');
    setChatHistory(prev => [...prev, { role: 'user', text }]);
    
    try {
      setChatHistory(prev => [...prev, { role: 'ai', text: '', status: 'Checking your crops...', lang: selectedLanguage, isStreaming: true }]);
      
      // We will update the last element of the array
      const updateLastMessage = (updates) => {
        setChatHistory(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1] = { ...newHistory[newHistory.length - 1], ...updates };
          return newHistory;
        });
      };

      const response = await fetch('http://localhost:5000/api/voice/intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('farmer_token')}`
        },
        body: JSON.stringify({ 
          text: text, 
          context: conversationContext.current,
          language: selectedLanguage
        })
      });
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let fullReply = '';
      
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n\n');
            for (let line of lines) {
                if (line.startsWith('data: ')) {
                    const dataStr = line.replace('data: ', '');
                    try {
                        const data = JSON.parse(dataStr);
                        if (data.type === 'status') {
                           updateLastMessage({ status: data.message });
                        } else if (data.type === 'text_chunk') {
                           fullReply += (fullReply ? ' ' : '') + data.text;
                           updateLastMessage({ text: fullReply, status: null });
                           speakSentence(data.text, selectedLanguage);
                        } else if (data.type === 'ui_data') {
                           updateLastMessage({ uiData: data.uiData });
                        } else if (data.type === 'done') {
                           updateLastMessage({ isStreaming: false });
                        } else if (data.type === 'error') {
                           updateLastMessage({ text: "Processing failed: " + data.message, isStreaming: false, status: null });
                        }
                    } catch(e) {}
                }
            }
        }
      }
    } catch (error) {
      console.error(error);
      const fallbackReply = "Sorry, I am having trouble connecting to the network.";
      setChatHistory(prev => {
         const newHistory = [...prev];
         newHistory[newHistory.length - 1] = { role: 'ai', text: fallbackReply, lang: selectedLanguage, isStreaming: false, status: null };
         return newHistory;
      });
      speakSentence(fallbackReply, selectedLanguage);
    }
  };

  const processAudioQueue = async () => {
    if (isPlayingQueue.current || audioQueue.current.length === 0) return;
    isPlayingQueue.current = true;
    setIsSpeaking(true);
    
    const {text, lang} = audioQueue.current.shift();
    
    try {
      const audioUrl = `http://localhost:5000/api/voice/tts?lang=${encodeURIComponent(lang)}&text=${encodeURIComponent(text)}`;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        isPlayingQueue.current = false;
        if (audioQueue.current.length > 0) {
            processAudioQueue();
        } else {
            setIsSpeaking(false);
        }
      };
      
      audio.onerror = () => {
        playBrowserSynthesis(text, lang, () => {
           isPlayingQueue.current = false;
           if (audioQueue.current.length > 0) processAudioQueue();
           else setIsSpeaking(false);
        });
      };
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          playBrowserSynthesis(text, lang, () => {
             isPlayingQueue.current = false;
             if (audioQueue.current.length > 0) processAudioQueue();
             else setIsSpeaking(false);
          });
        });
      }
    } catch (err) {
       isPlayingQueue.current = false;
       processAudioQueue();
    }
  };

  const speakSentence = (text, targetLang) => {
    audioQueue.current.push({text, lang: targetLang});
    processAudioQueue();
  };

  const playBrowserSynthesis = (text, targetLang, onComplete) => {
    if (!synthRef.current) {
      if (onComplete) onComplete();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetLang;
    utterance.rate = 0.9;
    
    utterance.onend = () => { if (onComplete) onComplete(); };
    utterance.onerror = () => { if (onComplete) onComplete(); };

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    setIsSpeaking(false);
    audioQueue.current = []; // Clear the queue immediately
    isPlayingQueue.current = false;
    
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = "";
        audioRef.current = null;
      } catch (e) {}
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  };

  const changeLanguage = (lang) => {
    setSelectedLanguage(lang);
    if (changeAppLanguage) changeAppLanguage(lang);
  };

  return (
    <VoiceContext.Provider value={{ 
      isListening, 
      isSpeaking, 
      currentTranscript, 
      chatHistory, 
      selectedLanguage,
      changeLanguage,
      startListening, 
      stopListening,
      stopSpeaking
    }}>
      {children}
    </VoiceContext.Provider>
  );
};
