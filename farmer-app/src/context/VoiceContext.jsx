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

  const handleUserMessage = async (text) => {
    setCurrentTranscript('');
    setChatHistory(prev => [...prev, { role: 'user', text }]);
    
    try {
      // Send to Backend AI Intent Router
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
      
      const data = await response.json();
      
      // Update context for next turn (e.g. if awaiting crop selection)
      if (data.context) {
        conversationContext.current = data.context;
      } else {
        conversationContext.current = {}; // reset
      }

      const replyLang = data.language || selectedLanguage;
      if (data.language && data.language !== selectedLanguage) {
        setSelectedLanguage(data.language);
        if (changeAppLanguage) changeAppLanguage(data.language);
      }

      setChatHistory(prev => [...prev, { 
        role: 'ai', 
        text: data.reply, 
        lang: replyLang,
        action: data.action,
        cropType: data.cropType,
        delayedScan: data.delayedScan
      }]);
      speak(data.reply, replyLang);

      // Execute Action
      if (data.action === 'OPEN_CAMERA') {
        setTimeout(() => {
          // Fallback to window.location since VoiceContext is outside Router
          window.location.href = '/scanner'; 
        }, 1500); // Wait for the bot to finish speaking
      }

    } catch (error) {
      console.error(error);
      const fallbackReply = "Sorry, I am having trouble connecting to the network.";
      setChatHistory(prev => [...prev, { role: 'ai', text: fallbackReply, lang: selectedLanguage }]);
      speak(fallbackReply, selectedLanguage);
    }
  };

  const audioRef = useRef(null);

  const speak = (text, lang) => {
    const targetLang = lang || selectedLanguage;

    // Stop any existing audio or synthesis
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current = null;
      } catch (e) {}
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }

    setIsSpeaking(true);

    // Primary High-Fidelity Audio Streamer (Supports natural Telugu, Marathi, Hindi, English natively)
    try {
      const audioUrl = `http://localhost:5000/api/voice/tts?lang=${encodeURIComponent(targetLang)}&text=${encodeURIComponent(text)}`;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => {
        // Fallback to browser SpeechSynthesis if audio fetch fails
        playBrowserSynthesis(text, targetLang);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Audio element play error, falling back to SpeechSynthesis:", err);
          playBrowserSynthesis(text, targetLang);
        });
      }
    } catch (err) {
      playBrowserSynthesis(text, targetLang);
    }
  };

  const playBrowserSynthesis = (text, targetLang) => {
    if (!synthRef.current) {
      setIsSpeaking(false);
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetLang;
    utterance.rate = 0.9;

    try {
      const voices = synthRef.current.getVoices ? synthRef.current.getVoices() : [];
      if (voices && voices.length > 0) {
        const langPrefix = targetLang.split('-')[0].toLowerCase();
        let matchedVoice = voices.find(v => v.lang && v.lang.toLowerCase() === targetLang.toLowerCase());
        if (!matchedVoice) {
          matchedVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith(langPrefix));
        }
        if (matchedVoice) utterance.voice = matchedVoice;
      }
    } catch (e) {}

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
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
      stopListening 
    }}>
      {children}
    </VoiceContext.Provider>
  );
};
